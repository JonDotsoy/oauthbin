import { describe, it, expect, afterEach, setSystemTime } from "bun:test";
import { CodeEncoder, CodeDecoder } from "./code-tools";

describe("CodeEncoder", () => {
    it("should encode code and redirectUri", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        const encoded = await CodeEncoder.encode(code, redirectUri);

        expect(encoded).toBeDefined();
        expect(typeof encoded).toBe("string");
        expect(encoded.length).toBeGreaterThan(0);
    });

    it("should generate different encoded strings for same input", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        const encoded1 = await CodeEncoder.encode(code, redirectUri);
        const encoded2 = await CodeEncoder.encode(code, redirectUri);

        // Deben ser diferentes debido al IV aleatorio
        expect(encoded1).not.toBe(encoded2);
    });

    it("should generate URL-safe base64 string", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        const encoded = await CodeEncoder.encode(code, redirectUri);

        // No debe contener caracteres no URL-safe
        expect(encoded).not.toMatch(/[+/=]/);
    });
});

describe("CodeDecoder", () => {
    afterEach(() => {
        setSystemTime();
    });

    it("should decode encoded data correctly", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        const encoded = await CodeEncoder.encode(code, redirectUri);
        const decoder = new CodeDecoder();
        const decoded = await decoder.decode(encoded);

        expect(decoded.code).toBe(code);
        expect(decoded.redirectUri).toBe(redirectUri);
    });

    it("should throw error for invalid encoded string", async () => {
        const decoder = new CodeDecoder();

        expect(decoder.decode("invalid-string")).rejects.toThrow(
            "Invalid or expired code"
        );
    });

    it("should throw error for expired code", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        // Crear código en el pasado
        const pastTime = new Date(Date.now() - 11 * 60 * 1000); // 11 minutos atrás
        setSystemTime(pastTime);
        const encoded = await CodeEncoder.encode(code, redirectUri);
        
        // Volver al presente
        setSystemTime();

        const decoder = new CodeDecoder();
        expect(decoder.decode(encoded)).rejects.toThrow(
            "Invalid or expired code"
        );
    });

    it("should accept code within expiration time", async () => {
        const code = "test-code-123";
        const redirectUri = "https://example.com/callback";

        const now = new Date();
        setSystemTime(now);
        const encoded = await CodeEncoder.encode(code, redirectUri);
        
        // Simular 5 minutos después
        const futureTime = new Date(now.getTime() + 5 * 60 * 1000);
        setSystemTime(futureTime);

        const decoder = new CodeDecoder();
        const decoded = await decoder.decode(encoded);

        expect(decoded.code).toBe(code);
        expect(decoded.redirectUri).toBe(redirectUri);
    });
});

describe("CodeEncoder and CodeDecoder integration", () => {
    it("should handle special characters in code and redirectUri", async () => {
        const code = "code-with-special-chars!@#$%^&*()";
        const redirectUri = "https://example.com/callback?param=value&other=123";

        const encoded = await CodeEncoder.encode(code, redirectUri);
        const decoder = new CodeDecoder();
        const decoded = await decoder.decode(encoded);

        expect(decoded.code).toBe(code);
        expect(decoded.redirectUri).toBe(redirectUri);
    });

    it("should handle long strings", async () => {
        const code = "a".repeat(1000);
        const redirectUri = "https://example.com/callback?" + "param=value&".repeat(100);

        const encoded = await CodeEncoder.encode(code, redirectUri);
        const decoder = new CodeDecoder();
        const decoded = await decoder.decode(encoded);

        expect(decoded.code).toBe(code);
        expect(decoded.redirectUri).toBe(redirectUri);
    });

    it("should handle unicode characters", async () => {
        const code = "código-测试-🔐";
        const redirectUri = "https://example.com/callback?name=José";

        const encoded = await CodeEncoder.encode(code, redirectUri);
        const decoder = new CodeDecoder();
        const decoded = await decoder.decode(encoded);

        expect(decoded.code).toBe(code);
        expect(decoded.redirectUri).toBe(redirectUri);
    });
});
