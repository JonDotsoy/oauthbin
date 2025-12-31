import type { Store } from "./dto/store";
import type { Client } from "./dto/client";
import type { Code } from "./dto/code";
import type { Token } from "./dto/token";

interface OAthProviderOptions {
    db?: Store
}

export class OAthProvider {
    #db: Store;

    constructor(options?: OAthProviderOptions) {
        const db = options?.db

        if (!db) throw new Error("")

        this.#db = db
    }

    async generateClient(): Promise<Client> {
        const client: Client = {
            client_id: crypto.randomUUID(),
            client_secret: crypto.randomUUID()
        }
        
        return await this.#db.putClient(client)
    }

    async generateCode(
        client_id: string, 
        callback_url: string, 
        scope: string,
        code_challenge?: string,
        code_challenge_method?: string
    ): Promise<Code> {
        const code: Code = {
            code_id: crypto.randomUUID(),
            client_id,
            callback_url,
            scope,
            code_challenge,
            code_challenge_method
        }
        
        return await this.#db.putCode(code)
    }

    async generateToken(client_id: string, scope: string): Promise<Token> {
        // Generar token directamente para el flujo implícito
        const token: Token = {
            access_token: crypto.randomUUID(),
            token_type: "Bearer",
            scope: scope,
            refresh_token: crypto.randomUUID()
        }
        
        return await this.#db.putToken(token)
    }

    async resolveCode(
        code_id: string, 
        redirect_uri: string, 
        client_id: string, 
        client_secret: string,
        code_verifier?: string
    ): Promise<Token> {
        // Validar que el código existe en la base de datos
        const storedCode = await this.#db.getCode(code_id)
        
        // Validar que el client_id coincide
        if (storedCode.client_id !== client_id) {
            throw new Error("Invalid client_id")
        }
        
        // Validar que el redirect_uri coincide con el callback_url
        if (storedCode.callback_url !== redirect_uri) {
            throw new Error("Invalid redirect_uri")
        }
        
        // Validar PKCE si se proporcionó code_challenge
        if (storedCode.code_challenge) {
            if (!code_verifier) {
                throw new Error("code_verifier is required for PKCE")
            }
            
            const method = storedCode.code_challenge_method || "plain"
            let computedChallenge: string
            
            if (method === "S256") {
                // SHA-256 hash del code_verifier
                const encoder = new TextEncoder()
                const data = encoder.encode(code_verifier)
                const hashBuffer = await crypto.subtle.digest("SHA-256", data)
                const hashArray = Array.from(new Uint8Array(hashBuffer))
                // Base64url encoding
                computedChallenge = btoa(String.fromCharCode(...hashArray))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '')
            } else if (method === "plain") {
                computedChallenge = code_verifier
            } else {
                throw new Error(`Unsupported code_challenge_method: ${method}`)
            }
            
            if (computedChallenge !== storedCode.code_challenge) {
                throw new Error("Invalid code_verifier")
            }
        }
        
        // Validar las credenciales del cliente
        const client = await this.#db.getClient(client_id)
        if (client.client_secret !== client_secret) {
            throw new Error("Invalid client_secret")
        }
        
        // Eliminar el código (un código solo se puede usar una vez)
        await this.#db.deleteCode(code_id)
        
        // Generar el token de acceso
        const token: Token = {
            access_token: crypto.randomUUID(),
            token_type: "Bearer",
            scope: storedCode.scope,
            refresh_token: crypto.randomUUID()
        }
        
        // Guardar y retornar el token
        return await this.#db.putToken(token)
    }

    async *listClients() {
        yield * this.#db.listClients()
    }
    
    async *listCodes() {
        yield * this.#db.listCodes()
    }

    async *listTokens() {
        yield * this.#db.listTokens()
    }

    async refreshToken(refresh_token: string): Promise<Token> {
        // Buscar el token existente por refresh_token
        let existingToken: Token | null = await this.#db.getTokenByRefreshToken(refresh_token);
                
        if (!existingToken) {
            throw new Error("Invalid refresh_token");
        }
        
        // Eliminar el token anterior
        await this.#db.deleteToken(existingToken.access_token);
        
        // Generar un nuevo token con el mismo scope
        const newToken: Token = {
            access_token: crypto.randomUUID(),
            token_type: "Bearer",
            scope: existingToken.scope,
            refresh_token: crypto.randomUUID()
        };
        
        // Guardar y retornar el nuevo token
        return await this.#db.putToken(newToken);
    }

    async resolveToken(client_id: string, client_secret: string): Promise<Token> {
        // Validar las credenciales del cliente
        const client = await this.#db.getClient(client_id);
        
        if (client.client_secret !== client_secret) {
            throw new Error("Invalid client_secret");
        }
        
        // Generar el token de acceso directamente (password grant / client credentials)
        const token: Token = {
            access_token: crypto.randomUUID(),
            token_type: "Bearer",
            scope: "default", // Scope por defecto para password grant
            refresh_token: crypto.randomUUID()
        };
        
        // Guardar y retornar el token
        return await this.#db.putToken(token);
    }
}
