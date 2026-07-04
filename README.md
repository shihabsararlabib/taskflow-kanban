# TaskFlow — Interactive Kanban Board

A modern, responsive Kanban Board built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4** featuring smooth drag-and-drop, rich text editing, dark/light mode, and extensive keyboard shortcuts.

![TaskFlow Kanban Board](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)

---

##  Setup Instructions

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **yarn** / **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kanban-board.git
cd kanban-board

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

##  Features Implemented

### Core Requirements

| Feature | Status |
|---|---|
| 5 default columns (Backlog, Todo, In Progress, Review, Done) | ✅ |
| Add new custom columns | ✅ |
| Delete custom columns | ✅ |
| Task cards with title, description, assignee, labels, due date, priority | ✅ |
| Rich text description (bold, italic, underline, lists) | ✅ |
| Drag & drop between columns | ✅ |
| Reorder within the same column | ✅ |
| Click-to-edit modal | ✅ |
| Add new cards | ✅ |
| Delete cards | ✅ |
| Search by title, description, assignee | ✅ |
| Filter by priority, label, assignee | ✅ |
| Dark / Light mode toggle | ✅ |
| System preference detection | ✅ |
| Theme persistence in localStorage | ✅ |
| Data persistence in localStorage | ✅ |
| Smooth animations (Framer Motion) | ✅ |
| Fully responsive (mobile + desktop) | ✅ |
| ARIA labels & keyboard navigation | ✅ |
| Loading states | ✅ |

### Bonus Features

| Feature | Status |
|---|---|
| Undo / Redo for all board actions | ✅ |
| Keyboard shortcuts (N, Esc, Ctrl+Z, Ctrl+Shift+Z, Ctrl+E, ?) | ✅ |
| Export board as JSON | ✅ |
| Import board from JSON | ✅ |
| Touch-friendly drag & drop (mobile) | ✅ |
| Real-time multi-tab sync (BroadcastChannel API) | ✅ |
| Keyboard shortcuts reference panel | ✅ |

---

##  Technical Decisions

### 1. Why @dnd-kit over react-beautiful-dnd

I chose **@dnd-kit** for drag-and-drop because:
- `react-beautiful-dnd` is no longer actively maintained (archived by Atlassian)
- @dnd-kit has first-class support for **touch devices**, **keyboard navigation**, and **accessibility**
- It provides fine-grained control through composable primitives (`DndContext`, `SortableContext`, `useDroppable`)
- Built-in support for multiple **collision detection** strategies (`closestCorners` works perfectly for Kanban)
- The activation constraints (`distance: 8` for pointer, `delay: 200` for touch) prevent accidental drags while clicking

### 2. Client-Side Only Board with SSR-Safe Architecture

The board uses `dynamic()` import with `ssr: false` because:
- All board data lives in **localStorage**, which doesn't exist server-side
- This prevents hydration mismatches between server and client renders
- The `useLocalStorage` hook has an `isHydrated` guard that returns `initialValue` until the client reads from storage
- A branded **loading state** is shown during the brief SSR → client transition

### 3. State Architecture: Single Source of Truth

The `useKanbanBoard` hook is the **single source of truth** for all board operations:
- **Centralized mutations**: Every board change goes through `updateBoard()`, which automatically handles undo history + BroadcastChannel sync
- **Derived state**: `getTasksByColumn()` and `getFilteredTasks()` compute filtered views without duplicating data
- This pattern makes it trivial to add features (e.g., analytics, audit logs) since all mutations flow through one function

### 4. Undo/Redo Implementation

Rather than using action-based undo (which would require reversing each action type), I went with **snapshot-based undo**:
- Each mutation pushes the **previous full board state** onto the undo stack
- Max 50 history items to bound memory usage
- An `isUndoRedoAction` ref prevents undo/redo operations from pushing themselves onto the stack
- This approach is simpler and more reliable than action reversal, especially with complex drag-and-drop reordering

### 5. Rich Text with contentEditable

Instead of pulling in a heavy editor like TipTap or Slate:
- Used native `contentEditable` with `document.execCommand()` for basic formatting
- Supports **bold**, **italic**, **underline**, and **bullet lists**
- HTML is persisted directly, keeping the description as rich text
- This keeps the bundle small while meeting the "basic rich text" requirement

### 6. BroadcastChannel for Multi-Tab Sync

