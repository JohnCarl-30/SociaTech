# SociaTech Deployment

## Recommended split

- Frontend: Vercel (`frontend/`)
- Backend: DigitalOcean App Platform (`Dockerfile` at the repo root)
- Database: managed PostgreSQL

This project is currently a Vite SPA plus a PHP backend. The cleanest production setup is to host the frontend on Vercel and the backend on DigitalOcean, then point the frontend to the backend with `VITE_API_BASE_URL`.

## Frontend on Vercel

1. Create a new Vercel project and set the root directory to `frontend`.
2. Add the environment variables from [frontend/.env.example](/Users/dyeyyyc/Documents/GitHub/SociaTech/frontend/.env.example).
3. Set `VITE_API_BASE_URL` to your DigitalOcean backend URL, for example `https://api-your-app.ondigitalocean.app`.
4. Deploy. The included [frontend/vercel.json](/Users/dyeyyyc/Documents/GitHub/SociaTech/frontend/vercel.json) keeps SPA routes working on refresh.

## Backend on DigitalOcean

1. Create a new App Platform app from this repository.
2. Deploy the repo root with the root [Dockerfile](/Users/dyeyyyc/Documents/GitHub/SociaTech/Dockerfile).
3. Add runtime environment variables from [backend/.env.example](/Users/dyeyyyc/Documents/GitHub/SociaTech/backend/.env.example).
4. Set `APP_URL` to the Vercel frontend domain.
5. Set `BACKEND_URL` to the DigitalOcean app domain if you want explicit asset and redirect URLs.
6. Use either `DATABASE_URL` or the `PG*` variables for PostgreSQL.

## Important production notes

- This backend uses session cookies, so the frontend must call the API with `credentials: "include"`.
- DigitalOcean App Platform does not provide persistent local disk for app containers, so uploaded files should eventually move to object storage if you want them to survive redeploys.
- The Docker image now creates and copies the upload folders needed by posts, comments, and profile images.

## Email with Resend

1. Create a Resend account and verify a sending domain.
2. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `RESEND_FROM_NAME` plus `RESEND_REPLY_TO` to the backend environment.
3. Use an address at your verified domain for `RESEND_FROM_EMAIL`.

The backend now sends both password reset and email verification messages through the Resend API.
