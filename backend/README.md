# AutoBid Backend

Minimal Node.js + Express backend (TypeScript) for the AutoBid project.

Quick start

1. Copy `.env.example` to `.env` and fill the values (MONGO_URI, JWT_SECRET, PORT).
2. Install dependencies and run in dev mode:

```powershell
cd backend
npm install
npm run dev
```

This will start a dev server with automatic restarts (ts-node-dev). The API endpoints live under `/api`:

- `POST /api/auth/signup` - create user
- `POST /api/auth/login` - login
- `GET /api/auth/me` - get current user (requires Authorization header)
- `GET /api/vehicles` - list vehicles
- `POST /api/vehicles` - create vehicle (auth required)
- `GET /api/vehicles/:id` - vehicle detail
- `POST /api/vehicles/:id/bid` - place a bid (auth required)
