# Refactoring Rules - ESN HR App

This document defines when and how to refactor code in the ESN HR App.

---

## 🎯 When to Refactor

### ✅ Refactor When:
- Code is duplicated in 3+ places (DRY violation)
- Function/method is longer than 50 lines
- Component has more than 300 lines
- Cyclomatic complexity is high (> 10)
- Code is difficult to test
- Adding new features requires significant changes to existing code
- Performance issues are identified
- Code review feedback suggests improvements
- Technical debt is accumulating

### ❌ Don't Refactor When:
- Feature is working and well-tested (unless addressing tech debt)
- You're on a tight deadline (schedule refactoring for later)
- You don't fully understand the code (ask for clarification first)
- No tests exist (write tests first, then refactor)
- It's purely cosmetic with no real benefit

---

## 🛠️ Refactoring Principles

### 1. DRY (Don't Repeat Yourself)

**Before:**
```typescript
// Duplicated validation logic in multiple components
function ActivityForm() {
  const validateActivity = (data: any) => {
    if (!data.title || data.title.length < 3) return false;
    if (!data.description) return false;
    return true;
  };
  // ...
}

function QuickActivityCreate() {
  const validateActivity = (data: any) => {
    if (!data.title || data.title.length < 3) return false;
    if (!data.description) return false;
    return true;
  };
  // ...
}
```

**After:**
```typescript
// Centralized in utils/validators.ts
export function validateActivityData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  if (!data.description) {
    errors.push('Description is required');
  }

  return { valid: errors.length === 0, errors };
}

// Usage in components
import { validateActivityData } from '../utils/validators';

const { valid, errors } = validateActivityData(formData);
```

---

### 2. Single Responsibility Principle

**Before:**
```typescript
// Component doing too much
function ActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    setLoading(true);
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csv = activities.map(a => 
        `${a.title},${a.department},${a.date}`
      ).join('\n');
      downloadFile(csv, 'activities.csv');
    } else if (exportFormat === 'pdf') {
      generatePDF(activities);
    }
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <FilterPanel onFilter={handleFilter} />
      {loading ? <Spinner /> : <ActivityTable data={activities} />}
      <ExportButton onClick={handleExport} format={exportFormat} />
    </div>
  );
}
```

**After:**
```typescript
// Separate concerns into hooks and utilities

// Custom hook for data fetching
function useActivities(filters: any) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    activityService.getAll(filters)
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [filters]);

  return { activities, loading };
}

// Utility for export
export function exportActivities(activities: Activity[], format: 'csv' | 'pdf') {
  if (format === 'csv') {
    const csv = activities.map(a => 
      `${a.title},${a.department},${a.date}`
    ).join('\n');
    downloadFile(csv, 'activities.csv');
  } else {
    generatePDF(activities);
  }
}

// Simplified component
function ActivityDashboard() {
  const [filters, setFilters] = useState({});
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const { activities, loading } = useActivities(filters);

  return (
    <div>
      <FilterPanel onFilter={setFilters} />
      {loading ? <Spinner /> : <ActivityTable data={activities} />}
      <ExportButton 
        onClick={() => exportActivities(activities, exportFormat)} 
        format={exportFormat} 
      />
    </div>
  );
}
```

---

### 3. Extract Complex Logic

**Before:**
```typescript
function calculateStats(activities: Activity[], userId: number) {
  let totalHours = 0;
  let completed = 0;
  let avgRating = 0;
  let departmentCounts: Record<string, number> = {};
  let monthlyBreakdown: Record<string, number> = {};

  for (const activity of activities) {
    const participation = activity.participants.find(p => p.userId === userId);
    if (participation) {
      if (activity.status === 'Completed') {
        completed++;
        totalHours += participation.hours || 0;
        avgRating += participation.rating || 0;
      }

      departmentCounts[activity.department] = 
        (departmentCounts[activity.department] || 0) + 1;

      const month = activity.date.substring(0, 7);
      monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + 1;
    }
  }

  avgRating = completed > 0 ? avgRating / completed : 0;

  return { totalHours, completed, avgRating, departmentCounts, monthlyBreakdown };
}
```

