# Component Contracts: shadcn/ui Components

**Feature**: Phase 5 - Frontend Dashboard & Role-Based UI
**Date**: 2026-02-15
**Status**: Complete

## Overview

This document specifies the shadcn/ui components used in Phase 5 dashboard, their props, usage patterns, and integration requirements.

## Component Installation

All components installed via shadcn/ui CLI:

```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
```

Components are copied to `src/components/ui/` and can be customized directly.

---

## 1. Table Component

**Purpose**: Display sources in DataTable with sorting, filtering, pagination

**Location**: `src/components/ui/table.tsx`

**Base Components**:
- `Table`: Root table container
- `TableHeader`: Table header section
- `TableBody`: Table body section
- `TableRow`: Table row
- `TableHead`: Table header cell
- `TableCell`: Table data cell

**Props**:
```typescript
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}
```

**Usage Pattern**:
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>File Size</TableHead>
      <TableHead>Upload Date</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {sources.map(source => (
      <TableRow key={source.id}>
        <TableCell>{source.title}</TableCell>
        <TableCell>{formatBytes(source.fileSize)}</TableCell>
        <TableCell>{formatDate(source.createdAt)}</TableCell>
        <TableCell>
          {canDelete && <Button variant="destructive">Delete</Button>}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Integration**: TanStack Table v8 for sorting, filtering, pagination

**Customization**: Tailwind CSS classes for styling

---

## 2. Card Component

**Purpose**: Display vault information on dashboard

**Location**: `src/components/ui/card.tsx`

**Base Components**:
- `Card`: Root card container
- `CardHeader`: Card header section
- `CardTitle`: Card title
- `CardDescription`: Card description
- `CardContent`: Card content section
- `CardFooter`: Card footer section

**Props**:
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
```

**Usage Pattern**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>{vault.title}</CardTitle>
    <CardDescription>{vault.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <p>{vault.sourceCount} sources</p>
  </CardContent>
  <CardFooter>
    <Badge variant={getRoleBadgeVariant(vault.userRole)}>
      {vault.userRole}
    </Badge>
  </CardFooter>
</Card>
```

**Integration**: Vault list page, clickable cards for navigation

**Customization**: Hover effects, role-based styling

---

## 3. Button Component

**Purpose**: Action buttons throughout dashboard

**Location**: `src/components/ui/button.tsx`

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}
```

**Variants**:
- `default`: Primary action button (blue)
- `destructive`: Delete/remove actions (red)
- `outline`: Secondary actions (border only)
- `secondary`: Tertiary actions (gray)
- `ghost`: Minimal actions (transparent)
- `link`: Link-style button

**Usage Pattern**:
```typescript
// Primary action
<Button variant="default" onClick={handleAddSource}>
  Add Source
</Button>

// Destructive action
<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>

// Secondary action
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>
```

**Integration**: Forms, tables, navigation

**Role-Based Rendering**: Conditionally render based on user role

---

## 4. Badge Component

**Purpose**: Display user role in vault cards and sidebar

**Location**: `src/components/ui/badge.tsx`

**Props**:
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}
```

**Variants**:
- `default`: Owner role (blue)
- `secondary`: Contributor role (green)
- `outline`: Viewer role (gray)

**Usage Pattern**:
```typescript
// Owner badge
<Badge variant="default">Owner</Badge>

// Contributor badge
<Badge variant="secondary">Contributor</Badge>

// Viewer badge
<Badge variant="outline">Viewer</Badge>
```

**Integration**: Vault cards, sidebar navigation

**Customization**: Role-specific colors and icons

---

## 5. Toast Component

**Purpose**: Real-time notifications for Socket.io events

**Location**: `src/components/ui/toast.tsx`

**Base Components**:
- `Toast`: Root toast container
- `ToastProvider`: Context provider for toast state
- `ToastViewport`: Toast display area
- `ToastTitle`: Toast title
- `ToastDescription`: Toast description
- `ToastClose`: Toast close button
- `ToastAction`: Toast action button

**Props**:
```typescript
interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: 'default' | 'destructive';
  className?: string;
}

interface ToastActionElement {
  altText: string;
  action: React.ReactNode;
}
```

**Usage Pattern**:
```typescript
// Success toast
toast({
  title: "Source Added",
  description: `${actorName} added "${sourceTitle}"`,
  variant: "default",
  duration: 5000,
});

// Error toast
toast({
  title: "Upload Failed",
  description: "Please try again",
  variant: "destructive",
  duration: 5000,
});
```

**Integration**: Socket.io event handlers, API error responses

**Auto-Dismiss**: 5 seconds default, configurable

**Max Toasts**: 5 visible at once (oldest removed)

---

## 6. Dialog Component

**Purpose**: Source upload form modal

**Location**: `src/components/ui/dialog.tsx`

**Base Components**:
- `Dialog`: Root dialog container
- `DialogTrigger`: Button to open dialog
- `DialogContent`: Dialog content area
- `DialogHeader`: Dialog header section
- `DialogTitle`: Dialog title
- `DialogDescription`: Dialog description
- `DialogFooter`: Dialog footer section
- `DialogClose`: Close button

**Props**:
```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
```

**Usage Pattern**:
```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Add Source</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upload PDF Source</DialogTitle>
      <DialogDescription>
        Select a PDF file and provide a title
      </DialogDescription>
    </DialogHeader>
    <UploadForm onSuccess={() => setIsOpen(false)} />
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Integration**: Upload form, role-based visibility

**Accessibility**: Focus trap, ESC to close, click outside to close

---

## 7. Form Component

**Purpose**: Source upload form with validation

**Location**: `src/components/ui/form.tsx`

**Base Components**:
- `Form`: Root form container (react-hook-form)
- `FormField`: Form field wrapper
- `FormItem`: Form item container
- `FormLabel`: Form label
- `FormControl`: Form control wrapper
- `FormDescription`: Form description text
- `FormMessage`: Form error message

**Props**:
```typescript
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
}
```

**Usage Pattern**:
```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Enter source title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="file"
      render={({ field }) => (
        <FormItem>
          <FormLabel>PDF File</FormLabel>
          <FormControl>
            <Input type="file" accept=".pdf" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" disabled={isUploading}>
      {isUploading ? "Uploading..." : "Upload"}
    </Button>
  </form>
</Form>
```

**Integration**: Zod validation schema, react-hook-form

**Validation**: Client-side validation before API call

---

## 8. Input Component

**Purpose**: Form input fields

**Location**: `src/components/ui/input.tsx`

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
```

**Usage Pattern**:
```typescript
// Text input
<Input
  type="text"
  placeholder="Enter title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

// File input
<Input
  type="file"
  accept=".pdf"
  onChange={(e) => setFile(e.target.files?.[0])}
/>

// Search input
<Input
  type="search"
  placeholder="Search sources..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**Integration**: Forms, table filtering

**Validation**: HTML5 validation + Zod schema

---

## Custom Dashboard Components

### 9. Sidebar Component

**Purpose**: Dashboard navigation with role badge

**Location**: `src/components/dashboard/sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: 'owner' | 'contributor' | 'viewer';
  };
}
```

**Usage Pattern**:
```typescript
<Sidebar user={session.user}>
  <nav>
    <Link href="/dashboard">Vaults</Link>
    <Link href="/profile">Profile</Link>
  </nav>
  <Badge variant={getRoleBadgeVariant(user.role)}>
    {user.role}
  </Badge>
</Sidebar>
```

**Integration**: Dashboard layout, responsive design

**Responsive**: Collapsible on mobile (< 768px)

---

### 10. VaultCard Component

**Purpose**: Display vault information on dashboard

**Location**: `src/components/dashboard/vault-card.tsx`

**Props**:
```typescript
interface VaultCardProps {
  vault: {
    id: string;
    title: string;
    description: string;
    sourceCount: number;
    userRole: 'owner' | 'contributor' | 'viewer';
  };
  onClick: () => void;
}
```

**Usage Pattern**:
```typescript
<VaultCard
  vault={vault}
  onClick={() => router.push(`/vaults/${vault.id}`)}
/>
```

**Integration**: Vault list page, navigation

**Styling**: Hover effects, clickable card

---

### 11. SourceTable Component

**Purpose**: Display sources with sorting, filtering, pagination

**Location**: `src/components/dashboard/source-table.tsx`

**Props**:
```typescript
interface SourceTableProps {
  sources: Source[];
  userRole: 'owner' | 'contributor' | 'viewer';
  onDelete?: (sourceId: string) => void;
}
```

**Usage Pattern**:
```typescript
<SourceTable
  sources={sources}
  userRole={session.user.role}
  onDelete={canDelete ? handleDelete : undefined}
/>
```

**Integration**: TanStack Table, role-based actions

**Features**: Sorting, filtering, pagination (10 per page)

---

### 12. UploadForm Component

**Purpose**: Source upload form with validation

**Location**: `src/components/dashboard/upload-form.tsx`

**Props**:
```typescript
interface UploadFormProps {
  vaultId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}
```

**Usage Pattern**:
```typescript
<UploadForm
  vaultId={vaultId}
  onSuccess={() => {
    toast({ title: "Upload successful" });
    refetchSources();
  }}
  onError={(error) => {
    toast({ title: "Upload failed", description: error, variant: "destructive" });
  }}
/>
```

**Integration**: Dialog, Zod validation, Phase 2 API

**Validation**: File type (PDF), file size (< 10MB), title (non-empty)

---

## Component Testing Scenarios

### Manual Testing Checklist

1. **Table Component**:
   - [ ] Renders with correct columns
   - [ ] Sorting works (ascending/descending)
   - [ ] Filtering by title works
   - [ ] Pagination displays 10 sources per page
   - [ ] Empty state displays when no sources

2. **Card Component**:
   - [ ] Displays vault title, description, source count
   - [ ] Role badge displays correct role
   - [ ] Hover effect works
   - [ ] Click navigates to vault detail

3. **Button Component**:
   - [ ] All variants render correctly
   - [ ] Disabled state works
   - [ ] Loading state works
   - [ ] Click handlers fire

4. **Badge Component**:
   - [ ] Owner badge is blue
   - [ ] Contributor badge is green
   - [ ] Viewer badge is gray

5. **Toast Component**:
   - [ ] Toast appears on event
   - [ ] Auto-dismisses after 5 seconds
   - [ ] Max 5 toasts visible
   - [ ] Close button works

6. **Dialog Component**:
   - [ ] Opens on button click
   - [ ] Closes on ESC key
   - [ ] Closes on outside click
   - [ ] Focus trap works

7. **Form Component**:
   - [ ] Validation errors display
   - [ ] Submit button disabled during upload
   - [ ] Success callback fires
   - [ ] Error callback fires

8. **Input Component**:
   - [ ] Text input works
   - [ ] File input accepts PDF only
   - [ ] Search input filters table

---

## Accessibility Requirements

All shadcn/ui components are built on Radix UI primitives and include:

- **Keyboard Navigation**: Tab, Enter, ESC, Arrow keys
- **Screen Reader Support**: ARIA labels, roles, descriptions
- **Focus Management**: Focus trap in dialogs, focus visible styles
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)

---

## Styling Guidelines

### Tailwind CSS Classes

- Use utility classes for spacing, colors, typography
- Use responsive classes for mobile/tablet/desktop
- Use dark mode classes if needed (optional)

### Custom Styles

- Avoid inline styles
- Use Tailwind CSS @apply directive for repeated patterns
- Keep component-specific styles in component files

---

## Conclusion

Phase 5 uses 8 shadcn/ui components and 4 custom dashboard components. All components are accessible, customizable, and integrate with existing Phase 2-4 infrastructure.

**Key Takeaways**:
1. shadcn/ui components are copied to project (not npm packages)
2. TanStack Table integrates with shadcn/ui Table component
3. Toast notifications use shadcn/ui Toast component
4. Forms use react-hook-form + Zod validation
5. All components are accessible and keyboard-navigable
