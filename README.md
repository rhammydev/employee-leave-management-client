# Leave Management App

## Requirements

- Node.js 20+
- npm
- Local API server running and reachable from the browser

## Backend CORS setup

The backend must allow requests from the Vite dev server origin. Add the CORS policy and middleware in Program:

```csharp
builder.Services.AddCors(o => o.AddPolicy("Dev",
    p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

app.UseCors("Dev");
```

If your Vite dev server uses a different port, update the allowed origin to match the URL shown when you run `npm run dev`.

## Environment setup

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_DELAY_MS=2500
```

Notes:

- `VITE_API_BASE_URL` should point to the API base URL without `/api`; the app appends `/api` internally.
- `VITE_API_DELAY_MS` is optional. It adds a global delay to API calls for testing loading states.

## Install dependencies

```bash
npm install
```

## Start development server

```bash
npm run dev
```

The app will open at the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Useful commands

```bash
npm run build
npm run lint
npm run preview
```
