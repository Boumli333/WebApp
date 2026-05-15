# Recipe Book Web Application

This repository contains a full-stack **Recipe Book** app in `/recipe-book`.

## Structure

```text
/recipe-book
├── /frontend
├── /backend
├── schema.sql
├── .env.example
└── .gitignore
```

## Backend setup

1. Create MySQL database and run schema:
   ```bash
   mysql -u root -p < recipe-book/schema.sql
   ```
2. Configure environment:
   ```bash
   cp recipe-book/.env.example recipe-book/backend/.env
   ```
3. Install and run backend:
   ```bash
   cd recipe-book/backend
   npm install
   npm test
   npm start
   ```

API base URL: `http://localhost:3000/api/v1`

## Frontend setup

Serve static files in `recipe-book/frontend` using any static server (or Railway static service/GitHub Pages).

If the API is not local, set API base before scripts load:

```html
<script>
  window.RECIPE_API_BASE = 'https://your-backend-domain/api/v1';
</script>
```

## Security implemented

- JWT auth with role-based access (`user` / `admin`)
- Password hashing with bcrypt
- Login rate limit (10 attempts / 15 min / IP)
- CSRF token checks on state-changing requests
- XSS input sanitization
- Prepared SQL statements via mysql2 placeholders
- Secrets in `.env` (never committed)

## Deployment (Railway)

### Backend + MySQL (Railway)

1. Create a Railway project.
2. Add a MySQL service.
3. Deploy `recipe-book/backend` as a Node service.
4. Set environment variables from `.env.example`.
5. Run `schema.sql` against Railway MySQL.

### Frontend

Deploy `recipe-book/frontend` either:
- as Railway static service, or
- on GitHub Pages.

Set `window.RECIPE_API_BASE` to Railway backend URL.
