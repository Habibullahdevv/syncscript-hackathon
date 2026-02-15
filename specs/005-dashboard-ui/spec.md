# Feature Specification: Frontend Dashboard & Role-Based UI

**Feature Branch**: `005-dashboard-ui`
**Created**: 2026-02-15
**Status**: Draft
**Input**: Phase 5 Frontend Dashboard with role-based UI, vault management, source display, and real-time notifications

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vault List Dashboard (Priority: P1)

Users need to see all vaults they have access to immediately after logging in, with clear visual indicators of their role in each vault.

**Why this priority**: This is the entry point to the entire vault system. Without a vault list, users cannot navigate to any vault-specific functionality. This delivers immediate value by showing users what they have access to.

**Independent Test**: Login as any demo user (owner/contributor/viewer) → Dashboard displays all accessible vaults with role badges → User can identify their permissions at a glance

**Acceptance Scenarios**:

1. **Given** user is authenticated as owner@demo.com, **When** user navigates to dashboard, **Then** all vaults where user is owner are displayed with "Owner" badge
2. **Given** user is authenticated as contributor@demo.com, **When** user navigates to dashboard, **Then** all vaults where user is contributor are displayed with "Contributor" badge
3. **Given** user is authenticated as viewer@demo.com, **When** user navigates to dashboard, **Then** all vaults where user is viewer are displayed with "Viewer" badge
4. **Given** user has no vault access, **When** user navigates to dashboard, **Then** empty state message is displayed with helpful guidance
5. **Given** user is on dashboard, **When** user clicks on a vault card, **Then** user is navigated to vault detail page

---

### User Story 2 - Vault Detail with Source List (Priority: P2)

Users need to view all sources (PDFs) within a specific vault in an organized, searchable table format.

**Why this priority**: After seeing available vaults, users need to access the actual content (sources). This is the core value proposition - viewing and managing PDF sources within vaults.

**Independent Test**: Navigate to any vault detail page → Sources are displayed in a table with title, file size, upload date → User can sort and filter sources → Table shows appropriate actions based on user role

**Acceptance Scenarios**:

1. **Given** user is viewing a vault with 10 sources, **When** vault detail page loads, **Then** all 10 sources are displayed in a table with columns: Title, File Size, Upload Date, Actions
2. **Given** user is viewing source table, **When** user clicks on column header, **Then** table sorts by that column (ascending/descending)
3. **Given** user is viewing source table, **When** user types in search box, **Then** table filters to show only sources matching search term
4. **Given** user is owner, **When** viewing source table, **Then** "Delete" action is visible for each source
5. **Given** user is viewer, **When** viewing source table, **Then** no action buttons are visible (read-only)
6. **Given** vault has no sources, **When** user views vault detail, **Then** empty state message is displayed with "Add Source" button (if authorized)

---

### User Story 3 - Source Upload (Priority: P3)

Users with appropriate permissions (owner/contributor) need to add new PDF sources to vaults.

**Why this priority**: This enables content creation within vaults. While viewing is essential (P2), adding content is the next logical step for active users.

**Independent Test**: Login as owner or contributor → Navigate to vault detail → Click "Add Source" → Upload PDF → Source appears in table immediately

**Acceptance Scenarios**:

1. **Given** user is owner or contributor, **When** viewing vault detail, **Then** "Add Source" button is visible
2. **Given** user is viewer, **When** viewing vault detail, **Then** "Add Source" button is hidden
3. **Given** user clicks "Add Source", **When** upload form opens, **Then** form displays file input and title input fields
4. **Given** user selects PDF file and enters title, **When** user submits form, **Then** file is uploaded and source appears in table
5. **Given** user selects non-PDF file, **When** user attempts to submit, **Then** validation error is displayed
6. **Given** upload is in progress, **When** user waits, **Then** loading indicator is displayed
7. **Given** upload fails, **When** error occurs, **Then** user-friendly error message is displayed

---

### User Story 4 - Real-Time Notifications (Priority: P4)

Users need to see immediate visual feedback when other users add or remove sources from vaults they're viewing.

**Why this priority**: This enhances collaboration by showing live activity. While valuable, the system is functional without it (users can refresh to see updates).

**Independent Test**: Open vault detail in two browser windows as different users → User A adds source → User B sees toast notification and table updates automatically within 1 second

**Acceptance Scenarios**:

1. **Given** user is viewing vault detail, **When** another user adds a source, **Then** toast notification appears showing "{User Name} added {Source Title}"
2. **Given** user is viewing vault detail, **When** another user deletes a source, **Then** toast notification appears showing "{User Name} deleted a source"
3. **Given** toast notification appears, **When** 5 seconds pass, **Then** toast automatically dismisses
4. **Given** multiple events occur, **When** notifications appear, **Then** toasts stack vertically without overlapping
5. **Given** user is viewing vault detail, **When** source is added via real-time event, **Then** source table updates automatically without page refresh

---

### Edge Cases

