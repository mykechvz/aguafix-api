# AguaFix API

API REST construida con **NestJS 11** para que los ciudadanos reporten fugas de agua en la vía pública. Al crear un reporte, el sistema lo guarda en PostgreSQL y envía un correo de aviso a la cuadrilla de mantenimiento.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + TypeORM (con migraciones, `synchronize: false`)
- Autenticación JWT (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`)
- Envío de correo con `nodemailer`
- Validación con `class-validator` / `class-transformer`
- Variables de entorno validadas con `env-var` + `dotenv`
- Contraseñas hasheadas con `bcryptjs`

## Requisitos

- Node.js 20+ y npm
- Docker Desktop (para levantar PostgreSQL)

## 1. Instalación

```bash
npm install
```

## 2. Variables de entorno

Copia `.env.example` a `.env` y ajusta lo que necesites:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que corre la API (default `3000`) |
| `DB_HOST` | Host de PostgreSQL (`localhost` en desarrollo) |
| `DB_PORT` | Puerto de PostgreSQL en el host. **Usamos `5433` por defecto** para no chocar con un Postgres nativo que pudiera estar corriendo en el puerto `5432` de tu máquina |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Credenciales y nombre de la base de datos (deben coincidir con `docker-compose.yml`) |
| `JWT_SECRET` | Secreto usado para firmar los tokens JWT |
| `JWT_EXPIRATION` | Expiración del token, formato de la librería `ms` (ej. `1h`, `2d`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Credenciales del servidor SMTP para enviar los correos de aviso |
| `MAIL_CREW_ADDRESS` | Dirección fija de la cuadrilla de mantenimiento que recibe el aviso de cada nuevo reporte |

Si falta alguna variable requerida, la aplicación falla al arrancar con un mensaje claro (validado en `src/config/envs.ts`).

### Configurar SMTP real (Gmail)

Para que el correo llegue de verdad a una bandeja de entrada:

1. Activa la verificación en 2 pasos en la cuenta de Gmail que vas a usar: https://myaccount.google.com/security
2. Genera una contraseña de aplicación: https://myaccount.google.com/apppasswords
3. En `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-correo@gmail.com
   SMTP_PASS=la-contraseña-de-16-caracteres-sin-espacios
   SMTP_FROM=AguaFix <tu-correo@gmail.com>
   ```

Si el correo no se puede enviar (SMTP mal configurado, sin conexión, etc.), `POST /reports` **igual responde `201`** — el reporte ya quedó guardado en la base de datos; el error de envío solo se registra en los logs del servidor.

## 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Deberías ver el contenedor `aguafix-postgres` como `Up`/`healthy`:

```bash
docker ps
```

## 4. Correr las migraciones

```bash
npm run migration:run
```

Esto crea las tablas `SYSTEM_USER` y `WATER_REPORT`. Otros comandos disponibles:

```bash
npm run migration:generate -- src/database/migrations/NombreDeLaMigracion  # genera una migración a partir de cambios en las entidades
npm run migration:revert                                                  # revierte la última migración
```

## 5. Levantar el proyecto

```bash
npm run start:dev   # con hot-reload
npm run start       # sin hot-reload
npm run build && npm run start:prod   # build de producción
```

La API queda disponible en `http://localhost:3000` (o el `PORT` que hayas configurado).

## Modelo de datos

### `User` → tabla `SYSTEM_USER`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial | PK autogenerado |
| `name` | string | |
| `email` | string | único |
| `password` | string | hash con bcryptjs |
| `isNotificationEnabled` | boolean | default `true`. Campo modelado según el enunciado; actualmente `POST /reports` no lo consulta para decidir destinatarios (usa `MAIL_CREW_ADDRESS`) |

### `Report` → tabla `WATER_REPORT`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial | PK autogenerado |
| `address` | string | dirección o referencia de la fuga |
| `description` | string | qué se observa |
| `severity` | string | `low` \| `medium` \| `high` |
| `reporterPhone` | string | teléfono de contacto |
| `isResolved` | boolean | default `false` |
| `createdAt` | timestamp | fecha del reporte |

## Endpoints

Todas las respuestas son JSON. Los endpoints de `reports` requieren el header `Authorization: Bearer <accessToken>` obtenido en `/auth/login`.

### `POST /auth/register`

Request:
```json
{
  "name": "Miguel Chavez",
  "email": "miguel@test.com",
  "password": "secret123"
}
```

Response `201`:
```json
{
  "id": 1,
  "name": "Miguel Chavez",
  "email": "miguel@test.com",
  "isNotificationEnabled": true
}
```

Si el correo ya existe → `409 Conflict`.

### `POST /auth/login`

Request:
```json
{
  "email": "miguel@test.com",
  "password": "secret123"
}
```

Response `200`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Si las credenciales son inválidas → `400 Bad Request` con `{ "message": "Credenciales inválidas" }`.

### `POST /reports` (protegido)

Headers:
```
Authorization: Bearer <accessToken>
```

Request:
```json
{
  "address": "Av. Reforma 123, Col. Centro",
  "description": "Fuga grande saliendo de la banqueta",
  "severity": "high",
  "reporterPhone": "555-123-4567"
}
```

Response `201`:
```json
{
  "id": 1,
  "address": "Av. Reforma 123, Col. Centro",
  "description": "Fuga grande saliendo de la banqueta",
  "severity": "high",
  "reporterPhone": "555-123-4567",
  "isResolved": false,
  "createdAt": "2026-09-10T23:11:39.806Z"
}
```

Al crearse el reporte se envía automáticamente un correo HTML a `MAIL_CREW_ADDRESS` con la dirección, descripción, severidad y teléfono de contacto.

Sin token → `401 Unauthorized`. `severity` fuera de `low|medium|high` → `400 Bad Request`.

### `GET /reports` (protegido)

Headers:
```
Authorization: Bearer <accessToken>
```

Response `200`:
```json
[
  {
    "id": 1,
    "address": "Av. Reforma 123, Col. Centro",
    "description": "Fuga grande saliendo de la banqueta",
    "severity": "high",
    "reporterPhone": "555-123-4567",
    "isResolved": false,
    "createdAt": "2026-09-10T23:11:39.806Z"
  }
]
```

## Probar el flujo completo

El archivo [`requests.http`](./requests.http) trae los 4 endpoints listos (register → login → crear reporte con el token → listar), más algunos casos negativos (credenciales inválidas, sin token, severity inválida). Se puede usar con la extensión **REST Client** de VS Code, o copiar cada petición como `curl`.
