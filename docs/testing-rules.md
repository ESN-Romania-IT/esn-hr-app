# Testing Rules - ESN HR App

This document defines the testing standards, strategies, and best practices for the ESN HR App.

---

## 🎯 Testing Goals

- **Code Coverage:** Minimum 80% for critical modules
- **Reliability:** All tests must pass before merging to main
- **Speed:** Test suite should run in under 2 minutes
- **Clarity:** Tests should be readable and serve as documentation
- **Confidence:** Tests should catch regressions and prevent bugs

---

## 🧪 Testing Strategy

### Frontend Testing (Vitest + React Testing Library)
- **Unit Tests:** Individual components, hooks, utilities
- **Integration Tests:** User flows, component interactions
- **Accessibility Tests:** ARIA labels, keyboard navigation, screen readers

### Backend Testing (Jest)
- **Unit Tests:** Services, controllers, utilities, validators
- **Integration Tests:** API endpoints with real HTTP requests
- **Security Tests:** Input validation, authentication, authorization

---

## 📂 Test File Organization

### Frontend
```
src/
├── components/
│   ├── Common/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Input.tsx
│   │   └── Input.test.tsx
├── hooks/
│   ├── useForm.ts
│   ├── useForm.test.ts
│   ├── usePagination.ts
│   └── usePagination.test.ts
└── utils/
    ├── validators.ts
    └── validators.test.ts
```

### Backend
```
src/
├── services/
│   ├── activityService.ts
│   ├── activityService.test.ts
│   ├── userService.ts
│   └── userService.test.ts
├── controllers/
│   ├── activityController.ts
│   └── activityController.test.ts
└── utils/
    ├── validators.ts
    └── validators.test.ts
```

---

## ✅ Frontend Testing Guidelines

### Component Testing Principles
- Test user behavior, not implementation details
- Use accessible queries (`getByRole`, `getByLabelText`)
- Test edge cases and error states
- Ensure keyboard accessibility

### Example: Component Test

