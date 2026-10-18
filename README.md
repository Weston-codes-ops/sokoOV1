# SokoOnline

SokoOnline is a React/Vite storefront backed by a Spring Boot REST API and PostgreSQL.

## Run with Docker

```powershell
Copy-Item .env.example .env
# Edit .env and replace the database password, JWT secret, and admin setup key.
docker compose up --build
```

Open http://localhost:5173. The API is available at http://localhost:8080.

Stop the services with `docker compose down`. Keep the `postgres-data` volume to preserve local data.

## Run without Docker

Start PostgreSQL, set `SPRING_DATASOURCE_PASSWORD`, then run `sokoonline\\mvnw.cmd spring-boot:run`. In another terminal run `npm install` and `npm run dev` from `soko-front`.

## Test M-Pesa checkout

Checkout uses Daraja Sandbox STK Push. The order and a separate payment attempt are saved before the prompt is sent; the order is confirmed only after a valid Daraja callback. Delivery is free while testing. The API recalculates prices and checks stock on the server.

1. Copy `.env.example` to `.env` and add the Daraja Sandbox consumer key, consumer secret, shortcode, and passkey from your Safaricom developer app. Keep `DARAJA_ENABLED=false` until all values are set.
2. Give the local API a publicly reachable HTTPS URL using a trusted tunnel. Set `DARAJA_CALLBACK_URL` to that URL followed by `/api/v1/payments/daraja/callback` (do not append the secret yourself).
3. Set `DARAJA_CALLBACK_SECRET` to a new random URL-safe string of at least 32 characters. The API appends it to the callback URL to prevent unauthenticated callback updates.
4. Set `DARAJA_ENABLED=true`, restart the API, then check out with a Sandbox test phone supported by your Safaricom developer account.

Never put Daraja credentials or the callback secret in frontend variables, source control, or chat. Do not use Sandbox settings for live payments. The checkout currently supports whole-KSh totals only because STK Push accepts integer amounts.

## Project layout

- `soko-front`: React/Vite frontend
- `sokoonline`: Spring Boot API
- `docker-compose.yml`: local frontend, backend, and PostgreSQL stack
