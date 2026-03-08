🏠 PropCare AI
AI-Powered Property Management MVP

PropCare AI is a full-stack web application designed to help Airbnb and hotel property owners manage services, providers, and maintenance operations efficiently.

This project was developed as part of the Holberton Portfolio Project and demonstrates complete MVP implementation from architecture design to AI-assisted functionality.

🚀 Features
🏘 Property Management

Create, view, and delete properties

Organized property listing dashboard

👷 Provider Management

Create and manage service providers

Store service type, phone, and email

Dynamic provider dropdown integration

🛠 Service Management

Create services linked to properties and providers

Track service type and schedule

Update service status:

Scheduled

Completed

Canceled

Delete services

🤖 AI Assistant

Generates operational summaries

Identifies busiest property

Counts service statuses

Matches user requests to providers

Supports synonym-based intent detection
(e.g., plumbing → plumber, wiring → electrician)

🧠 How the AI Works

The AI Assistant is implemented as a backend endpoint:

POST /api/ai/assistant
🔹 Intent Detection

The system analyzes the user prompt and searches for keywords.

Example:

"I need a plumber"
"I have a pipe leak"
"I need electrical work"
🔹 Provider Matching

The system:

Compares keywords against provider service types

Uses a synonym dictionary for flexible matching

Returns matching provider contact information

🔹 Fallback Summary

If no service request is detected, AI returns:

Total scheduled services

Total completed services

Total canceled services

Busiest property

This lightweight logic simulates intelligent behavior without external AI APIs.

🏗 Tech Stack
Backend

Flask

SQLAlchemy

SQLite

RESTful API architecture

App Factory pattern

Frontend

HTML5

CSS3

Vanilla JavaScript

Dynamic DOM manipulation

Development Tools

Git

cURL (API testing)

Browser DevTools

📦 Project Structure
propcare-ai/
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── extensions.py
│   ├── routes/
│   └── database.db
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
└── README.md
⚙️ Installation & Setup
1️⃣ Backend Setup

Navigate to backend:

cd backend

Create virtual environment:

python3 -m venv venv
source venv/bin/activate

Install dependencies:

pip install flask flask_sqlalchemy flask_cors python-dotenv

Run the server:

python3 app.py

Backend runs at:

http://127.0.0.1:5000
2️⃣ Frontend Setup

Navigate to frontend:

cd frontend

Run local server:

python3 -m http.server 5500

Open browser:

http://localhost:5500
🧪 Testing
Backend Testing (cURL Example)

Create property:

curl -X POST http://127.0.0.1:5000/api/properties \
-H "Content-Type: application/json" \
-d '{"name":"Beach House","user_id":1}'

Update service status:

curl -X PATCH http://127.0.0.1:5000/api/services/1/status \
-H "Content-Type: application/json" \
-d '{"status":"completed"}'

AI test:

curl -X POST http://127.0.0.1:5000/api/ai/assistant \
-H "Content-Type: application/json" \
-d '{"prompt":"I need a plumber"}'
⚠️ Known Limitations

No authentication system

No role-based permissions

No provider rating system

AI uses rule-based logic (not LLM-powered)

SQLite not optimized for production scale

No cloud deployment yet

🔮 Future Improvements

OpenAI API integration

Google Places API for real-world provider search

JWT authentication

Calendar-based scheduling

Service analytics dashboard

Docker containerization

Cloud deployment (AWS, Render, Railway)

Automated testing suite

🎯 MVP Outcome

This MVP demonstrates:

Full CRUD implementation

RESTful backend architecture

Frontend–backend integration

Intelligent provider matching

Service lifecycle management

Operational AI summary logic

The system successfully meets the defined MVP objectives and reflects strong understanding of full-stack development principles.

👨‍💻 Author

Angel Bayo Torres
Holberton School – Portfolio Project
