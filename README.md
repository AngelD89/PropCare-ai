# PropCare AI 🏠

**Smart property management for Puerto Rico — powered by Claude AI**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-propcare--ai-00e5c0?style=for-the-badge)](https://angeld89.github.io/PropCare-ai)
[![Backend](https://img.shields.io/badge/Backend-Railway-7c5cfc?style=for-the-badge)](https://propcare-ai-production.up.railway.app)
[![Holberton School](https://img.shields.io/badge/Holberton-Portfolio%20Project-ff6b4a?style=for-the-badge)](https://www.holbertonschool.com)

---

## What is PropCare AI?

PropCare AI is a full-stack web application that helps property owners in Puerto Rico manage their Airbnbs, vacation rentals, and long-term rentals — all from one place.

The idea came from a real problem. When my girlfriend and I moved into our current apartment, we learned it had originally been renovated as an Airbnb. The owner gave up on short-term rentals not because of the property itself, but because managing weekly services — finding a cleaner, scheduling a plumber, keeping track of everything — was simply too overwhelming.

PropCare AI solves that. Describe your problem in plain words, and the AI finds real local help near your property instantly.

---

## Live Demo

**Frontend:** https://angeld89.github.io/PropCare-ai  
**Backend API:** https://propcare-ai-production.up.railway.app

---

## Features

### For Property Owners
- **Property Dashboard** — manage all properties from one clean view
- **AI Assistant** — describe any problem in plain language and get real local provider recommendations
- **Service Booking** — book cleaners, plumbers, electricians and more
- **Schedule & Calendar** — track all upcoming and past services
- **Provider Directory** — save and organize your trusted service contacts
- **Direct Messaging** — communicate with providers in-app
- **Service History** — full log of every service performed per property

### For Service Providers
- **Client Portal** — see all properties you service with details and needs
- **Schedule Management** — view and manage your upcoming jobs
- **Direct Messaging** — communicate with property owners

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Single-file SPA — no frameworks, no build process |
| CSS3 | Custom dark theme, CSS variables, Grid & Flexbox |
| Vanilla JavaScript (ES6+) | Routing, state management, DOM manipulation |
| Google Fonts (Syne + DM Sans) | Typography |
| GitHub Pages | Hosting |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Relational database |
| pg (node-postgres) | Database driver |
| JWT + bcryptjs | Authentication and password hashing |
| Railway | Backend and database hosting |

### AI
| Technology | Purpose |
|---|---|
| Claude API (Anthropic) | Natural language understanding and responses |
| Web Search Tool | Real-time local provider search |

---

## Project Structure

```
PropCare-ai/
├── frontend/
│   └── index.html          # Complete single-file frontend SPA
├── backend/
│   ├── server.js           # Express server entry point
│   ├── db.js               # PostgreSQL connection pool
│   ├── setup-db.js         # Database table creation script
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   └── routes/
│       ├── auth.js         # Register, login, /me
│       ├── properties.js   # CRUD for properties
│       ├── bookings.js     # CRUD for bookings
│       ├── contacts.js     # CRUD for contacts
│       └── ai.js           # Claude API proxy
└── index.html              # Root copy for GitHub Pages
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or a Railway account)

### Frontend (local)
```bash
git clone https://github.com/AngelD89/PropCare-ai.git
cd PropCare-ai
npx serve .
# Open http://localhost:3000
```

### Backend (local)
```bash
cd backend
npm install
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
node setup-db.js
npm start
```

### Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://angeld89.github.io
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/properties` | List all properties |
| POST | `/api/properties` | Add a new property |
| DELETE | `/api/properties/:id` | Delete a property |
| GET | `/api/bookings` | List all bookings |
| POST | `/api/bookings` | Create a booking |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Add a contact |
| DELETE | `/api/contacts/:id` | Remove a contact |
| POST | `/api/ai/chat` | Send a message to the AI assistant |

---

## How the AI Works

The AI assistant uses Claude's API with the Web Search tool enabled. When a user describes a problem, the assistant:

1. Interprets the problem and identifies the service type needed
2. Searches the web in real-time for local providers near the property's address
3. Returns real contact information — name, phone, website, and ratings
4. Provides relevant maintenance tips for Puerto Rico's tropical climate

The API key is stored server-side and never exposed to the browser — all AI requests are proxied through the backend.

---

## Deployment

**Frontend** is deployed on GitHub Pages from the `main` branch root.

**Backend** is deployed on Railway with PostgreSQL provisioned automatically. Auto-deploys on every push to `main`.

---

## Author

**Angel D. Bayo Torres**  
Full-Stack Developer — Creator of PropCare AI

GitHub: https://github.com/AngelD89

---

## License

This project was built as a Portfolio Project for [Holberton School](https://www.holbertonschool.com) — a project-based software engineering program.

---

*Built with love in Puerto Rico*
