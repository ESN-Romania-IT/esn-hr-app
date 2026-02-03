# Frontend Rules - ESN HR App

This document defines the frontend architecture, coding standards, and best practices for the ESN HR App.

---

## 🏗️ Architecture

### Component-Based Architecture

**React + TypeScript + Tailwind CSS**

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── contexts/        # React Context providers
├── utils/           # Helper functions
├── types/           # TypeScript interfaces and types
├── assets/          # Images, fonts, icons
└── styles/          # Global styles
```

---

## 📂 Folder Structure

```
frontend/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── components/
│   │   ├── Common/              # Shared components (Button, Input, Modal)
│   │   ├── Layout/              # Layout components (Navbar, Footer, Sidebar)
│   │   ├── Users/               # User-specific components
│   │   ├── Activities/          # Activity-specific components
│   │   └── Recruitment/         # Recruitment-specific components
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ActivitiesPage.tsx
│   │   └── MembersPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useForm.ts
│   │   ├── useApi.ts
│   │   └── usePagination.ts
│   ├── services/
│   │   ├── api.ts              # Axios instance
│   │   ├── userService.ts
│   │   ├── activityService.ts
│   │   └── recruitmentService.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── User.ts
│   │   ├── Activity.ts
│   │   ├── Application.ts
│   │   └── index.ts
│   ├── assets/
│   │   └── images/
│   └── styles/
│       └── index.css           # Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## ⚛️ Component Guidelines

### Functional Components Only
- Use **functional components** with hooks (no class components)
- Use TypeScript interfaces for all props
- Export components as named exports

### Component Structure Template

**`src/components/Common/Button.tsx`**
```typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 transition';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      aria-busy={loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

### Component Organization
- One component per file
- Export component as named export
- Create `index.ts` for barrel exports
- Co-locate tests with components

**`src/components/Common/index.ts`**
```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Card } from './Card';
export { Table } from './Table';
```

---

## 🎨 Styling with Tailwind CSS

### Rules
- **Always use Tailwind utility classes**
- Avoid inline styles
- Use `className` prop for custom classes
- Follow responsive design: mobile-first approach

### Responsive Design
```tsx
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  {/* Mobile: full width */}
  {/* Tablet: half width */}
  {/* Desktop: third width */}
  {/* Large desktop: quarter width */}
</div>
```

### Common Patterns
```tsx
{/* Card */}
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <h2 className="text-xl font-bold mb-4">Title</h2>
  <p className="text-gray-600">Content</p>
</div>

{/* Form Input */}
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

{/* Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

{/* Flex Container */}
<div className="flex items-center justify-between gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

### Custom Classes (when needed)
**`src/styles/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .esn-card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition;
  }

  .esn-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .esn-button-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition;
  }
}
```

---

## 🔐 State Management & Context

### Context Pattern

