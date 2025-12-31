const SECRET_KEY = "your-secret-key-change-this-in-production-32-chars!!";

export class CodeEncoder {
    static async encode(code: string, redirectUri: string): Promise<string> {
        const data = JSON.stringify({ code, redirectUri, timestamp: Date.now() });
        
        // Generar IV aleatorio
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Importar clave
        const keyData = new TextEncoder().encode(SECRET_KEY);
        const key = await crypto.subtle.importKey(
            "raw",
            keyData.slice(0, 32),
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );
        
        // Encriptar
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            new TextEncoder().encode(data)
        );
        
        // Combinar IV + datos encriptados
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        // Convertir a base64 URL-safe
        return this.arrayBufferToBase64Url(combined);
    }

    private static arrayBufferToBase64Url(buffer: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < buffer.length; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
}

export class CodeDecoder {
    async decode(sign: string): Promise<{ code: string; redirectUri: string }> {
        try {
            // Restaurar padding de base64
            let base64 = sign.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            
            // Decodificar de base64
            const combined = this.base64ToArrayBuffer(base64);
            
            // Extraer IV y datos encriptados
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            
            // Importar clave
            const keyData = new TextEncoder().encode(SECRET_KEY);
            const key = await crypto.subtle.importKey(
                "raw",
                keyData.slice(0, 32),
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );
            
            // Desencriptar
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                encrypted
            );
            
            // Parsear JSON
            const jsonData = new TextDecoder().decode(decrypted);
            const data = JSON.parse(jsonData);
            
            // Validar timestamp (código válido por 10 minutos)
            const now = Date.now();
            const age = now - data.timestamp;
            if (age > 10 * 60 * 1000) {
                throw new Error("Code expired");
            }
            
            return {
                code: data.code,
                redirectUri: data.redirectUri,
            };
        } catch (error) {
            throw new Error("Invalid or expired code");
        }
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}
