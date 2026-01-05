import type { APIRoute } from "astro";
import { register } from "../../components/stores/metric";

export const GET: APIRoute = async () => new Response(await register.metrics(), {
    headers: {
        'Content-Type': register.contentType,
    }
})