**After:**
```typescript
// Break down into smaller, testable functions

function getUserParticipations(activities: Activity[], userId: number) {
  return activities
    .map(a => ({ 
      activity: a, 
      participation: a.participants.find(p => p.userId === userId) 
    }))
    .filter(({ participation }) => participation !== undefined);
}

function calculateTotalHours(participations: any[]) {
  return participations
    .filter(({ activity }) => activity.status === 'Completed')
    .reduce((sum, { participation }) => sum + (participation.hours || 0), 0);
}

function calculateAverageRating(participations: any[]) {
  const completed = participations.filter(({ activity }) => 
    activity.status === 'Completed'
  );

  if (completed.length === 0) return 0;

  const totalRating = completed.reduce((sum, { participation }) => 
    sum + (participation.rating || 0), 0
  );

  return totalRating / completed.length;
}

function getDepartmentBreakdown(participations: any[]) {
  return participations.reduce((counts, { activity }) => {
    counts[activity.department] = (counts[activity.department] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

function getMonthlyBreakdown(participations: any[]) {
  return participations.reduce((breakdown, { activity }) => {
    const month = activity.date.substring(0, 7);
    breakdown[month] = (breakdown[month] || 0) + 1;
    return breakdown;
  }, {} as Record<string, number>);
}

// Main function is now simple and readable
function calculateStats(activities: Activity[], userId: number) {
  const participations = getUserParticipations(activities, userId);
  const completed = participations.filter(({ activity }) => 
    activity.status === 'Completed'
  ).length;

  return {
    totalHours: calculateTotalHours(participations),
    completed,
    avgRating: calculateAverageRating(participations),
    departmentCounts: getDepartmentBreakdown(participations),
    monthlyBreakdown: getMonthlyBreakdown(participations)
  };
}
```

---

### 4. Replace Magic Numbers/Strings with Constants

**Before:**
```typescript
if (activity.participants.length >= 50) {
  sendNotification('Activity is full');
}

if (activity.status === 'published') {
  // ...
}

setTimeout(() => {
  refreshData();
}, 5000);
```

**After:**
```typescript
// utils/constants.ts
export const ACTIVITY_LIMITS = {
  MAX_PARTICIPANTS: 50,
  MIN_PARTICIPANTS: 5
} as const;

export const ACTIVITY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const REFRESH_INTERVALS = {
  ACTIVITIES: 5000,
  NOTIFICATIONS: 30000,
  DASHBOARD: 60000
} as const;

// Usage
if (activity.participants.length >= ACTIVITY_LIMITS.MAX_PARTICIPANTS) {
  sendNotification('Activity is full');
}

if (activity.status === ACTIVITY_STATUS.PUBLISHED) {
  // ...
}

setTimeout(() => {
  refreshData();
}, REFRESH_INTERVALS.ACTIVITIES);
```

---

### 5. Simplify Conditional Logic

**Before:**
```typescript
function canEditActivity(user: User, activity: Activity): boolean {
  if (user.role === 'Admin') {
    return true;
  } else if (user.role === 'Board Member') {
    if (activity.createdBy === user.id) {
      return true;
    } else if (activity.status === 'Draft') {
      return true;
    } else {
      return false;
    }
  } else if (user.role === 'Volunteer') {
    if (activity.createdBy === user.id && activity.status === 'Draft') {
      return true;
    } else {
      return false;
    }
  }
  return false;
}
```

**After:**
```typescript
function canEditActivity(user: User, activity: Activity): boolean {
  // Admins can edit any activity
  if (user.role === 'Admin') return true;

  // Board members can edit their own activities or any draft
  if (user.role === 'Board Member') {
    return activity.createdBy === user.id || activity.status === 'Draft';
  }

  // Volunteers can only edit their own drafts
  if (user.role === 'Volunteer') {
    return activity.createdBy === user.id && activity.status === 'Draft';
  }

  return false;
}
```

---

### 6. Extract Components