- Uses the native `BroadcastChannel` API (no WebSocket server needed)
- An `isReceiving` ref prevents infinite feedback loops when a tab receives an update
- Gracefully degrades (try/catch) in browsers that don't support BroadcastChannel

### 7. Tailwind CSS v4 (No UI Libraries)

- All styling uses **Tailwind CSS v4** with the new `@theme` directive and CSS-first configuration
- Dark mode uses the `@custom-variant dark` approach with `.dark` class toggling
- No external UI component libraries (Radix, shadcn, etc.) — every component is custom-built
- This demonstrates proficiency with Tailwind while keeping the design system fully controlled

### 8. Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # Home page (Client Component, dynamic import)
│   └── globals.css         # Global styles + Tailwind config
├── components/
│   ├── Board.tsx           # Main board with DnD context
│   ├── Column.tsx          # Individual column with droppable zone
│   ├── TaskCard.tsx        # Sortable task card
│   ├── TaskModal.tsx       # Full task editor modal
│   ├── SearchFilter.tsx    # Search + filter chips
│   ├── Header.tsx          # App header with actions
│   ├── ThemeProvider.tsx   # Theme context + persistence
│   └── ThemeToggle.tsx     # Animated dark/light switch
├── hooks/
│   ├── useKanbanBoard.ts   # Core board state management
│   ├── useLocalStorage.ts  # SSR-safe localStorage hook
│   ├── useUndoRedo.ts      # Undo/redo with snapshot stack
│   ├── useKeyboardShortcuts.ts  # Global keyboard handler
│   └── useBroadcastSync.ts # Multi-tab sync
├── lib/
│   ├── constants.ts        # Default columns, labels, config
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript interfaces
```

**Server vs Client Components**: Only `layout.tsx` is a Server Component. The board page uses `'use client'` because it requires browser APIs (localStorage, BroadcastChannel, drag-and-drop). This is the minimal necessary client boundary.

---

##  Challenges & Solutions

### 1. Drag-and-Drop Between Columns + Reordering

**Challenge**: Getting drag-over to move tasks between columns in real-time (not just on drop) while maintaining stable order indices.

**Solution**: Split logic between `onDragOver` (cross-column moves) and `onDragEnd` (within-column reorder). On drag-over, I check if the active task's column differs from the target and immediately re-parent it, then re-index all tasks in both source and target columns.

### 2. ContentEditable State Sync

**Challenge**: React state and `contentEditable` innerHTML can get out of sync, especially when resetting the modal for new tasks.

**Solution**: Separated the initialization logic — existing tasks load `task.description` into the div on mount, while new tasks explicitly set `innerHTML = ''`. The React state (`description`) is only updated via `onInput`, and on save, we read directly from `descriptionRef.current.innerHTML` as the source of truth.

### 3. Hydration Mismatch with localStorage

**Challenge**: Server-rendered HTML doesn't know about localStorage data, causing React hydration errors.

**Solution**: The `useLocalStorage` hook uses an `isHydrated` flag and `suppressHydrationWarning`. During SSR, it returns `initialValue`; after mounting, it reads from localStorage. Combined with `dynamic(..., { ssr: false })`, this eliminates all hydration mismatches.

### 4. Preventing Drag When Clicking

**Challenge**: On task cards, clicking to open the edit modal would also start a drag operation.

**Solution**: Used `PointerSensor` with `activationConstraint: { distance: 8 }` — the drag only activates after 8px of pointer movement. For touch devices, a `delay: 200` prevents accidental drags. Additionally, the `onClick` handler checks `isSortableDragging` to prevent modal opens during drag.

---

##  What I Would Improve With More Time

1. **Virtualized Lists**: Implement `react-window` or `@tanstack/virtual` for columns with 100+ tasks to improve scroll performance
2. **Column Drag & Drop**: Allow reordering columns themselves, not just tasks
3. **Subtasks & Checklists**: Nested task trees with progress tracking
4. **Activity Log**: Track all changes with timestamps for audit trails
5. **Server Persistence**: Replace localStorage with a proper API (Supabase / Prisma + PostgreSQL)
6. **Optimistic Updates**: Show changes immediately while syncing with a backend
7. **Board Templates**: Pre-built templates for common workflows (Scrum, Bug Tracking, etc.)
8. **Collaborative Cursors**: Real-time presence indicators when multiple users are viewing the board
9. **E2E Tests**: Playwright or Cypress tests for drag-and-drop flows and modal interactions
10. **PWA Support**: Offline-first with service workers

---

## 📄 License



---


