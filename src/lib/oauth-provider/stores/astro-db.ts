import { db, OAuthClients, OAuthCodes, OAuthTokens, eq } from "astro:db"
import type { Store } from "../dto/store"
import type { Client } from "../dto/client"
import type { Code } from "../dto/code"
import type { Token } from "../dto/token"

export class AstroDb implements Store {
    // Client methods
    async putClient(client: Client): Promise<Client> {
        await db.insert(OAuthClients).values({
            client_id: client.client_id,
            client_secret: client.client_secret
        }).onConflictDoUpdate({
            target: OAuthClients.client_id,
            set: {
                client_secret: client.client_secret
            }
        })
        
        return client
    }

    async getClient(client_id: string): Promise<Client> {
        const result = await db
            .select()
            .from(OAuthClients)
            .where(eq(OAuthClients.client_id, client_id))
            .get()
        
        if (!result) {
            throw new Error(`Client not found: ${client_id}`)
        }
        
        return {
            client_id: result.client_id,
            client_secret: result.client_secret
        }
    }

    async deleteClient(client_id: string): Promise<void> {
        await db
            .delete(OAuthClients)
            .where(eq(OAuthClients.client_id, client_id))
    }

    async *listClients(): AsyncGenerator<Client> {
        const results = await db.select().from(OAuthClients).all()
        
        for (const result of results) {
            yield {
                client_id: result.client_id,
                client_secret: result.client_secret
            }
        }
    }

    // Code methods
    async putCode(code: Code): Promise<Code> {
        await db.insert(OAuthCodes).values({
            code_id: code.code_id,
            client_id: code.client_id,
            callback_url: code.callback_url,
            scope: code.scope
        }).onConflictDoUpdate({
            target: OAuthCodes.code_id,
            set: {
                client_id: code.client_id,
                callback_url: code.callback_url,
                scope: code.scope
            }
        })
        
        return code
    }

    async getCode(code_id: string): Promise<Code> {
        const result = await db
            .select()
            .from(OAuthCodes)
            .where(eq(OAuthCodes.code_id, code_id))
            .get()
        
        if (!result) {
            throw new Error(`Code not found: ${code_id}`)
        }
        
        return {
            code_id: result.code_id,
            client_id: result.client_id,
            callback_url: result.callback_url,
            scope: result.scope
        }
    }

    async deleteCode(code_id: string): Promise<void> {
        await db
            .delete(OAuthCodes)
            .where(eq(OAuthCodes.code_id, code_id))
    }

    async *listCodes(): AsyncGenerator<Code> {
        const results = await db.select().from(OAuthCodes).all()
        
        for (const result of results) {
            yield {
                code_id: result.code_id,
                client_id: result.client_id,
                callback_url: result.callback_url,
                scope: result.scope
            }
        }
    }

    // Token methods
    async putToken(token: Token): Promise<Token> {
        await db.insert(OAuthTokens).values({
            access_token: token.access_token,
            token_type: token.token_type,
            scope: token.scope,
            refresh_token: token.refresh_token
        }).onConflictDoUpdate({
            target: OAuthTokens.access_token,
            set: {
                token_type: token.token_type,
                scope: token.scope,
                refresh_token: token.refresh_token
            }
        })
        
        return token
    }

    async getToken(access_token: string): Promise<Token> {
        const result = await db
            .select()
            .from(OAuthTokens)
            .where(eq(OAuthTokens.access_token, access_token))
            .get()
        
        if (!result) {
            throw new Error(`Token not found: ${access_token}`)
        }
        
        return {
            access_token: result.access_token,
            token_type: result.token_type,
            scope: result.scope,
            refresh_token: result.refresh_token
        }
    }

    async getTokenByRefreshToken(refresh_token: string): Promise<Token> {
        const result = await db
            .select()
            .from(OAuthTokens)
            .where(eq(OAuthTokens.refresh_token, refresh_token))
            .get()
        
        if (!result) {
            throw new Error(`Token not found for refresh_token: ${refresh_token}`)
        }
        
        return {
            access_token: result.access_token,
            token_type: result.token_type,
            scope: result.scope,
            refresh_token: result.refresh_token
        }
    }

    async deleteToken(access_token: string): Promise<void> {
        await db
            .delete(OAuthTokens)
            .where(eq(OAuthTokens.access_token, access_token))
    }

    async *listTokens(): AsyncGenerator<Token> {
        const results = await db.select().from(OAuthTokens).all()
        
        for (const result of results) {
            yield {
                access_token: result.access_token,
                token_type: result.token_type,
                scope: result.scope,
                refresh_token: result.refresh_token
            }
        }
    }
}
