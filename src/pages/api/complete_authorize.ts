import type { APIRoute } from "astro";
import { oauth } from "../../lib/oauth";
import { httpRequestsTotal, httpRequestDuration, oauthErrorsTotal, authCodesGeneratedTotal, tokensGeneratedTotal } from "../../components/stores/metric";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const startTime = Date.now();
    let statusCode = 200;
    
    try {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const response_type = formData.get("response_type") as string;
        const client_id = formData.get("client_id") as string;
        const scope = formData.get("scope") as string;
        const state = formData.get("state") as string;
        const redirect_uri = formData.get("redirect_uri") as string;
        const code_challenge = formData.get("code_challenge") as string | null;
        const code_challenge_method = formData.get("code_challenge_method") as string | null;
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

            statusCode = 400;
            oauthErrorsTotal.inc({ error_type: 'invalid_request', endpoint: '/api/complete_authorize' });
            
            return new Response(
                JSON.stringify({
                    error: "invalid_request",
                    error_description: `Missing required fields: ${missingFields.join(", ")}`,
                }),
                {
                    status: statusCode,
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
            tokensGeneratedTotal.inc({ grant_type: 'implicit', client_id });
            
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
            
            statusCode = 302;
            return Response.redirect(redirectUrl.toString(), statusCode);
        }

        // Flujo de código de autorización (response_type=code)
        const code = await oauth.generateCode(
            client_id, 
            redirect_uri, 
            scope,
            code_challenge || undefined,
            code_challenge_method || undefined
        );
        
        authCodesGeneratedTotal.inc({ client_id, response_type });

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
        statusCode = 302;
        return Response.redirect(redirectUrl.toString(), statusCode);
    } catch (error) {
        console.error("Error processing the request:", error);
        statusCode = 500;
        oauthErrorsTotal.inc({ error_type: 'server_error', endpoint: '/api/complete_authorize' });
        
        return new Response(
            JSON.stringify({
                error: "server_error",
                error_description: "An error occurred processing the request",
            }),
            {
                status: statusCode,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } finally {
        const duration = (Date.now() - startTime) / 1000;
        httpRequestsTotal.inc({ method: 'POST', endpoint: '/api/complete_authorize', status: statusCode.toString() });
        httpRequestDuration.observe({ method: 'POST', endpoint: '/api/complete_authorize', status: statusCode.toString() }, duration);
    }
};
