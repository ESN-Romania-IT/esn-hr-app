# Workspace Rules - ESN HR App

This document defines the monorepo structure, workspace management, and collaboration guidelines for the ESN HR App.

---

## 📦 Monorepo Structure

The ESN HR App uses **npm workspaces** to manage the frontend and backend as a unified project.

```
esn-hr-app/
├── frontend/               # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                # Node.js backend application
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # Project documentation
│   ├── backend-rules.md
│   ├── frontend-rules.md
│   ├── testing-rules.md
│   ├── refactoring-rules.md
│   └── workspace-rules.md
├── .github/
│   ├── CODEOWNERS
│   ├── copilot-instructions.md
│   └── workflows/          # CI/CD workflows
├── .cursor/
│   └── rules/
│       └── project-rules.mdc
├── package.json            # Root package.json with workspaces
├── .gitignore
├── README.md
└── .env.example
```

---

## 🛠️ Workspace Setup

### Root package.json

**`package.json`**
```json
{
  "name": "esn-hr-app",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "test:coverage": "npm run test:coverage --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### Installation

```bash
# Install dependencies for all workspaces
npm install

# Install dependency in specific workspace
npm install axios --workspace=frontend
npm install express --workspace=backend

# Install dev dependency in specific workspace
npm install -D @types/express --workspace=backend
```

---

## 🚀 Running the Project

### Development

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev --workspace=frontend

# Start only backend
npm run dev --workspace=backend
```

### Building

```bash
# Build both projects
npm run build

# Build only frontend
npm run build --workspace=frontend

# Build only backend
npm run build --workspace=backend
```

### Testing

```bash
# Run tests for all workspaces
npm test

# Run tests for specific workspace
npm test --workspace=frontend
npm test --workspace=backend

# Run tests with coverage
npm run test:coverage
```

---

## 🔧 Environment Variables

### Frontend (.env)

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ESN HR App
VITE_APP_VERSION=1.0.0
```

### Backend (.env)

**`backend/.env`**
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=esn_hr_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Email (if needed)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=ESN HR App <noreply@example.com>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### .env.example Files

Create `.env.example` files in both workspaces with dummy values:

**`frontend/.env.example`**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ESN HR App
VITE_APP_VERSION=1.0.0
```

**`backend/.env.example`**
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=esn_hr_db
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=ESN HR App <noreply@example.com>
```

---

## 📝 Git Workflow

### Branch Naming Convention

```
feature/[ticket-id]-brief-description
bugfix/[ticket-id]-brief-description
hotfix/[ticket-id]-brief-description
refactor/brief-description
docs/brief-description
```

**Examples:**
- `feature/EHA-123-user-profile-page`
- `feature/EHA-456-activity-creation`
- `bugfix/EHA-789-fix-date-validation`
- `refactor/extract-form-components`
- `docs/update-api-documentation`

### Commit Messages

Follow **Conventional Commits**:

```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

**Examples:**
```
feat(frontend): add activity creation form
fix(backend): resolve date validation issue
docs: update setup instructions in README
refactor(frontend): extract reusable form components
test(backend): add tests for activity service
chore: update dependencies
```

---

## 🔀 Pull Request Process

### Before Creating PR

1. **Ensure all tests pass:**
   ```bash
   npm test
   ```

2. **Run linting:**
   ```bash
   npm run lint
   ```

3. **Format code:**
   ```bash
   npm run format
   ```

4. **Update documentation** if needed

5. **Rebase on main:**
   ```bash
   git checkout main
   git pull
   git checkout your-branch
   git rebase main
   ```

### PR Template

**Title:** `[TYPE] Brief description`

**Description:**
```markdown
## What does this PR do?
Brief description of changes

## Why is this change needed?
Context and motivation

## How was this tested?
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Tests pass locally
- [ ] Code follows project style guide
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Reviewed own code before requesting review
- [ ] No merge conflicts
```

### Code Review Requirements

- At least **one approval** from code owners (@elizadoltu or @superraul10)
- All CI checks must pass
- No merge conflicts
- Branch up to date with main

---

## 🤖 GitHub Actions CI/CD

### Workflow Configuration

**`.github/workflows/ci.yml`**
```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test --workspace=frontend
      - run: npm run test:coverage --workspace=frontend
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test --workspace=backend
      - run: npm run test:coverage --workspace=backend
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: backend

  build:
    runs-on: ubuntu-latest
    needs: [lint, test-frontend, test-backend]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

## 📋 Code Quality Tools

### Prettier Configuration

**`.prettierrc`**
```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**`.prettierignore`**
```
node_modules
dist
build
coverage
*.log
.env
.env.*
package-lock.json
```

### ESLint Configuration

