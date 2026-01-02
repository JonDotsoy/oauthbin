# Mock OAuth Provider

Un servidor OAuth 2.0 completo y fácil de configurar, construido con Astro y Astro DB. Ideal para desarrollo, testing y prototipado rápido de aplicaciones que requieren autenticación OAuth.

## 🚀 Características

- ✅ Soporte completo para OAuth 2.0
- ✅ Múltiples flujos de autenticación (Authorization Code, Implicit, Password Credentials, Client Credentials)
- ✅ Soporte PKCE (Proof Key for Code Exchange) para mayor seguridad
- ✅ Base de datos integrada con Astro DB
- ✅ API REST lista para usar
- ✅ Configuración mínima requerida

## 📋 Requisitos

- Node.js 24.12.0 o superior
- Bun (opcional, recomendado)

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd repositories-jondotsoy-mock-oauth-provider

# Instalar dependencias
npm install
# o con bun
bun install

# Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:4321`

## 🔑 Cliente por Defecto

Después de ejecutar el seed, tendrás disponible un cliente OAuth con las siguientes credenciales:

- **Client ID**: `default-client-id`
- **Client Secret**: `default-client-secret`

## 📚 Flujos de Autenticación

### 1. Authorization Code Flow

El flujo más común y seguro para aplicaciones web.

#### Paso 1: Solicitar código de autorización

```http
GET http://localhost:4321/authorize?response_type=code&client_id=default-client-id&state=sample&scope=photo&redirect_uri=https%3A%2F%2Fhttpbin.io%2Fget
```

**Parámetros:**
- `response_type`: `code` (requerido)
- `client_id`: ID del cliente OAuth (requerido)
- `state`: Valor aleatorio para prevenir CSRF (recomendado)
- `scope`: Permisos solicitados (opcional)
- `redirect_uri`: URL de callback (requerido, debe estar URL-encoded)
- `code_challenge`: Desafío PKCE (opcional, recomendado para clientes públicos)
- `code_challenge_method`: Método de desafío PKCE: `S256` o `plain` (opcional, por defecto `plain`)

#### Paso 2: Completar autorización

```http
POST http://localhost:4321/api/complete_authorize
Content-Type: application/x-www-form-urlencoded

client_id=default-client-id&redirect_uri=https://httpbin.io/get&scope=photo
```

**Respuesta:** Redirección a la URL de callback con el código:
```
https://httpbin.io/get?code=9564afdc-a6e2-4e41-9c0b-ddcfc0126c61&state=sample
```

#### Paso 3: Intercambiar código por token

```http
POST http://localhost:4321/api/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=9564afdc-a6e2-4e41-9c0b-ddcfc0126c61&redirect_uri=https://httpbin.io/get&client_id=default-client-id&client_secret=default-client-secret
```

**Parámetros:**
- `grant_type`: `authorization_code` (requerido)
- `code`: Código de autorización recibido (requerido)
- `redirect_uri`: Misma URL de callback usada en el paso 1 (requerido)
- `client_id`: ID del cliente OAuth (requerido)
- `client_secret`: Secret del cliente OAuth (requerido)
- `code_verifier`: Verificador PKCE (requerido si se usó `code_challenge`)

**Respuesta:**
```json
{
  "access_token": "uuid-token",
  "token_type": "Bearer",
  "scope": "photo",
  "refresh_token": "uuid-refresh-token"
}
```

#### Authorization Code Flow con PKCE

PKCE (Proof Key for Code Exchange) añade una capa adicional de seguridad, especialmente importante para aplicaciones públicas (SPAs, aplicaciones móviles).

**Paso 1: Generar code_verifier y code_challenge**

```javascript
// Generar code_verifier (string aleatorio de 43-128 caracteres)
const code_verifier = base64URLEncode(crypto.randomBytes(32));

// Generar code_challenge usando SHA-256
const code_challenge = base64URLEncode(sha256(code_verifier));
```

**Paso 2: Solicitar código con PKCE**

```http
GET http://localhost:4321/authorize?response_type=code&client_id=default-client-id&state=sample&scope=photo&redirect_uri=https%3A%2F%2Fhttpbin.io%2Fget&code_challenge=5u4r9H5FOkn0eGH3oDuQJHiWzqBPryHvFqAMIc0wejI&code_challenge_method=S256
```

**Paso 3: Intercambiar código por token con code_verifier**

