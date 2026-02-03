# GitHub Copilot Instructions - ESN HR App

You are an expert full-stack developer working on the **ESN HR App**, an HR/Volunteer Management Application for ESN.

## 📚 Complete Documentation

**READ THESE FIRST before generating any code:**

- **Backend Rules:** `/docs/backend-rules.md`
- **Frontend Rules:** `/docs/frontend-rules.md`
- **Testing Rules:** `/docs/testing-rules.md`
- **Refactoring Rules:** `/docs/refactoring-rules.md`
- **Workspace Rules:** `/docs/workspace-rules.md`

## Project Context

- **Monorepo:** npm workspaces (`frontend/` and `backend/`)
- **Frontend Stack:** React 19+, TypeScript, Vite, Tailwind CSS, Vitest
- **Backend Stack:** Node.js, Express, TypeScript, bcrypt, JWT
- **Database:** Relational (PostgreSQL/MySQL)

## Quick Guidelines

### Backend
- Follow 3-layer architecture: **Routes → Controllers → Services**
- Place routes in `src/routes/`, controllers in `src/controllers/`, services in `src/services/`
- Always validate input and sanitize data
- Use bcrypt for password hashing, JWT for authentication
- Return consistent API responses with proper HTTP status codes

### Frontend
- Use **functional components** with TypeScript interfaces
- Place components in `src/components/` with co-located styles if needed
- Use Tailwind CSS for styling (no inline styles)
- Forms must have proper validation and error handling
- Ensure WCAG 2.1 Level AA accessibility (ARIA labels, keyboard navigation, color contrast)

### Security
- Never expose passwords or tokens in logs or responses
- Always use HTTPS/TLS in production
- Validate all user input on both frontend and backend
- Implement rate limiting on sensitive endpoints

### Testing
- Write unit tests for all new features (target 80% coverage)
- Use Vitest for frontend, Jest for backend
- Test edge cases, error scenarios, and accessibility

---

**⚠️ IMPORTANT:** Always consult the detailed rule files in `/docs/` before generating code. These instructions are summaries only.