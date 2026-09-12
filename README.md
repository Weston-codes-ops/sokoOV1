# SokoOnline

SokoOnline is a React/Vite storefront backed by a Spring Boot REST API and PostgreSQL.

## Run with Docker

```powershell
Copy-Item .env.example .env
# Edit .env and replace the example password and JWT secret.
docker compose up --build
```

Open http://localhost:5173. The API is available at http://localhost:8080.

Stop the services with `docker compose down`. Keep the `postgres-data` volume to preserve local data.

## Run without Docker

Start PostgreSQL, set `SPRING_DATASOURCE_PASSWORD`, then run `sokoonline\\mvnw.cmd spring-boot:run`. In another terminal run `npm install` and `npm run dev` from `soko-front`.

## Project layout

- `soko-front`: React/Vite frontend
- `sokoonline`: Spring Boot API
- `docker-compose.yml`: local frontend, backend, and PostgreSQL stack
- `DEPLOYMENT.md`: GitHub safety, hosting options, and deployment variables
