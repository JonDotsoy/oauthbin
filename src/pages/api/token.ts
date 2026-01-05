import type { APIRoute } from "astro";
import { CodeDecoder } from "../../lib/code-tools";
import { db, eq, ResolutionCodes } from "astro:db";
import { oauth } from "../../lib/oauth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {

    const formData = await request.formData();
    const grant_type = formData.get("grant_type") as string;
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

        return Response.json(token)
    }

    if (grant_type === 'refresh_token') {
        const token = await oauth.refreshToken(refresh_token);

        return Response.json(token)
    }

    if (grant_type === "password") {
        const token = await oauth.resolveToken(client_id, client_secret);

        return Response.json(token);
    }

    if (grant_type === "client_credentials") {
        const token = await oauth.resolveToken(client_id, client_secret);

        return Response.json(token);
    }

    return new Response(null, { status: 400 })
};
