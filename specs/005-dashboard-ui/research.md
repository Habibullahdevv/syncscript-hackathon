# Research: Frontend Dashboard & Role-Based UI

**Feature**: Phase 5 - Frontend Dashboard & Role-Based UI
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document captures research findings for implementing the Phase 5 frontend dashboard using shadcn/ui, Next.js App Router, and Socket.io client integration.

## Research Areas

### 1. shadcn/ui Installation and Customization

**Question**: How to install and customize shadcn/ui components in Next.js App Router project?

**Findings**:

**Installation Process**:
```bash
# Initialize shadcn/ui configuration
npx shadcn-ui@latest init

# Install individual components
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

**Configuration**:
- Components are copied to `src/components/ui/` directory
- Tailwind CSS configuration is automatically updated
- Components use Radix UI primitives under the hood
- Full TypeScript support with proper type definitions

**Customization**:
- Modify component files directly in `src/components/ui/`
- Use Tailwind CSS utility classes for styling
- Extend component props as needed
- No npm package updates required (components are source code)

**Decision**: Use shadcn/ui CLI for installation. Customize components by editing source files and applying Tailwind CSS classes.

**Rationale**: Copy-paste approach gives full control over component behavior and styling. No version conflicts or breaking changes from npm updates.

---

### 2. Next.js App Router Server/Client Component Patterns

**Question**: When to use server components vs client components in Next.js App Router?

**Findings**:

**Server Components** (default):
- Rendered on server, HTML sent to client
- Can access backend resources directly (database, file system)
- Cannot use React hooks (useState, useEffect, etc.)
- Cannot handle browser events (onClick, onChange, etc.)
- Smaller JavaScript bundle size
- Better initial page load performance

**Client Components** (marked with 'use client'):
- Rendered on client, JavaScript sent to browser
- Can use React hooks and browser APIs
- Can handle user interactions
- Required for real-time updates (Socket.io)
- Larger JavaScript bundle size

**Best Practices**:
- Use server components by default
- Use client components only when needed:
  - Interactive forms
  - Real-time updates
  - Browser APIs (localStorage, WebSocket)
  - React hooks (useState, useEffect)
- Keep client components small and focused
- Pass data from server to client components via props

**Decision**: Use hybrid approach - server components for layout and initial data fetching, client components for interactive elements.

**Implementation**:
- Server: layout.tsx (sidebar structure), page.tsx (initial vault/source fetching)
- Client: vault-card.tsx, source-table.tsx, upload-form.tsx, socket-provider.tsx

**Rationale**: Optimizes performance by reducing JavaScript bundle while maintaining interactivity where needed.

---

### 3. Socket.io Client Connection Management in React

**Question**: How to manage Socket.io client connection lifecycle in React components?

**Findings**:

**Connection Patterns**:

**Pattern 1: Direct socket in component** (NOT RECOMMENDED)
```typescript
// ❌ Creates new connection on every render
const socket = io('http://localhost:3000');
```

**Pattern 2: useEffect with cleanup** (BETTER)
```typescript
useEffect(() => {
  const socket = io('http://localhost:3000');
  socket.on('event', handler);
  return () => socket.disconnect();
}, []);
```

**Pattern 3: Context Provider + Custom Hook** (RECOMMENDED)
```typescript
// SocketProvider.tsx
const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

