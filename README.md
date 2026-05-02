# Mood & Habit Tracker

A multi-page interactive website for tracking mood, habits, goals, and progress.

## Stack
- HTML5
- CSS3 + Bootstrap 5
- Vanilla JavaScript
- Node.js + Express
- JWT authentication
- bcrypt
- PostgreSQL (via `pg`)
- Chart.js

## Project structure
```
project/
├── client/
│   ├── css/styles.css
│   ├── i18n/en.json
│   ├── i18n/ru.json
│   ├── js/
│   │   ├── ui.js
│   │   ├── form.js
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── tracker.js
│   │   └── dashboard.js
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── tracker.html
│   └── dashboard.html
└── server/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── middleware/
    ├── db/
    │   └── schema.sql
    └── server.js
```

## Installation
1. Install dependencies:
   ```bash
   npm init -y
   npm install express cors jsonwebtoken bcrypt pg
   ```
2. Add environment variables if using PostgreSQL:
   ```bash
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_secret_key
   PORT=3000
   ```
3. Run the server:
   ```bash
   node server/server.js
   ```
4. Open:
   `http://localhost:3000`

## API
### Auth
- `POST /api/register` — register user
- `POST /api/login` — login user

### Mood entries
- `GET /api/moods`
- `POST /api/moods`
- `PUT /api/moods/:id`
- `DELETE /api/moods/:id`

### Export
- `GET /api/export/json`
- `GET /api/export/csv`

All protected endpoints require:
`Authorization: Bearer <token>`

## Notes
- Theme and language are saved in `localStorage`.
- Dashboard includes search, filters, pagination, calendar, charts, goals, and export.
- If PostgreSQL is not configured, the backend uses in-memory storage for demo purposes.
