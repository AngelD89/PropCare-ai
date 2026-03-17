# PropCare AI — Backend API

Node.js + Express + PostgreSQL + Prisma backend for PropCare AI.

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a long random string (generate one at: https://randomkeygen.com)
- `ANTHROPIC_API_KEY` — your Claude API key from https://console.anthropic.com
- `FRONTEND_URL` — your GitHub Pages URL

### 3. Set up the database
```bash
npm run db:push
```

### 4. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user (auth required) |

### Properties
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/properties` | Get all user's properties |
| GET | `/api/properties/:id` | Get single property |
| POST | `/api/properties` | Create property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/bookings` | Get all user's bookings |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking status |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Contacts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/contacts` | Get all user's contacts |
| POST | `/api/contacts` | Add contact |
| DELETE | `/api/contacts/:id` | Remove contact |

### AI Proxy
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/chat` | Proxy to Claude API (keeps key secure) |

---

## Authentication

All routes except `/api/auth/register` and `/api/auth/login` require a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

---

## Deploying to Railway

1. Create account at https://railway.app
2. New Project → Deploy from GitHub repo
3. Add environment variables in Railway dashboard
4. Add a PostgreSQL database plugin in Railway
5. Copy the `DATABASE_URL` from Railway into your environment variables
6. Deploy — Railway auto-detects Node.js and runs `npm start`

---

## Deploying to Render

1. Create account at https://render.com
2. New → Web Service → Connect your GitHub repo
3. Build command: `npm install && npm run db:push`
4. Start command: `npm start`
5. Add environment variables
6. Create a free PostgreSQL database on Render and link it

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **AI**: Anthropic Claude API (proxied)
- **CORS**: Configured for GitHub Pages + local dev
