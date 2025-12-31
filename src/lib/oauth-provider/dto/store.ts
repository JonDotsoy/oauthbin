import type { Client } from "./client";
import type { Code } from "./code";
import type { Token } from "./token";

export interface Store {
    putClient(client: Client): Promise<Client>;
    getClient(client_id: string): Promise<Client>;
    deleteClient(client_id: string): Promise<void>;
    listClients(): AsyncGenerator<Client>;

    putCode(code: Code): Promise<Code>;
    getCode(code_id: string): Promise<Code>;
    deleteCode(code_id: string): Promise<void>;
    listCodes(): AsyncGenerator<Code>;

    putToken(token: Token): Promise<Token>;
    getToken(access_token: string): Promise<Token>;
    getTokenByRefreshToken(refresh_token: string): Promise<Token>;
    deleteToken(access_token: string): Promise<void>;
    listTokens(): AsyncGenerator<Token>;
}
