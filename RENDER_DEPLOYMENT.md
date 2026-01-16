# Deploying MailFlow to Render

Follow these steps to migrate your MailFlow application from Replit to Render.

## 1. Prerequisites
- A [Render](https://render.com) account.
- A [GitHub](https://github.com) or GitLab repository with your code.
- A [Google Cloud Console](https://console.cloud.google.com) project (for Google Auth).

### Getting Google OAuth Credentials (FREE)
Google OAuth is free for standard authentication usage.
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a New Project** (e.g., "MailFlow").
3.  Navigate to **APIs & Services > OAuth consent screen**.
    - Choose **External**.
    - Fill in the required app information (App name, support email, developer contact).
4.  Navigate to **APIs & Services > Credentials**.
    - Click **+ Create Credentials** > **OAuth client ID**.
    - **Application type**: Web application.
    - **Name**: MailFlow Web Client.
    - **Authorized redirect URIs**: Add `https://your-app-name.onrender.com/api/callback/google` (replace with your actual Render URL).
5.  Copy the **Client ID** and **Client Secret**.

## 2. Infrastructure Setup on Render

### PostgreSQL Database
1. Click **New +** and select **PostgreSQL**.
2. Name your database (e.g., `mailflow-db`).
3. After creation, copy the **Internal Database URL** (for the web service) and **External Database URL** (for local migrations).

### Redis (for BullMQ)
1. Click **New +** and select **Redis**.
2. Name it `mailflow-redis`.
3. Copy the **Internal Redis URL**.

### Web Service
1. Click **New +** and select **Web Service**.
2. Connect your repository.
3. **Runtime**: `Node`.
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`

## 3. Environment Variables
In your Web Service settings, add the following:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Internal Postgres URL |
| `REDIS_URL` | Your Internal Redis URL |
| `SESSION_SECRET` | A long random string |
| `NODE_ENV` | `production` |
| `GOOGLE_CLIENT_ID` | (Optional) For migration to Google Auth |
| `GOOGLE_CLIENT_SECRET` | (Optional) For migration to Google Auth |

## 4. Auth Migration Note
The current version uses **Replit Auth**, which is platform-locked. Before deploying to Render, you must swap the code in `server/replit_integrations/auth` to use a generic Passport strategy (like `passport-google-oauth20` or `passport-github2`).

## 5. Health Checks
Render will automatically monitor `/health` to ensure your app is running correctly. I have added this endpoint to your `server/routes.ts`.
