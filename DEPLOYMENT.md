# Local Docker Development

1. Install Docker Desktop.
2. Copy `.env.example` to `.env` and change the values.
3. Start everything with `docker compose up --build`.
4. Open the frontend at `http://localhost:5173`.
5. Stop the stack with `docker compose down`.

PostgreSQL data is stored in the `postgres-data` Docker volume. To delete the local database too, use `docker compose down -v`.

## GitHub safety

The root `.gitignore` excludes `.env`, build output, Maven output, IDE files, certificates, and local logs. Do not put passwords, JWT secrets, cloud credentials, or production connection strings in source files. If a secret was ever pushed, rotate it even after deleting the file from a later commit.

## Longer-term low-cost hosting options

- Frontend: Cloudflare Pages, Netlify, or Vercel. Set `VITE_API_URL` to the deployed API URL when building.
- Backend: Google Cloud Run can run the backend container within its monthly free quota. It requires a billing account, and charges are possible if the free quota is exceeded. Configure the Spring environment variables in Cloud Run.
- Database: Neon or Supabase PostgreSQL free tiers. Use the provider's connection string as `SPRING_DATASOURCE_URL`.

Cloudflare Pages is the simplest permanent home for the static frontend. For the API, Cloud Run is a better fit for this Docker setup than a one-month trial. Oracle Cloud Always Free is another option for a small self-managed VM, but it requires more Linux and server-maintenance work. Free tiers change over time and may sleep, require billing verification, or have usage limits.

## Production variables

Set these outside GitHub: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, and `APP_CORS_ALLOWED_ORIGINS`. Use a unique long random `JWT_SECRET` and a production database; the local `dev` profile currently uses `create-drop`, which is suitable only for local testing.