// useSocketEvents.ts
export function useSocketEvents(event: string, callback: Function) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [socket, event, callback]);
}
```

**Decision**: Use Context Provider pattern with custom hook for Socket.io connection management.

**Rationale**:
- Single connection shared across all components
- Clean API for subscribing to events
- Automatic cleanup on unmount
- Testable and reusable

---

### 4. TanStack Table Integration with shadcn/ui DataTable

**Question**: How to integrate TanStack Table with shadcn/ui DataTable component?

**Findings**:

**shadcn/ui DataTable Structure**:
- Uses TanStack Table (formerly React Table) under the hood
- Provides pre-built table components (Table, TableHeader, TableBody, TableRow, TableCell)
- Requires manual integration of TanStack Table hooks

**Integration Steps**:

1. **Install TanStack Table**:
```bash
npm install @tanstack/react-table
```

2. **Define columns**:
```typescript
const columns: ColumnDef<Source>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'fileSize',
    header: 'File Size',
    cell: ({ row }) => formatBytes(row.getValue('fileSize')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Upload Date',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell source={row.original} />,
  },
];
```

3. **Use table hook**:
```typescript
const table = useReactTable({
  data: sources,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    sorting,
    filtering,
    pagination,
  },
  onSortingChange: setSorting,
  onFilteringChange: setFiltering,
  onPaginationChange: setPagination,
});
```

4. **Render table**:
```typescript
<Table>
  <TableHeader>
    {table.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map(header => (
          <TableHead key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows.map(row => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map(cell => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Decision**: Use TanStack Table with shadcn/ui Table components for DataTable implementation.

**Rationale**: TanStack Table provides powerful sorting, filtering, and pagination features. shadcn/ui provides accessible table components. Integration is straightforward with proper TypeScript support.

---

### 5. Role-Based UI Rendering Patterns

**Question**: How to implement role-based conditional rendering in React components?

**Findings**:

**Pattern 1: Inline conditional rendering**
```typescript
{session?.user?.role === 'owner' && <DeleteButton />}
```

**Pattern 2: Utility function**
```typescript
function canPerformAction(role: string, action: string): boolean {
  const permissions = {
    owner: ['create', 'read', 'update', 'delete'],
    contributor: ['create', 'read', 'update'],
    viewer: ['read'],
  };
  return permissions[role]?.includes(action) ?? false;
}

{canPerformAction(session.user.role, 'delete') && <DeleteButton />}
```

**Pattern 3: Custom hook**
```typescript
function usePermissions() {
  const { data: session } = useSession();
  return {
    canCreate: ['owner', 'contributor'].includes(session?.user?.role),
    canDelete: session?.user?.role === 'owner',
    canInvite: session?.user?.role === 'owner',
  };
}

const { canDelete } = usePermissions();
{canDelete && <DeleteButton />}
```

**Decision**: Use custom hook pattern for role-based permissions.

**Rationale**:
- Centralized permission logic
- Reusable across components
- Easy to test
- Type-safe with TypeScript
- Consistent with React patterns

---

## Technology Stack Decisions

### Frontend Framework
- **Chosen**: Next.js 16.1.6 App Router
- **Rationale**: Already configured in project, supports server/client components, excellent TypeScript support

### UI Component Library
- **Chosen**: shadcn/ui
- **Rationale**: Accessible, customizable, Tailwind CSS integration, constitution-compliant

### State Management
- **Chosen**: React Hooks + Context API
- **Rationale**: Built-in, no additional dependencies, sufficient for Phase 5 scope

### Table Library
- **Chosen**: TanStack Table v8
- **Rationale**: Powerful features (sorting, filtering, pagination), integrates with shadcn/ui

### Real-Time Communication
- **Chosen**: Socket.io client (existing from Phase 4)
- **Rationale**: Already integrated in Phase 4, proven to work

### Form Validation
- **Chosen**: Zod (existing from Phase 2)
- **Rationale**: Already used in backend, consistent validation schemas

### Styling
- **Chosen**: Tailwind CSS (existing)
- **Rationale**: Already configured, integrates with shadcn/ui

---

## Performance Considerations

### Bundle Size Optimization
- Use server components for static content
- Code-split client components
- Lazy load heavy components (DataTable, Dialog)
- Tree-shake unused shadcn/ui components

### Initial Page Load
- Server-side render vault list
- Prefetch vault data on server
- Stream HTML to client
- Hydrate client components progressively

### Real-Time Updates
- Single Socket.io connection via Context
- Debounce rapid events
- Batch table updates
- Use React.memo for expensive components

---

## Security Considerations

### Role-Based Access Control
- Check permissions on both client and server
- Remove unauthorized UI elements from DOM (not just hide)
- Backend APIs enforce authorization (defense in depth)
- Session validation on every API request

### XSS Prevention
- React escapes content by default
- Validate user input with Zod
- Sanitize file names before display
- Use Content Security Policy headers

### CSRF Protection
- NextAuth.js provides CSRF tokens
- Same-origin policy for API requests
- Credentials included in fetch requests

---

## Testing Strategy

### Manual Testing
- Test with multiple browser tabs (concurrent users)
- Test all three roles (owner, contributor, viewer)
- Test responsive design (mobile, tablet, desktop)
- Test real-time updates (add/delete sources)
- Test error scenarios (API failures, network issues)

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Screen Sizes
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1920px

---

## Alternatives Considered

### Component Libraries
- **Material-UI**: Rejected - opinionated styling, violates constitution
- **Ant Design**: Rejected - harder to customize, violates constitution
- **Chakra UI**: Rejected - different styling approach, violates constitution
- **Headless UI**: Rejected - requires more custom styling work

### State Management
- **Redux**: Rejected - too much boilerplate, overkill for scope
- **Zustand**: Rejected - violates constitution (complex state management)
- **Jotai**: Rejected - additional dependency, not needed

### Table Libraries
- **AG Grid**: Rejected - commercial license, overkill for scope
- **React Table v7**: Rejected - deprecated, use v8 (TanStack Table)
- **Custom table**: Rejected - reinventing the wheel, accessibility challenges

---

## Conclusion

Research confirms that shadcn/ui + TanStack Table + React Hooks + Context API is the optimal stack for Phase 5 dashboard implementation. All technologies integrate well with existing Next.js setup and satisfy Phase 5 constitution principles.

**Key Takeaways**:
1. Use shadcn/ui for all UI components (constitution-compliant)
2. Use server/client component hybrid for optimal performance
3. Use Context Provider pattern for Socket.io connection management
4. Use TanStack Table for DataTable features
5. Use custom hook for role-based permissions
6. Focus on functional layout, advanced styling is optional
7. Manual browser testing with multiple roles and concurrent sessions

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)
