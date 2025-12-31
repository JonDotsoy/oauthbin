import type { APIRoute } from "astro";
import { oauth } from "../../lib/oauth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const response_type = formData.get("response_type") as string;
        const client_id = formData.get("client_id") as string;
        const scope = formData.get("scope") as string;
        const state = formData.get("state") as string;
        const redirect_uri = formData.get("redirect_uri") as string;
        const debug = ["on","true","1"].includes(formData.get("debug")?.toString().toLowerCase()!);

        // Validar que todos los campos requeridos estén presentes
        if (!username || !response_type || !client_id || !scope || !state || !redirect_uri) {
            const missingFields = [];
            if (!username) missingFields.push("username");
            if (!response_type) missingFields.push("response_type");
            if (!client_id) missingFields.push("client_id");
            if (!scope) missingFields.push("scope");
            if (!state) missingFields.push("state");
            if (!redirect_uri) missingFields.push("redirect_uri");

            return new Response(
                JSON.stringify({
                    error: "invalid_request",
                    error_description: `Missing required fields: ${missingFields.join(", ")}`,
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        // // Validar que el cliente existe
        // try {
        //     await oauth.getClient(client_id);
        // } catch (error) {
        //     return new Response(
        //         JSON.stringify({
        //             error: "invalid_client",
        //             error_description: "Client not found",
        //         }),
        //         {
        //             status: 400,
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //         }
        //     );
        // }

        const redirectUrl = new URL(redirect_uri);

        // Manejar flujo implícito (response_type=token)
        if (response_type === "token") {
            // Generar token directamente
            const token = await oauth.generateToken(client_id, scope);
            
            // En el flujo implícito, el token se devuelve en el fragment (#) de la URL
            redirectUrl.hash = new URLSearchParams({
                access_token: token.access_token,
                token_type: token.token_type,
                state: state,
                scope: token.scope,
            }).toString();

            if (debug) return Response.json({
                access_token: token.access_token,
                token_type: token.token_type,
                state: state,
                scope: token.scope,
                redirectUrl: redirectUrl.toString(),
                username,
            });
            
            return Response.redirect(redirectUrl.toString(), 302);
        }

        // Flujo de código de autorización (response_type=code)
        const code = await oauth.generateCode(client_id, redirect_uri, scope);

        // Construir URL de redirección con el código y el state
        redirectUrl.searchParams.set("code", code.code_id);
        redirectUrl.searchParams.set("state", state);

        if (debug) return Response.json({
            code: code.code_id,
            state: state,
            redirectUrl: redirectUrl.toString(),
            username,
        });
        
        // Redirigir al callback
        return Response.redirect(redirectUrl.toString(), 302);
    } catch (error) {
        console.error("Error processing the request:", error);
        return new Response(
            JSON.stringify({
                error: "server_error",
                error_description: "An error occurred processing the request",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
};
