# Project Architecture & Infrastructure Rules

> [!CRITICAL]
> **STRICT INFRASTRUCTURE & LOGGING POLICY**:
> 1. **Frontend Hosting & Logs (`traditionalalley.com.np`)**: Hosted **EXCLUSIVELY** on **Vercel**. All frontend deployments occur automatically via GitHub `main` branch pushes. Always check Vercel dashboard / Vercel CLI for frontend logs and debugging. NEVER attempt to build or deploy the Next.js frontend on the VPS.
> 2. **Production VPS (`82.25.105.70`)**: Dedicated **EXCLUSIVELY** to Strapi CMS (`strapi-alley-production`) and PostgreSQL database (`postgres-alley-production`).

## Component Responsibilities

| Service | Host Location | Domain | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | Vercel | `traditionalalley.com.np` | Next.js 15 App Router |
| **Backend CMS** | VPS (`82.25.105.70`) | `admin.traditionalalley.com.np` | Strapi v5 |
| **Database** | VPS (`82.25.105.70`) | Internal Docker Bridge | PostgreSQL 16 |