**`src/components/Common/Button.test.tsx`**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('applies correct variant styling', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('can be focused with keyboard', () => {
    render(<Button>Focusable</Button>);

    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
```

### Hook Testing

**`src/hooks/useForm.test.ts`**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  it('initializes with provided values', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { title: '', description: '' },
        onSubmit: vi.fn()
      })
    );

    expect(result.current.values).toEqual({ title: '', description: '' });
  });

  it('updates values on handleChange', () => {
    const { result } = renderHook(() => 
      useForm({
        initialValues: { title: '', description: '' },
        onSubmit: vi.fn()
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'title', value: 'New Activity' }
      } as any);
    });

    expect(result.current.values.title).toBe('New Activity');
  });

  it('validates values before submit', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() => 
      useForm({
        initialValues: { title: '', description: '' },
        validate: (values) => {
          const errors: any = {};
          if (!values.title) errors.title = 'Title is required';
          return errors;
        },
        onSubmit: mockSubmit
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.errors.title).toBe('Title is required');
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() => 
      useForm({
        initialValues: { title: 'Event', description: 'Description' },
        validate: () => ({}),
        onSubmit: mockSubmit
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockSubmit).toHaveBeenCalledWith({ 
      title: 'Event', 
      description: 'Description' 
    });
  });
});
```

### Integration Testing

**`src/components/Activities/ActivityForm.test.tsx`**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityForm } from './ActivityForm';

describe('ActivityForm', () => {
  it('submits form with valid data', async () => {
    const mockSubmit = vi.fn();
    render(<ActivityForm onSubmit={mockSubmit} />);

    // Fill out form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Team Building Event' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'A fun team building activity' }
    });
    fireEvent.change(screen.getByLabelText(/department/i), {
      target: { value: 'Culture' }
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2026-03-15' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Team Building Event',
        description: 'A fun team building activity',
        department: 'Culture',
        date: '2026-03-15',
        maxParticipants: 20
      });
    });
  });

  it('displays validation errors for empty required fields', async () => {
    const mockSubmit = vi.fn();
    render(<ActivityForm onSubmit={mockSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('pre-fills form when editing existing item', () => {
    const existingData = {
      title: 'Existing Event',
      description: 'Existing description',
      department: 'Education',
      date: '2026-04-01',
      maxParticipants: 30
    };

    render(<ActivityForm initialData={existingData} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Event');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
    expect(screen.getByLabelText(/department/i)).toHaveValue('Education');
  });
});
```

---

## ✅ Backend Testing Guidelines

### Service Testing

**`src/services/activityService.test.ts`**
```typescript
import { 
  findAllActivities, 
  findActivityById, 
  createNewActivity, 
  deleteActivityById 
} from './activityService';
import { db } from '../config/database';

jest.mock('../config/database');

describe('ActivityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllActivities', () => {
    it('returns all activities when no filters provided', async () => {
      const mockActivities = [
        { id: 1, title: 'Event 1', department: 'Culture' },
        { id: 2, title: 'Event 2', department: 'Education' }
      ];
      (db.query as jest.Mock).mockResolvedValue(mockActivities);

      const result = await findAllActivities({});

      expect(result).toEqual(mockActivities);
    });

    it('filters activities by department', async () => {
      const mockActivities = [
        { id: 1, title: 'Event 1', department: 'Culture' }
      ];
      (db.query as jest.Mock).mockResolvedValue(mockActivities);

      await findAllActivities({ department: 'Culture' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('department = ?'),
        expect.arrayContaining(['Culture'])
      );
    });

    it('filters activities by status', async () => {
      await findAllActivities({ status: 'Published' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('status = ?'),
        expect.arrayContaining(['Published'])
      );
    });
  });

  describe('createNewActivity', () => {
    it('creates activity successfully with valid data', async () => {
      const activityData = { 
        title: 'New Event', 
        description: 'Description',
        department: 'Culture',
        date: '2026-03-15'
      };
      const mockInsertResult = { insertId: 1 };
      const mockActivity = { id: 1, ...activityData };

      (db.query as jest.Mock)
        .mockResolvedValueOnce(mockInsertResult) // Insert
        .mockResolvedValueOnce([mockActivity]); // Find by ID

      const result = await createNewActivity(activityData);

      expect(result).toEqual(mockActivity);
    });

    it('throws error when required fields are missing', async () => {
      const invalidData = { title: 'Event' }; // Missing required fields

      await expect(createNewActivity(invalidData))
        .rejects.toThrow();
    });
  });

  describe('deleteActivityById', () => {
    it('deletes activity successfully', async () => {
      const mockActivity = { id: 1, title: 'Event' };
      (db.query as jest.Mock)
        .mockResolvedValueOnce([mockActivity]) // Find
        .mockResolvedValueOnce({}); // Delete

      await deleteActivityById(1);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM activities WHERE id = ?', 
        [1]
      );
    });

    it('throws error when activity not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      await expect(deleteActivityById(999))
        .rejects.toThrow('not found');
    });
  });
});
```

### Controller/API Testing

**`src/controllers/activityController.test.ts`**
```typescript
import request from 'supertest';
import app from '../app';

describe('Activity API Endpoints', () => {
  describe('GET /api/activities', () => {
    it('returns 200 with list of activities', async () => {
      const response = await request(app)
        .get('/api/activities')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('filters activities by department query parameter', async () => {
      const response = await request(app)
        .get('/api/activities?department=Culture')
        .expect(200);

      expect(response.body.data.every((a: any) => 
        a.department === 'Culture'
      )).toBe(true);
    });

    it('filters activities by status', async () => {
      const response = await request(app)
        .get('/api/activities?status=Published')
        .expect(200);

      expect(response.body.data.every((a: any) => 
        a.status === 'Published'
      )).toBe(true);
    });
  });

  describe('POST /api/activities', () => {
    it('creates activity with valid data', async () => {
      const activityData = {
        title: 'New Event',
        description: 'Event description',
        department: 'Culture',
        date: '2026-03-15',
        maxParticipants: 20
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(activityData.title);
    });

    it('returns 400 for missing required fields', async () => {
      const incompleteData = {
        title: 'Event'
        // Missing description, department, date
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
    });

    it('returns 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/activities')
        .send({ title: 'Event' })
        .expect(401);
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('updates activity successfully', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/activities/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe('Updated Title');
    });

    it('returns 404 for non-existent activity', async () => {
      const response = await request(app)
        .put('/api/activities/999')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ title: 'Update' })
        .expect(404);

      expect(response.body.error.message).toMatch(/not found/i);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('deletes activity successfully', async () => {
      await request(app)
        .delete('/api/activities/1')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .expect(204);
    });

    it('returns 403 for insufficient permissions', async () => {
      await request(app)
        .delete('/api/activities/1')
        .set('Authorization', `Bearer ${mockVolunteerToken}`)
        .expect(403);
    });
  });
});
```

---

## 🔐 Security Testing

### Input Validation Tests
```typescript
describe('Input Validation', () => {
  it('rejects SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE activities; --";

    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: maliciousInput, description: 'Test' })
      .expect(400);
  });

  it('sanitizes XSS attempts', async () => {
    const xssInput = '<script>alert("xss")</script>';

    const response = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: xssInput, description: 'Test' })
      .expect(400);
  });

  it('validates email format', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ email: 'invalid-email', name: 'Test' })
      .expect(400);

    expect(response.body.error.message).toMatch(/email/i);
  });
});
```

### Authorization Tests
```typescript
describe('Authorization', () => {
  it('allows admin to delete resources', async () => {
    await request(app)
      .delete('/api/activities/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('denies volunteer from deleting resources', async () => {
    await request(app)
      .delete('/api/activities/1')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(403);
  });

  it('allows board members to edit own resources', async () => {
    await request(app)
      .put('/api/activities/1')
      .set('Authorization', `Bearer ${boardMemberToken}`)
      .send({ title: 'Updated' })
      .expect(200);
  });
});
```

---

## ♿ Accessibility Testing

### ARIA Attributes
```typescript
it('has proper ARIA attributes', () => {
  render(<Input label="Title" name="title" value="" onChange={() => {}} required />);

  const input = screen.getByLabelText(/title/i);
  expect(input).toHaveAttribute('aria-required', 'true');
});

it('announces errors to screen readers', async () => {
  render(<Input 
    label="Email" 
    name="email" 
    value="" 
    onChange={() => {}} 
    error="Invalid email" 
  />);

  const errorMessage = screen.getByRole('alert');
  expect(errorMessage).toHaveTextContent('Invalid email');
});
```

### Keyboard Navigation
```typescript
it('supports keyboard navigation through form', () => {
  render(<ActivityForm onSubmit={vi.fn()} />);

  const titleInput = screen.getByLabelText(/title/i);
  const descriptionInput = screen.getByLabelText(/description/i);

  titleInput.focus();
  expect(document.activeElement).toBe(titleInput);

  fireEvent.keyDown(titleInput, { key: 'Tab' });
  expect(document.activeElement).toBe(descriptionInput);
});

it('allows form submission with Enter key', () => {
  const mockSubmit = vi.fn();
  render(<ActivityForm onSubmit={mockSubmit} />);

  const form = screen.getByRole('form') || screen.getByTestId('form');
  fireEvent.submit(form);

  // Form validation should run
});
```

---

## 📊 Code Coverage

### Running Coverage

**Frontend:**
```bash
cd frontend
npm run test:coverage
```

**Backend:**
```bash
cd backend
npm run test:coverage
```

### Coverage Configuration

**`vitest.config.ts` (Frontend)**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.tsx',
        '**/*.test.ts',
        '**/*.test.tsx'
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
});
```

### Coverage Targets
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

---

## 🏃 Running Tests

### Frontend
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- Button.test.tsx

# Run with coverage
npm run test:coverage
```

### Backend
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test suite
npm test -- activityService.test.ts

# Run with coverage
npm run test:coverage
```

---

## 🚫 What NOT to Do

- ❌ Don't test implementation details (internal state, private methods)
- ❌ Don't write tests that depend on external services without mocking
- ❌ Don't skip edge cases and error scenarios
- ❌ Don't write flaky tests
- ❌ Don't commit failing tests
- ❌ Don't write slow tests (> 5 seconds per test)
- ❌ Don't test third-party library functionality
- ❌ Don't hardcode test data

---

## ✅ Best Practices

### Test Structure (AAA Pattern)
```typescript
it('creates activity with valid data', async () => {
  // Arrange - Setup test data and mocks
  const activityData = { title: 'Event', description: 'Description' };
  const mockSubmit = vi.fn();

  // Act - Execute the code under test
  render(<ActivityForm onSubmit={mockSubmit} />);
  // ... fill form and submit

  // Assert - Verify the results
  expect(mockSubmit).toHaveBeenCalledWith(activityData);
});
```

### Descriptive Test Names
```typescript
// ✅ Good - Describes behavior and expected outcome
it('displays error message when title is empty', () => {});

// ❌ Bad - Too vague
it('validates title', () => {});
```

### Test Independence
```typescript
// ✅ Good - Each test is independent
describe('ActivityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates activity', () => {});
  it('deletes activity', () => {});
});

// ❌ Bad - Tests depend on each other
let activityId;
it('creates activity', () => { activityId = 1; });
it('deletes activity', () => { deleteActivity(activityId); });
```