- What happens when user loses network connection while viewing vault detail? (Should show connection status indicator)
- How does system handle when user's role changes while they're viewing a vault? (Should update UI on next action or page refresh)
- What happens when vault is deleted while user is viewing it? (Should redirect to dashboard with notification)
- How does system handle when 100+ sources exist in a vault? (Pagination should display 10 sources per page)
- What happens when multiple users upload sources simultaneously? (All uploads should succeed, real-time events should show all additions)
- How does system handle when PDF upload exceeds size limit? (Should display validation error before upload attempt)
- What happens when user clicks "Add Source" but cancels the form? (Form should close without side effects)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all vaults accessible to authenticated user on dashboard page
- **FR-002**: System MUST display user's role (owner/contributor/viewer) for each vault as a visual badge
- **FR-003**: System MUST provide navigation from vault list to vault detail page
- **FR-004**: System MUST display all sources within a vault in a table format with columns: Title, File Size, Upload Date, Actions
- **FR-005**: System MUST support table sorting by any column (ascending/descending)
- **FR-006**: System MUST support table filtering by source title via search input
- **FR-007**: System MUST paginate source table when more than 10 sources exist (10 per page)
- **FR-008**: System MUST display "Add Source" button only for users with owner or contributor roles
- **FR-009**: System MUST display "Delete" action only for users with owner role
- **FR-010**: System MUST provide source upload form with file input (PDF only) and title input
- **FR-011**: System MUST validate file type is PDF before allowing upload
- **FR-012**: System MUST display loading indicator during file upload
- **FR-013**: System MUST display toast notification when source is added by another user
- **FR-014**: System MUST display toast notification when source is deleted by another user
- **FR-015**: System MUST auto-dismiss toast notifications after 5 seconds
- **FR-016**: System MUST update source table automatically when real-time event is received
- **FR-017**: System MUST display empty state message when vault has no sources
- **FR-018**: System MUST display empty state message when user has no vault access
- **FR-019**: System MUST display user-friendly error messages when API requests fail
- **FR-020**: System MUST display sidebar navigation with role badge showing current user's role
- **FR-021**: System MUST fetch all data from existing backend APIs (no direct database access)
- **FR-022**: System MUST maintain responsive layout for desktop and mobile screen sizes

### Key Entities

- **Vault**: Container for sources with associated users and roles. Displayed as cards on dashboard with title, description, source count, and user's role badge.
- **Source**: PDF document within a vault. Displayed in table with title, file URL, file size, upload date, and role-appropriate actions.
- **User Role**: Permission level (owner/contributor/viewer) determining which UI elements and actions are visible to the user.
- **Toast Notification**: Temporary visual message displaying real-time activity from other users, including actor name and action performed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their vault list within 2 seconds of dashboard page load
- **SC-002**: Users can navigate from vault list to vault detail within 1 second
- **SC-003**: Source table displays 100 sources with sorting and filtering in under 500ms
- **SC-004**: Users with appropriate permissions can upload a PDF source in under 10 seconds (including file selection and form submission)
- **SC-005**: Real-time toast notifications appear within 1 second of source addition by another user
- **SC-006**: Source table updates automatically within 1 second of receiving real-time event
- **SC-007**: Role-based UI elements (buttons, actions) correctly appear or hide based on user role in 100% of test cases
- **SC-008**: Dashboard layout remains functional and readable on screen sizes from 320px (mobile) to 1920px (desktop)
- **SC-009**: Users can complete end-to-end flow (login → view vaults → view sources → upload source → see real-time update) without errors
- **SC-010**: Empty states display helpful guidance when no vaults or sources exist
- **SC-011**: Error messages are user-friendly and actionable (no raw error objects or technical jargon)
- **SC-012**: Loading indicators appear for all asynchronous operations (API calls, file uploads)

## Assumptions

- Phase 2 backend APIs are fully functional and return data in expected format
- Phase 3 authentication is working and NextAuth.js session contains user.id and user.role
- Phase 4 Socket.io server is running and emitting source:created and source:deleted events
- Demo users (owner@demo.com, contributor@demo.com, viewer@demo.com) exist in database with appropriate vault access
- Cloudinary upload API from Phase 2 is functional and returns file URLs
- shadcn/ui component library will be used for UI components (Table, Card, Button, Badge, Toast, Dialog, Form, Input)
- Tailwind CSS is already configured from previous phases
- Browser supports modern JavaScript features (ES6+) and WebSocket connections

## Dependencies

- **Phase 2 Backend APIs**: Vault list, vault detail, source list, source upload endpoints must be functional
- **Phase 3 Authentication**: NextAuth.js session must provide user.id and user.role for role-based UI rendering
- **Phase 4 Socket.io**: Real-time events (source:created, source:deleted) must be emitted with actor information
- **Cloudinary**: PDF upload and storage service must be accessible via Phase 2 API

## Out of Scope

- Backend API development or modifications (Phase 2 complete)
- Authentication system changes (Phase 3 complete)
- Socket.io server logic (Phase 4 complete)
- User signup or registration flows
- Password reset functionality
- Profile editing or account management
- Member invitation workflow implementation (UI placeholder only)
- Advanced data visualization or analytics
- File preview or annotation features
- Drag-drop file upload (standard form upload only)
- Audit log viewer UI
- Rate limiting UI indicators
- Advanced styling, animations, or transitions
- Mobile app development (responsive web only)
- Offline functionality or service workers
- Internationalization (i18n) or localization
- Accessibility testing beyond basic keyboard navigation
- Performance optimization beyond standard React best practices
- Automated testing (manual browser testing only)
