# AguaFix API

API REST construida con NestJS para que los ciudadanos reporten fugas de agua en la vía pública. Al crear un reporte, el sistema lo persiste en PostgreSQL y envía un correo de aviso a la cuadrilla de mantenimiento.

> Proyecto en desarrollo. Las instrucciones completas de instalación, variables de entorno y ejemplos de uso se agregarán en la fase final del desarrollo.

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + TypeORM (con migraciones, `synchronize: false`)
- Autenticación JWT (`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`)
- Envío de correo con `nodemailer`
- Validación con `class-validator` / `class-transformer`
