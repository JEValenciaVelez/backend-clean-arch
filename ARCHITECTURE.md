# Arquitectura

Este proyecto sigue **Clean Architecture**. La regla de dependencia es única:
_las dependencias apuntan siempre hacia dentro_. El dominio no conoce frameworks,
ni base de datos, ni HTTP.

```
        ┌─────────────────────────────────────────────┐
        │                 DOMAIN                       │  ← núcleo puro
        │  entities · value-objects · ports · errors   │
        └───────────────▲─────────────────────────────┘
                        │
        ┌───────────────┴─────────────────────────────┐
        │               APPLICATION                    │
        │  use-cases · dtos · ports de servicios        │
        └───────────────▲─────────────────────────────┘
                        │
        ┌───────────────┴───────────────┬─────────────┐
        │        INFRASTRUCTURE          │ PRESENTATION│
        │  prisma/in-memory · redis      │ express     │
        │  pino · scrypt · jwt · env     │ controllers │
        └────────────────────────────────┴─────────────┘
                        │
                 COMPOSITION ROOT (DI container)
```

## Capas

### `src/domain`
Entidades, value objects, errores de negocio y **puertos** (interfaces) de
repositorios. Sin dependencias externas: solo TypeScript.

- `entities/Profile.ts` — agregado raíz.
- `value-objects/Email.ts`, `PhoneNumber.ts` — validación inmutable.
- `errors/DomainError.ts` — errores de negocio con `code` i18n y status HTTP.
- `repositories/IProfileRepository.ts` — puerto de persistencia.

### `src/application`
Casos de uso y puertos de servicios técnicos. Depende **solo** del dominio.

- `use-cases/auth/LoginUseCase.ts` — orquestación pura.
- `ports/` — `IHashService`, `ITokenService`, `ICacheService`, `ILogger`.
- `dtos/auth/LoginDto.ts` — validación de entrada y forma de salida.

### `src/infrastructure`
Implementaciones concretas de los puertos.

- `config/env.ts` — validación de variables de entorno con Zod.
- `logging/PinoLogger.ts` — Pino + Axiom (con redacción de campos sensibles).
- `services/ScryptHashService.ts` — hashing con `scrypt` nativo.
- `services/JwtTokenService.ts` — JWT HS256 sin dependencias.
- `services/RedisCacheService.ts` — caché con *fallback* a memoria.
- `persistence/in-memory/` — repositorio en memoria + seed (B1).

### `src/presentation`
Adaptadores de entrada (HTTP/Express).

- `container/container.ts` — **composition root**: único lugar que conoce las
  implementaciones concretas y ensambla el grafo.
- `http/isect.ts` — adapta un `Controller` a un handler de Express.
- `http/response.ts` — envelope estándar `{ data, meta? }`.
- `http/errors/errorHandler.ts` — traduce errores a respuestas HTTP + i18n.
- `http/routes/` — definición de rutas versionadas.
- `http/controllers/` — controladores finos.

### `src/shared`
Código transversal sin reglas de negocio: constantes, i18n, validación,
contexto de request.

## Flujo de una petición

```
HTTP → route → isect(controller) → validate(DTO) → use-case → repository (puerto)
                                              ↓
                                         errorHandler → respuesta HTTP + i18n
```

### Secuencia: login exitoso

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente
    participant E as Express (server.ts)
    participant L as languageMiddleware
    participant R as Router (/admin/auth/login)
    participant I as isect
    participant Ct as LoginController
    participant U as LoginUseCase
    participant Repo as IProfileRepository
    participant Hash as IHashService
    participant Tok as ITokenService
    participant Res as response

    C->>E: POST /api/v1/admin/auth/login { cellphone, password, country }
    E->>L: resuelve idioma y crea req.translate
    L->>R: next()
    R->>I: handler(req, res, next)
    I->>I: genera requestId + abre AsyncLocalStorage
    I->>Ct: controller(req, res, next)
    Ct->>Ct: validate(loginSchema, req.body)
    Ct->>U: execute(input)
    U->>U: new PhoneNumber(country, cellphone)
    U->>Repo: findByPhone(phone)
    Repo-->>U: Profile | null
    U->>Hash: compare(password, passwordHash)
    Hash-->>U: true
    U->>Tok: sign({ sub: userId })
    Tok-->>U: token
    U-->>Ct: { token, user }
    Ct-->>I: ILoginOutput
    I->>Res: response(res, req)(data)
    Res-->>C: 200 { data, meta? } + headers request-id / timestamp
```

### Secuencia: error de negocio

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente
    participant I as isect
    participant U as LoginUseCase
    participant EH as errorHandler
    participant T as req.translate (i18n)
    participant Log as ILogger

    C->>I: POST /api/v1/admin/auth/login
    I->>U: execute(input)
    U--x I: throw InvalidCredentialsError (code: invalid.credentials, 401)
    I->>EH: next(error)
    EH->>EH: ¿es AppError? conserva status + code
    EH->>T: translate(code)
    T-->>EH: mensaje traducido (es/en)
    EH->>Log: error(...)  (solo si es 5xx o inesperado)
    EH-->>C: 401 { error: { code, message } }
```

### Composition root: quién construye a quién

```mermaid
flowchart LR
    M[main.ts] --> CC[createContainer]

    CC --> Log[PinoLogger]
    CC --> Cache[RedisCacheService]
    CC --> Hash[ScryptHashService]
    CC --> Tok[JwtTokenService]
    CC --> Repo[InMemoryProfileRepository]

    CC --> UC[LoginUseCase]
    UC -.puerto.-> IRepo[IProfileRepository]
    UC -.puerto.-> IHash[IHashService]
    UC -.puerto.-> ITok[ITokenService]

    Repo -.implementa.-> IRepo
    Hash -.implementa.-> IHash
    Tok -.implementa.-> ITok
```

## Cómo cambiar la persistencia

Toda la persistencia se inyecta en `src/presentation/container/container.ts`.
Para migrar de memoria a Prisma basta con crear un `PrismaProfileRepository`
que implemente `IProfileRepository` y cambiar **una línea** en el container.

## Testing

- `tests/unit/` — casos de uso con fakes (sin HTTP ni BD).
- `tests/e2e/` — rutas con `supertest` contra un container real.
