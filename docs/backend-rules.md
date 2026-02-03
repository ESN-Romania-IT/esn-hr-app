# Backend Rules - ESN HR App

This document defines the backend architecture, coding standards, and best practices for the ESN HR App.

---

## 🏗️ Architecture

### Three-Layer Architecture

**Routes → Controllers → Services**

```
src/
├── routes/          # Express routers, route definitions
├── controllers/     # Request handling, validation, response formatting
├── services/        # Business logic, database operations
├── middleware/      # Authentication, authorization, error handling
├── utils/           # Helper functions, constants
├── config/          # Environment variables, database config
├── models/          # Database models/schemas (if using ORM)
└── docs/            # OpenAPI/Swagger documentation
```

### Layer Responsibilities

- **Routes (`src/routes/`)**: Define endpoints, apply middleware, delegate to controllers
- **Controllers (`src/controllers/`)**: Parse requests, validate input, call services, format responses
- **Services (`src/services/`)**: Execute business logic, interact with database, handle errors
- **Middleware (`src/middleware/`)**: Authentication, authorization, logging, error handling, validation

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── routes/
│   │   ├── users.ts
│   │   ├── activities.ts
│   │   ├── recruitment.ts
│   │   └── index.ts          # Route aggregator
│   ├── controllers/
│   │   ├── userController.ts
│   │   ├── activityController.ts
│   │   └── recruitmentController.ts
│   ├── services/
│   │   ├── userService.ts
│   │   ├── activityService.ts
│   │   └── recruitmentService.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── logger.ts
│   │   ├── emailService.ts
│   │   └── constants.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   └── models/               # If using ORM
│       ├── User.ts
│       ├── Activity.ts
│       └── Application.ts
├── package.json
├── tsconfig.json
└── .env
```

---

## 🔐 Security Best Practices

### Input Validation
- Validate **all** user input on every endpoint
- Sanitize data to prevent SQL injection and XSS attacks
- Use validation libraries like `express-validator` or `joi`
- Return clear, user-friendly validation error messages
- Never trust client-side validation alone

### Data Protection
- Never expose sensitive data in API responses (passwords, tokens, internal IDs)
- Hash sensitive data using appropriate algorithms
- Use environment variables for all secrets
- Implement rate limiting on all endpoints (especially data-intensive ones)

### Authentication & Authorization
- Always verify user identity before processing requests
- Check user permissions for resource access
- Use JWT tokens with appropriate expiration times
- Implement refresh token mechanism for long sessions

---

## 📡 API Response Format

### Success Response
```typescript
{
  success: true,
  data: { ... },
  message: "Operation successful" // optional
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE", // optional
    details: [ ... ] // optional validation errors
  }
}
```

### HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate entry)
- `500 Internal Server Error` - Server error

---

## 🛣️ Routing Patterns

### RESTful Resource Routes

**`src/routes/users.ts`**
```typescript
import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateUserInput } from '../middleware/validator';

const router = express.Router();

// Public routes (if any)
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Protected routes requiring authentication
router.post('/', authenticate, authorize('Admin'), validateUserInput, createUser);
router.put('/:id', authenticate, authorize('Admin', 'Board Member'), updateUser);
router.delete('/:id', authenticate, authorize('Admin'), deleteUser);

export default router;
```

### Route Aggregation

**`src/routes/index.ts`**
```typescript
import express from 'express';
import userRoutes from './users';
import activityRoutes from './activities';
import recruitmentRoutes from './recruitment';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/activities', activityRoutes);
router.use('/recruitment', recruitmentRoutes);

export default router;
```

---

## 🎛️ Controller Patterns

### Standard CRUD Controller

**`src/controllers/userController.ts`**
```typescript
import { Request, Response } from 'express';
import { 
  findAllUsers, 
  findUserById, 
  createNewUser, 
  updateUserById, 
  deleteUserById 
} from '../services/userService';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, search, page, limit } = req.query;
    const users = await findAllUsers({ role, status, search, page, limit });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await findUserById(Number(id));

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await createNewUser(userData);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await updateUserById(Number(id), updateData);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteUserById(Number(id));

    return res.status(204).send();
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Controller Best Practices
- Keep controllers thin - delegate business logic to services
- Handle request/response formatting only
- Validate input before passing to services
- Always use try-catch for error handling
- Return appropriate HTTP status codes

---

## ⚙️ Service Patterns

### Service Layer Best Practices

**`src/services/userService.ts`**
```typescript
import { db } from '../config/database';
import { AppError, NotFoundError } from '../utils/errors';

export const findAllUsers = async (filters: any) => {
  // Build dynamic query based on filters
  let query = 'SELECT id, email, name, role, status, created_at FROM users WHERE 1=1';
  const params: any[] = [];

  if (filters.role) {
    query += ' AND role = ?';
    params.push(filters.role);
  }

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const users = await db.query(query, params);
  return users;
};

export const findUserById = async (id: number) => {
  const users = await db.query(
    'SELECT id, email, name, role, status, created_at FROM users WHERE id = ?',
    [id]
  );
  return users[0] || null;
};

export const createNewUser = async (userData: any) => {
  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = ?', 
    [userData.email]
  );

  if (existingUser.length > 0) {
    throw new AppError('User with this email already exists', 409);
  }

  // Insert new user
  const result = await db.query(
    'INSERT INTO users (email, name, role, status) VALUES (?, ?, ?, ?)',
    [userData.email, userData.name, userData.role, userData.status || 'Active']
  );

  return findUserById(result.insertId);
};

export const updateUserById = async (id: number, updateData: any) => {
  const user = await findUserById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // Build update query dynamically
  const fields = Object.keys(updateData);
  const values = Object.values(updateData);

  const setClause = fields.map(field => `${field} = ?`).join(', ');

  await db.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );

  return findUserById(id);
};

export const deleteUserById = async (id: number) => {
  const user = await findUserById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  await db.query('DELETE FROM users WHERE id = ?', [id]);
};
```

