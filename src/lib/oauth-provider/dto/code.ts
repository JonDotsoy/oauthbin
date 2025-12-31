export interface Code {
    code_id: string;
    client_id: string;
    callback_url: string;
    scope: string;
    code_challenge?: string;
    code_challenge_method?: string;
}
