import { Database } from "bun:sqlite"
import type { Store } from "../dto/store"
import type { Client } from "../dto/client"
import type { Code } from "../dto/code"
import type { Token } from "../dto/token"

interface SQLiteOptions {
    path?: string
}

export class SQLite implements Store {
    #db: Database;

    constructor(options?: SQLiteOptions) {
        this.#db = new Database(options?.path || ":memory:")
        this.#setup()
    }

    #setup() {
        this.#db.run(`
            CREATE TABLE IF NOT EXISTS clients (
                client_id TEXT PRIMARY KEY,
                client_secret TEXT NOT NULL
            )
        `)

        this.#db.run(`
            CREATE TABLE IF NOT EXISTS codes (
                code_id TEXT PRIMARY KEY,
                client_id TEXT NOT NULL,
                callback_url TEXT NOT NULL,
                scope TEXT NOT NULL,
                FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE
            )
        `)

        this.#db.run(`
            CREATE TABLE IF NOT EXISTS tokens (
                access_token TEXT PRIMARY KEY,
                token_type TEXT NOT NULL,
                scope TEXT NOT NULL,
                refresh_token TEXT NOT NULL
            )
        `)
    }


    async putClient(client: Client): Promise<Client> {
        const stmt = this.#db.prepare(`
            INSERT OR REPLACE INTO clients (client_id, client_secret)
            VALUES (?, ?)
        `)
        
        stmt.run(client.client_id, client.client_secret)
        
        return client
    }

    async getClient(client_id: string): Promise<Client> {
        const stmt = this.#db.prepare(`
            SELECT client_id, client_secret FROM clients WHERE client_id = ?
        `)
        
        const result = stmt.get(client_id) as Client | undefined
        
        if (!result) {
            throw new Error(`Client not found: ${client_id}`)
        }
        
        return result
    }

    async deleteClient(client_id: string): Promise<void> {
        const stmt = this.#db.prepare(`
            DELETE FROM clients WHERE client_id = ?
        `)
        
        stmt.run(client_id)
    }

    async *listClients(): AsyncGenerator<Client> {
        const stmt = this.#db.prepare(`
            SELECT client_id, client_secret FROM clients
        `)
        
        const results = stmt.all() as Client[]
        
        for (const client of results) {
            yield client
        }
    }

    async putCode(code: Code): Promise<Code> {
        const stmt = this.#db.prepare(`
            INSERT OR REPLACE INTO codes (code_id, client_id, callback_url, scope)
            VALUES (?, ?, ?, ?)
        `)
        
        stmt.run(code.code_id, code.client_id, code.callback_url, code.scope)
        
        return code
    }

    async getCode(code_id: string): Promise<Code> {
        const stmt = this.#db.prepare(`
            SELECT code_id, client_id, callback_url, scope FROM codes WHERE code_id = ?
        `)
        
        const result = stmt.get(code_id) as Code | undefined
        
        if (!result) {
            throw new Error(`Code not found: ${code_id}`)
        }
        
        return result
    }

    async deleteCode(code_id: string): Promise<void> {
        const stmt = this.#db.prepare(`
            DELETE FROM codes WHERE code_id = ?
        `)
        
        stmt.run(code_id)
    }

    async *listCodes(): AsyncGenerator<Code> {
        const stmt = this.#db.prepare(`
            SELECT code_id, client_id, callback_url, scope FROM codes
        `)
        
        const results = stmt.all() as Code[]
        
        for (const code of results) {
            yield code
        }
    }

    async putToken(token: Token): Promise<Token> {
        const stmt = this.#db.prepare(`
            INSERT OR REPLACE INTO tokens (access_token, token_type, scope, refresh_token)
            VALUES (?, ?, ?, ?)
        `)
        
        stmt.run(token.access_token, token.token_type, token.scope, token.refresh_token)
        
        return token
    }

    async getToken(access_token: string): Promise<Token> {
        const stmt = this.#db.prepare(`
            SELECT access_token, token_type, scope, refresh_token FROM tokens WHERE access_token = ?
        `)
        
        const result = stmt.get(access_token) as Token | undefined
        
        if (!result) {
            throw new Error(`Token not found: ${access_token}`)
        }
        
        return result
    }

    async getTokenByRefreshToken(refresh_token: string): Promise<Token> {
        const stmt = this.#db.prepare(`
            SELECT access_token, token_type, scope, refresh_token FROM tokens WHERE refresh_token = ?
        `)
        
        const result = stmt.get(refresh_token) as Token | undefined
        
        if (!result) {
            throw new Error(`Token not found for refresh_token: ${refresh_token}`)
        }
        
        return result
    }

    async deleteToken(access_token: string): Promise<vo
        const stmt = this.#db.prepare(`
            DELETE FROM tokens WHERE access_token = ?
        `)
        
        stmt.run(access_token)
    }

    async *listTokens(): AsyncGenerator<Token> {
        const stmt = this.#db.prepare(`
            SELECT access_token, token_type, scope, refresh_token FROM tokens
        `)
        
        const results = stmt.all() as Token[]
        
        for (const token of results) {
            yield token
        }
    }
}