**Before:**
```typescript
function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{activity.title}</h3>
            <span className={`px-3 py-1 rounded text-sm ${
              activity.status === 'Published' ? 'bg-green-100 text-green-800' :
              activity.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {activity.status}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{activity.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Department</span>
              <p className="font-medium">{activity.department}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Date</span>
              <p className="font-medium">{formatDate(activity.date)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Participants</span>
              <p className="font-medium">
                {activity.participants.length} / {activity.maxParticipants}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              View Details
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**After:**
```typescript
// Break into smaller, reusable components

function StatusBadge({ status }: { status: string }) {
  const colors = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-100 text-gray-800',
    Completed: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-3 py-1 rounded text-sm ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

function ActivityMetadata({ activity }: { activity: Activity }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div>
        <span className="text-sm text-gray-500">Department</span>
        <p className="font-medium">{activity.department}</p>
      </div>
      <div>
        <span className="text-sm text-gray-500">Date</span>
        <p className="font-medium">{formatDate(activity.date)}</p>
      </div>
      <div>
        <span className="text-sm text-gray-500">Participants</span>
        <p className="font-medium">
          {activity.participants.length} / {activity.maxParticipants}
        </p>
      </div>
    </div>
  );
}

function ActivityActions({ activityId }: { activityId: number }) {
  return (
    <div className="flex gap-2">
      <Button variant="primary" onClick={() => viewDetails(activityId)}>
        View Details
      </Button>
      <Button variant="secondary" onClick={() => editActivity(activityId)}>
        Edit
      </Button>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="esn-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{activity.title}</h3>
        <StatusBadge status={activity.status} />
      </div>

      <p className="text-gray-600 mb-4">{activity.description}</p>

      <ActivityMetadata activity={activity} />
      <ActivityActions activityId={activity.id} />
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
```

---

## 🔄 Refactoring Process

### 1. Write Tests First
Before refactoring, ensure the code has adequate test coverage. This ensures refactoring doesn't break functionality.

```bash
# Check current coverage
npm run test:coverage

# Write missing tests
npm test -- --watch
```

### 2. Make Small Changes
Refactor in small, incremental steps. Commit after each successful change.

```bash
# Good commit sequence
git commit -m "refactor: extract validation logic to utils"
git commit -m "refactor: create StatusBadge component"
git commit -m "refactor: simplify conditional in canEditActivity"
```

### 3. Run Tests Frequently
After each change, run tests to ensure nothing broke.

```bash
# Run tests in watch mode during refactoring
npm test -- --watch

# Run full suite before committing
npm test
```

### 4. Code Review
Have refactoring changes reviewed by team members.

---

## 🧪 Testing During Refactoring

### Before Refactoring
```bash
# Run all tests to establish baseline
npm test

# Check coverage
npm run test:coverage
```

### During Refactoring
```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- activityService.test.ts
```

### After Refactoring
```bash
# Run full test suite
npm test

# Verify coverage hasn't decreased
npm run test:coverage

# Run linting
npm run lint
```

---

## 📋 Refactoring Checklist

- [ ] Tests exist and pass before refactoring
- [ ] Changes are small and focused
- [ ] Each commit is a complete, working change
- [ ] All tests still pass after refactoring
- [ ] Code coverage hasn't decreased
- [ ] Performance hasn't degraded
- [ ] API/interface hasn't changed (unless intentional)
- [ ] Documentation is updated
- [ ] Code review requested

---

## 🚫 What NOT to Do

- ❌ Don't refactor without tests
- ❌ Don't change functionality while refactoring
- ❌ Don't make large, sweeping changes all at once
- ❌ Don't refactor on a deadline
- ❌ Don't refactor code you don't understand
- ❌ Don't break existing APIs without migration plan
- ❌ Don't optimize prematurely
- ❌ Don't refactor just to use a new pattern you learned

---

## 🔧 Common Refactoring Patterns

### Extract Function/Method
Pull out complex logic into separate, named functions

### Inline Function
Remove unnecessary function wrappers

### Extract Component
Break large components into smaller, focused ones

### Replace Conditional with Polymorphism
Use strategy pattern instead of complex if/else chains

### Introduce Parameter Object
Group related parameters into a single object

### Replace Magic Number with Symbolic Constant
Use named constants instead of literal values

### Consolidate Duplicate Code
Extract common logic to shared utilities

### Simplify Conditional Expressions
Use early returns and reduce nesting

---

## 📚 Tools

### ESLint
Configure rules to catch code smells:

```json
{
  "rules": {
    "complexity": ["error", 10],
    "max-lines-per-function": ["warn", 50],
    "max-depth": ["error", 4],
    "max-nested-callbacks": ["error", 3],
    "no-magic-numbers": ["warn", { "ignore": [0, 1] }]
  }
}
```

### TypeScript
Use strict mode to catch potential issues:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```