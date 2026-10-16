# backend-clean-arch

Backend en Node.js + TypeScript + Express organizado con **Clean Architecture**
(arquitectura por capas: Domain / Application / Infrastructure / Presentation).

## Requisitos

- Node.js 20+
- pnpm (recomendado)

## Instalación

```bash
pnpm install
```

## Ejecución

```bash
pnpm dev      # desarrollo (esbuild en watch mode, escucha en :8200)
pnpm build    # compila a dist/main.js
pnpm start    # ejecuta dist/main.js
```

## Scripts

| Script                  | Descripción                                  |
| ----------------------- | -------------------------------------------- |
| `pnpm dev`              | Build en modo watch + servidor en desarrollo |
| `pnpm build`            | Build de producción (`dist/main.js`)         |
| `pnpm start`            | Ejecuta el build de producción               |
| `pnpm validate`         | Chequeo de tipos (`tsc`)                      |
| `pnpm test`             | Ejecuta los tests (vitest)                   |
| `pnpm test:coverage`    | Tests con cobertura                          |
| `pnpm eslint`           | Lint                                         |
| `pnpm eslint:fix`       | Lint con autofix                             |

## Endpoints

| Método | Ruta                            | Descripción          |
| ------ | ------------------------------- | -------------------- |
| POST   | `/api/v1/admin/auth/login`      | Inicio de sesión     |

### Ejemplo

```bash
curl -X POST http://localhost:8200/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cellphone":"3000000000","password":"password","country":"CO"}'
```

Credenciales demo (solo fuera de producción, usuari(o seed en memoria):

- country: `CO`
- cellphone: `3000000000`
- password: `password`

## Variables de entorno

Ver `.env.example`.

## Arquitectura

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Estado actual

- Persistencia: **en memoria** (`InMemoryProfileRepository`). No requiere base de
  datos para arrancar. Se migrará a Prisma más adelante cambiando solo el
  composition root.
- Autenticación: JWT (HS256) + hashing con `scrypt` nativo de Node.