```http
POST http://localhost:4321/api/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=9564afdc-a6e2-4e41-9c0b-ddcfc0126c61&redirect_uri=https://httpbin.io/get&client_id=default-client-id&client_secret=default-client-secret&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

El servidor verificará que `SHA256(code_verifier)` coincida con el `code_challenge` original.

### 2. Implicit Flow (response_type=token)

Flujo simplificado para aplicaciones de una sola página (SPA) donde el token se devuelve directamente en el fragment de la URL.

#### Paso 1: Solicitar token directamente

```http
GET http://localhost:4321/authorize?response_type=token&client_id=default-client-id&state=sample&scope=photo&redirect_uri=https%3A%2F%2Fhttpbin.io%2Fget
```

**Parámetros:**
- `response_type`: `token` (requerido)
- `client_id`: ID del cliente OAuth (requerido)
- `state`: Valor aleatorio para prevenir CSRF (recomendado)
- `scope`: Permisos solicitados (opcional)
- `redirect_uri`: URL de callback (requerido, debe estar URL-encoded)

#### Paso 2: Completar autorización

Después de autorizar, el usuario será redirigido a:
```
https://httpbin.io/get#access_token=uuid-token&token_type=Bearer&state=sample&scope=photo
```

**Nota:** El token se devuelve en el fragment (#) de la URL, no en los query parameters. Esto significa que el token no se envía al servidor en la petición HTTP.

### 3. Password Credentials Flow

Para aplicaciones de confianza donde el usuario proporciona sus credenciales directamente.

```http
POST http://localhost:4321/api/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&scope=photo&client_id=default-client-id&client_secret=default-client-secret
```

**Respuesta:**
```json
{
  "access_token": "uuid-token",
  "token_type": "Bearer",
  "scope": "default",
  "refresh_token": "uuid-refresh-token"
}
```

### 4. Client Credentials Flow

Para autenticación máquina-a-máquina sin usuario final.

```http
POST http://localhost:4321/api/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=photo&client_id=default-client-id&client_secret=default-client-secret
```

**Respuesta:**
```json
{
  "access_token": "uuid-token",
  "token_type": "Bearer",
  "scope": "default",
  "refresh_token": "uuid-refresh-token"
}
```

### 5. Refresh Token Flow

Para renovar un token de acceso expirado.

```http
POST http://localhost:4321/api/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=uuid-refresh-token
```

**Respuesta:**
```json
{
  "access_token": "new-uuid-token",
  "token_type": "Bearer",
  "scope": "photo",
  "refresh_token": "new-uuid-refresh-token"
}
```

## 🗄️ Estructura de la Base de Datos

El proyecto utiliza Astro DB con las siguientes tablas:

- **OAuthClients**: Almacena clientes OAuth registrados
- **OAuthCodes**: Códigos de autorización temporales
- **OAuthTokens**: Tokens de acceso y refresh tokens
- **ResolutionCodes**: Códigos de resolución con expiración

## 🏗️ Estructura del Proyecto

```
├── db/
│   ├── config.ts          # Configuración de Astro DB
│   └── seed.ts            # Datos iniciales (cliente por defecto)
├── src/
│   ├── lib/
│   │   └── oauth-provider/
│   │       ├── dto/       # Tipos TypeScript
│   │       ├── stores/    # Implementaciones de almacenamiento
│   │       └── oauth-provider.ts  # Lógica principal OAuth
│   └── pages/
│       ├── api/
│       │   ├── complete_authorize.ts
│       │   └── token.ts
│       ├── authorize.astro
│       └── index.astro
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🔧 Configuración

### Variables de Entorno

Actualmente no se requieren variables de entorno. Todas las configuraciones están en el código.

### Personalización

Para crear clientes OAuth adicionales, puedes modificar `db/seed.ts` o usar la API programáticamente:

```typescript
import { OAthProvider } from './src/lib/oauth-provider/oauth-provider';
import { AstroDBStore } from './src/lib/oauth-provider/stores/astro-db';

const provider = new OAthProvider({ db: new AstroDBStore() });
const client = await provider.generateClient();
```

## 🚀 Despliegue

```bash
# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

El proyecto usa el adaptador Node.js en modo standalone, por lo que puede desplegarse en cualquier servidor que soporte Node.js.

## 🧪 Testing

El proyecto incluye tests para los componentes principales:

```bash
# Ejecutar tests (si están configurados)
npm test
```

## 📝 Notas de Seguridad

⚠️ **Este es un servidor OAuth para desarrollo y testing**. No está diseñado para producción sin las siguientes mejoras:

- Implementar validación de usuarios real
- Agregar HTTPS obligatorio
- Implementar rate limiting
- Agregar validación de redirect_uri contra whitelist
- Implementar expiración de tokens
- Agregar logging y auditoría
- ✅ ~~Implementar PKCE para flujos públicos~~ (Ya implementado)

## 📄 Licencia

[Especificar licencia]

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📧 Contacto

[Información de contacto]
