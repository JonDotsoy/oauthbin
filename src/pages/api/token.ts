import type { APIRoute } from "astro";
import { CodeDecoder } from "../../lib/code-tools";
import { db, eq, ResolutionCodes } from "astro:db";
import { oauth } from "../../lib/oauth";
import { httpRequestsTotal, httpRequestDuration, oauthErrorsTotal, tokensGeneratedTotal } from "../../components/stores/metric";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const startTime = Date.now();
    let statusCode = 200;
    let grantType = 'unknown';

    try {
        const formData = await request.formData();
        const grant_type = formData.get("grant_type") as string;
        grantType = grant_type || 'unknown';
        const client_id = formData.get("client_id") as string;
        const client_secret = formData.get("client_secret") as string;
        const redirect_uri = formData.get("redirect_uri") as string;
        const code = formData.get("code") as string;
        const refresh_token = formData.get("refresh_token") as string;
        const code_verifier = formData.get("code_verifier") as string | null;

        // console.error({
        //     grant_type
        //     , client_id
        //     , client_secret
        //     , redirect_uri
        //     , code
        // })

        if (grant_type === 'authorization_code') {
            const token = await oauth.resolveCode(code, redirect_uri, client_id, client_secret, code_verifier || undefined);
            tokensGeneratedTotal.inc({ grant_type, client_id: client_id || 'unknown' });
            return Response.json(token)
        }

        if (grant_type === 'refresh_token') {
            const token = await oauth.refreshToken(refresh_token);
            tokensGeneratedTotal.inc({ grant_type, client_id: 'refresh' });
            return Response.json(token)
        }

        if (grant_type === "password") {
            const token = await oauth.resolveToken(client_id, client_secret);
            tokensGeneratedTotal.inc({ grant_type, client_id: client_id || 'unknown' });
            return Response.json(token);
        }

        if (grant_type === "client_credentials") {
            const token = await oauth.resolveToken(client_id, client_secret);
            tokensGeneratedTotal.inc({ grant_type, client_id: client_id || 'unknown' });
            return Response.json(token);
        }

        statusCode = 400;
        oauthErrorsTotal.inc({ error_type: 'unsupported_grant_type', endpoint: '/api/token' });
        return new Response(null, { status: statusCode })
    } catch (error) {
        console.error("Error processing token request:", error);
        statusCode = 500;
        oauthErrorsTotal.inc({ error_type: 'server_error', endpoint: '/api/token' });
        return new Response(
            JSON.stringify({
                error: "server_error",
                error_description: "An error occurred processing the token request",
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
        httpRequestsTotal.inc({ method: 'POST', endpoint: '/api/token', status: statusCode.toString() });
        httpRequestDuration.observe({ method: 'POST', endpoint: '/api/token', status: statusCode.toString() }, duration);
    }
};
