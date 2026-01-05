import { collectDefaultMetrics, Registry, Counter, Histogram } from "prom-client"

export const register = new Registry()

collectDefaultMetrics({ register })

// Contador de requests HTTP por endpoint y método
export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total de requests HTTP',
    labelNames: ['method', 'endpoint', 'status'],
    registers: [register]
})

// Histograma de duración de requests
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de requests HTTP en segundos',
    labelNames: ['method', 'endpoint', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register]
})

// Contador de errores OAuth
export const oauthErrorsTotal = new Counter({
    name: 'oauth_errors_total',
    help: 'Total de errores OAuth',
    labelNames: ['error_type', 'endpoint'],
    registers: [register]
})

// Contador de tokens generados
export const tokensGeneratedTotal = new Counter({
    name: 'oauth_tokens_generated_total',
    help: 'Total de tokens generados',
    labelNames: ['grant_type', 'client_id'],
    registers: [register]
})

// Contador de códigos de autorización generados
export const authCodesGeneratedTotal = new Counter({
    name: 'oauth_auth_codes_generated_total',
    help: 'Total de códigos de autorización generados',
    labelNames: ['client_id', 'response_type'],
    registers: [register]
})