**Frontend (`frontend/.eslintrc.json`):**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Backend (`backend/.eslintrc.json`):**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### Husky Pre-commit Hooks

**`.husky/pre-commit`**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**`package.json` (lint-staged config):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 🗂️ Shared Dependencies

### When to Use Root vs Workspace Dependencies

**Install at root level:**
- Dev tools used across all workspaces (prettier, husky, lint-staged)
- Shared configurations
- Global scripts and utilities

**Install at workspace level:**
- Runtime dependencies (react, express, axios)
- Workspace-specific dev dependencies (@types/react, @types/express)
- Testing libraries specific to each workspace

---

## 📚 Documentation Standards

### README Structure

Each workspace should have its own README:

**`frontend/README.md`**
```markdown
# ESN HR App - Frontend

React-based frontend for the ESN HR App.

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vitest

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server (http://localhost:5173)
- \`npm run build\` - Build for production
- \`npm test\` - Run tests
- \`npm run test:coverage\` - Run tests with coverage
- \`npm run lint\` - Run linter
- \`npm run format\` - Format code with Prettier

## Project Structure

See \`/docs/frontend-rules.md\` for detailed structure and guidelines.

## Environment Variables

Copy \`.env.example\` to \`.env\` and configure:
- \`VITE_API_BASE_URL\` - Backend API URL
```

**`backend/README.md`**
```markdown
# ESN HR App - Backend

Node.js/Express backend API for the ESN HR App.

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL/MySQL
- Jest

## Getting Started

\`\`\`bash
npm install
cp .env.example .env
# Configure .env with your database credentials
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build TypeScript to JavaScript
- \`npm start\` - Start production server
- \`npm test\` - Run tests
- \`npm run test:coverage\` - Run tests with coverage
- \`npm run lint\` - Run linter

## Project Structure

See \`/docs/backend-rules.md\` for detailed structure and guidelines.

## Environment Variables

Copy \`.env.example\` to \`.env\` and configure all required variables.
```

### Code Comments

- Use JSDoc for public functions
- Explain **why**, not **what**
- Keep comments up to date with code changes
- Remove commented-out code before committing

**Example:**
```typescript
/**
 * Calculates user participation statistics across activities
 * 
 * This aggregates data from multiple sources to provide a comprehensive
 * view of user engagement, used for reports and dashboards.
 * 
 * @param userId - The ID of the user
 * @param dateRange - Optional date range filter
 * @returns Statistics object with hours, activities count, and ratings
 */
export const calculateUserStats = async (
  userId: number, 
  dateRange?: DateRange
): Promise<UserStats> => {
  // Implementation
};
```

---

## 🔒 Security Best Practices

### Secrets Management
- **Never** commit `.env` files
- Use `.env.example` for templates
- Rotate secrets regularly
- Use environment variables for all sensitive data
- Add `.env*` to `.gitignore`

### Dependency Security
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### .gitignore

**Root `.gitignore`:**
```
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Build output
dist/
build/

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## 🤝 Collaboration Guidelines

### Communication
- Use GitHub Issues for bug reports and feature requests
- Use Pull Requests for code reviews and discussions
- Document decisions in code comments or project wiki
- Ask questions in team chat before making significant changes

### Code Ownership (CODEOWNERS)

**`.github/CODEOWNERS`**
```
# Default owners for everything
* @elizadoltu @superraul10

# Frontend changes
/frontend/ @elizadoltu @superraul10

# Backend changes
/backend/ @elizadoltu @superraul10

# Documentation
/docs/ @elizadoltu @superraul10

# CI/CD
/.github/ @elizadoltu @superraul10
```

### Knowledge Sharing
- Document complex implementations
- Share learnings in team meetings
- Update documentation when making changes
- Create runbooks for deployment and troubleshooting
- Onboard new team members with documentation

---

## 🚫 What NOT to Do

- ❌ Don't commit directly to main
- ❌ Don't push without running tests
- ❌ Don't commit `.env` files
- ❌ Don't commit `node_modules/`
- ❌ Don't leave TODO comments without creating tickets
- ❌ Don't merge your own PRs without review
- ❌ Don't ignore CI failures
- ❌ Don't hardcode credentials or secrets
- ❌ Don't push large files (images, videos) to Git

---

## 📊 Project Metrics

### Track These Metrics
- Code coverage (target: 80%)
- Build times
- Test execution time
- Bundle size (frontend)
- API response times (backend)
- Number of open PRs
- Average PR review time
- Deployment frequency

### Monitoring Tools
- GitHub Actions for CI/CD
- Codecov for code coverage
- Lighthouse for frontend performance
- Application monitoring (e.g., Sentry, LogRocket)