**`src/contexts/DataContext.tsx`**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface DataContextType {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  updateItem: (id: number, data: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getData();
      setData(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, updateData: any) => {
    try {
      const updated = await apiService.update(id, updateData);
      setData(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <DataContext.Provider value={{ data, loading, error, fetchData, updateItem }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
```

---

## 📡 API Service Layer

### Axios Instance

**`src/services/api.ts`**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Pattern

**`src/services/activityService.ts`**
```typescript
import api from './api';
import { Activity, CreateActivityDto } from '../types/Activity';

export const activityService = {
  getAll: async (filters?: { 
    department?: string; 
    status?: string; 
    search?: string 
  }): Promise<Activity[]> => {
    const response = await api.get('/activities', { params: filters });
    return response.data.data;
  },

  getById: async (id: number): Promise<Activity> => {
    const response = await api.get(`/activities/${id}`);
    return response.data.data;
  },

  create: async (activityData: CreateActivityDto): Promise<Activity> => {
    const response = await api.post('/activities', activityData);
    return response.data.data;
  },

  update: async (id: number, activityData: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },

  // Custom endpoints
  publish: async (id: number): Promise<Activity> => {
    const response = await api.post(`/activities/${id}/publish`);
    return response.data.data;
  },

  addParticipant: async (activityId: number, userId: number): Promise<void> => {
    await api.post(`/activities/${activityId}/participants`, { userId });
  }
};
```

---

## 🪝 Custom Hooks

### Form Hook

**`src/hooks/useForm.ts`**
```typescript
import { useState, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};
```

### Data Fetching Hook

**`src/hooks/useApi.ts`**
```typescript
import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
}

export const useApi = <T>({ fetchFn, dependencies = [] }: UseApiOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
};
```

### Pagination Hook

**`src/hooks/usePagination.ts`**
```typescript
import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export const usePagination = ({ 
  totalItems, 
  itemsPerPage = 10,
  initialPage = 1 
}: UsePaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginationRange = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return {
    currentPage,
    totalPages,
    paginationRange,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1
  };
};
```

---

## 📝 Form Handling

### Reusable Input Component

**`src/components/Common/Input.tsx`**
```typescript
import React from 'react';

interface InputProps {
  label: string;
  type?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = ''
}) => {
  const id = `input-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`esn-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Form Component Example

**`src/components/Activities/ActivityForm.tsx`**
```typescript
import React from 'react';
import { useForm } from '../../hooks/useForm';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';

interface ActivityFormData {
  title: string;
  description: string;
  department: string;
  date: string;
  maxParticipants: number;
}

interface ActivityFormProps {
  initialData?: Partial<ActivityFormData>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  onCancel?: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      department: initialData?.department || 'Social Inclusion',
      date: initialData?.date || '',
      maxParticipants: initialData?.maxParticipants || 20
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.title) errors.title = 'Title is required';
      if (!values.description) errors.description = 'Description is required';
      if (!values.date) errors.date = 'Date is required';
      if (values.maxParticipants < 1) errors.maxParticipants = 'Must be at least 1';
      return errors;
    },
    onSubmit
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        error={errors.title}
        required
      />

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          rows={4}
          className="esn-input"
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.description}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          id="department"
          name="department"
          value={values.department}
          onChange={handleChange}
          className="esn-input"
        >
          <option value="Social Inclusion">Social Inclusion</option>
          <option value="Culture">Culture</option>
          <option value="Education">Education</option>
          <option value="Health & Well-being">Health & Well-being</option>
          <option value="Environmental Sustainability">Environmental Sustainability</option>
          <option value="Skills & Employability">Skills & Employability</option>
        </select>
      </div>

      <Input
        label="Date"
        type="date"
        name="date"
        value={values.date}
        onChange={handleChange}
        error={errors.date}
        required
      />

      <Input
        label="Max Participants"
        type="number"
        name="maxParticipants"
        value={values.maxParticipants}
        onChange={handleChange}
        error={errors.maxParticipants}
        required
      />

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
```

---

## ♿ Accessibility (WCAG 2.1 Level AA)

### Required Practices
- **Semantic HTML:** Use proper tags (`<button>`, `<nav>`, `<main>`, `<article>`)
- **ARIA labels:** Add `aria-label`, `aria-describedby`, `aria-labelledby`
- **Keyboard navigation:** All interactive elements accessible via keyboard
- **Focus indicators:** Visible focus states
- **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Alt text:** All images must have descriptive `alt` attributes
- **Form labels:** Every input must have an associated `<label>`
- **Error announcements:** Use `role="alert"` for dynamic errors

### Accessibility Checklist
```typescript
// ✅ Good - Accessible button with icon
<button 
  type="button"
  onClick={handleDelete}
  aria-label="Delete activity"
  className="focus:outline-none focus:ring-2 focus:ring-red-500"
>
  <TrashIcon className="w-5 h-5" aria-hidden="true" />
</button>

// ❌ Bad - Not accessible
<div onClick={handleDelete}>
  <TrashIcon />
</div>

// ✅ Good - Proper form label
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-required="true" />

// ❌ Bad - No label
<input type="email" placeholder="Email" />

// ✅ Good - Error announcement
{error && (
  <p role="alert" className="text-red-600">
    {error}
  </p>
)}
```

---

## ✅ Code Quality

### TypeScript
- Use **strict mode** in `tsconfig.json`
- Define interfaces for all props and data structures
- Avoid `any` type
- Use proper type annotations

### Naming Conventions
- **Components:** PascalCase (`ActivityCard`, `UserTable`, `DashboardPage`)
- **Files:** PascalCase for components, camelCase for others
- **Functions:** camelCase (`handleSubmit`, `fetchActivities`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Interfaces/Types:** PascalCase (`Activity`, `User`, `FormData`)

---

## 🧪 Testing

### Component Testing

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

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
```

---

## 🚫 What NOT to Do

- ❌ Don't use inline styles
- ❌ Don't use class components
- ❌ Don't skip accessibility attributes
- ❌ Don't hardcode API URLs
- ❌ Don't ignore TypeScript errors
- ❌ Don't skip form validation
- ❌ Don't mutate state directly
- ❌ Don't create massive components

---

## 📚 Required Dependencies

### Core
- `react`, `react-dom` - UI library
- `react-router-dom` - Routing
- `typescript` - TypeScript

### HTTP & State
- `axios` - HTTP client

### Styling
- `tailwindcss`, `postcss`, `autoprefixer`

### Development
- `vite` - Build tool
- `vitest` - Testing
- `@testing-library/react` - Testing utilities
