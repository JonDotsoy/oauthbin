import { describe, test, expect } from "bun:test"
import { OAthProvider } from "./oauth-provider"
import { SQLite } from "./stores/sqlite"
import type { Client } from "./dto/client"

test("test1", async () => {
    const callback_url = "http://example/"
    const scope = "photo"

    const provider = new OAthProvider({
        db: new SQLite()
    })

    const client: Client = await provider.generateClient()
    const client_id = client.client_id;
    const client_secret = client.client_secret;

    const code = await provider.generateCode(client_id, callback_url, scope)

    const redirect_uri = callback_url;

    const token = await provider.resolveCode(code, redirect_uri, client_id, client_secret)
})