### Service Best Practices
- All business logic goes in services
- Services should not know about HTTP (no req/res objects)
- Throw descriptive errors with appropriate status codes
- Use parameterized queries to prevent SQL injection
- Keep services focused on single responsibility

---

## 🔒 Middleware Patterns

### Authentication Middleware

**`src/middleware/authMiddleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'No authentication token provided' }
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' }
    });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }

    next();
  };
};
```

### Validation Middleware

**`src/middleware/validator.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }

  next();
};

// Example: User validation
export const validateUserInput = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['Volunteer', 'Board Member', 'Admin']).withMessage('Invalid role'),
  handleValidationErrors
];

// Example: Activity validation
export const validateActivityInput = [
  body('title').notEmpty().withMessage('Title is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1'),
  handleValidationErrors
];
```

---

## 🛠️ Error Handling

### Custom Error Classes

**`src/utils/errors.ts`**
```typescript
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
```

### Global Error Handler

**`src/middleware/errorHandler.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error (don't expose stack trace in production)
  logger.error(`[ERROR] ${message}`, {
    path: req.path,
    method: req.method,
    statusCode,
    stack: err.stack,
    user: req.user?.id
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

---

## 📝 Logging

### Structured Logging

**`src/utils/logger.ts`**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Logging Best Practices
- Log all errors with context (user, action, timestamp)
- Log important business events (user created, activity published, etc.)
- Never log sensitive data (passwords, tokens, personal info)
- Use appropriate log levels (error, warn, info, debug)
- Structure logs in JSON format for easy parsing

---

## ✅ Code Quality

### TypeScript
- Use **strict mode** in `tsconfig.json`
- Define interfaces for all data structures
- Avoid `any` type; use `unknown` if necessary
- Use proper type annotations for function parameters and returns

### Naming Conventions
- **Files:** camelCase (`userController.ts`, `activityService.ts`)
- **Functions:** camelCase (`findUserById`, `createActivity`)
- **Constants:** UPPER_SNAKE_CASE (`JWT_SECRET`, `MAX_FILE_SIZE`)
- **Interfaces:** PascalCase (`User`, `Activity`, `CreateUserDto`)
- **Classes:** PascalCase (`AppError`, `DatabaseConnection`)

### Comments & Documentation
- Use JSDoc for public functions
- Explain **why**, not **what**
- Document complex business logic
- Keep comments up to date with code changes

**Example:**
```typescript
/**
 * Calculates user participation statistics across all activities
 * 
 * @param userId - The ID of the user
 * @param dateRange - Optional date range for filtering
 * @returns Statistics object with hours, count, and ratings
 */
export const getUserStats = async (userId: number, dateRange?: DateRange) => {
  // Implementation
};
```

---

## 🧪 Testing

### Unit Testing Services

**`src/services/userService.test.ts`**
```typescript
import { findUserById, createNewUser, deleteUserById } from './userService';
import { db } from '../config/database';

jest.mock('../config/database');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      (db.query as jest.Mock).mockResolvedValue([mockUser]);

      const result = await findUserById(1);

      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should return null when user not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('createNewUser', () => {
    it('should create new user successfully', async () => {
      const userData = { email: 'new@example.com', name: 'New User', role: 'Volunteer' };
      const mockInsertResult = { insertId: 1 };
      const mockUser = { id: 1, ...userData };

      (db.query as jest.Mock)
        .mockResolvedValueOnce([]) // Check existing user
        .mockResolvedValueOnce(mockInsertResult) // Insert
        .mockResolvedValueOnce([mockUser]); // Find by ID

      const result = await createNewUser(userData);

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exists', async () => {
      const userData = { email: 'existing@example.com', name: 'Existing User' };
      (db.query as jest.Mock).mockResolvedValue([{ id: 1 }]);

      await expect(createNewUser(userData)).rejects.toThrow('already exists');
    });
  });
});
```

---

## 🚫 What NOT to Do

- ❌ Don't expose sensitive data in API responses
- ❌ Don't log sensitive information
- ❌ Don't use plain SQL queries without parameterization
- ❌ Don't skip input validation
- ❌ Don't hardcode secrets (use environment variables)
- ❌ Don't write business logic in routes or controllers
- ❌ Don't use synchronous file operations
- ❌ Don't ignore error handling
- ❌ Don't skip security middleware on protected routes

---

## 📚 Required Dependencies

### Core
- `express` - Web framework
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development hot reload
- `dotenv` - Environment variables

### Security
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `cors` - CORS middleware

### Utilities
- `winston` - Logging

### Database
- `pg` or `mysql2` - Database driver

### Testing
- `jest` - Testing framework
- `supertest` - HTTP testing
- `@types/*` - TypeScript type definitions
