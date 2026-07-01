# Tech Stack
## CheckMate Analyze

**Project:** CheckMate Analyze  
**Version:** 1.0  
**Status:** Approved

---

# Philosophy

CheckMate Analyze follows a **Local-First** architecture.

The primary goals behind the technology choices are:

- Fast user experience
- Zero server cost
- High performance
- Simple architecture
- Easy maintenance
- Modern developer experience

Every technology should solve a real problem. Avoid unnecessary dependencies.

---

# Guiding Principles

- Local-first execution
- Simplicity over complexity
- Performance over unnecessary abstraction
- Open-source wherever possible
- Build only what the MVP requires

---

# Frontend

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| React | User Interface | Component-based architecture ideal for interactive applications |
| TypeScript | Programming Language | Type safety and maintainability |
| Vite | Build Tool | Extremely fast development and production builds |
| Tailwind CSS | Styling | Rapid UI development with consistent styling |
| shadcn/ui | UI Components | Accessible, customizable, modern components |

---

# Chess Libraries

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| chess.js | Chess rules, legal moves, PGN parsing | Battle-tested library with excellent API |
| react-chessboard | Interactive chessboard | Modern, customizable chessboard component |

---

# Chess Engine

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| Stockfish (WebAssembly) | Position evaluation | Industry-standard open-source chess engine capable of running entirely inside the browser |

---

# Visualization

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| Recharts | Evaluation Graph | Lightweight, responsive, React-friendly charts |

---

# State Management

### MVP Decision

Use React Context + useReducer.

This keeps the application simple and avoids introducing an additional dependency.

If the application grows significantly, migrate to Zustand.

---

# File Handling

Use native browser capabilities for:

- Import PGN
- Export Annotated PGN

No backend required.

---

# Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version Control |
| GitHub | Repository Hosting |
| ESLint | Code Quality |
| Prettier | Code Formatting |
| Anti-gravity | Development Environment |

---

# Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit Testing |
| React Testing Library | Component Testing |

---

# Deployment

| Technology | Purpose |
|------------|---------|
| Vercel | Frontend Hosting |

Deployment strategy:

- Push to GitHub
- Automatic deployment via Vercel
- No backend infrastructure

---

# Project Structure

```
checkmate-analyze/

src/
│
├── assets/
├── components/
├── features/
│   ├── analysis/
│   ├── board/
│   ├── graph/
│   ├── parser/
│   ├── sandbox/
│   └── export/
│
├── hooks/
├── context/
├── services/
├── utils/
├── workers/
├── types/
├── pages/
├── App.tsx
└── main.tsx

docs/

public/
```

---

# Alternatives Considered

## Next.js

**Rejected**

Reason:

- SEO is not important.
- Single Page Application is sufficient.
- Adds unnecessary complexity.

---

## Vue

**Rejected**

Reason:

- React ecosystem provides better support for chess-related libraries.
- Existing experience with React.

---

## Backend (Spring Boot)

**Deferred**

Reason:

The MVP is entirely local-first.

A backend becomes useful only when introducing:

- User accounts
- Cloud synchronization
- Saved analysis
- Shareable URLs
- AI coaching
- Online collaboration

---

## Database

**Not Required**

Reason:

The MVP stores all application state in memory.

No persistent storage is required.

---

# Future Expansion

The current technology choices allow future addition of:

- Spring Boot API
- PostgreSQL
- Authentication
- Cloud Sync
- AI Coach
- Multiplayer Analysis
- Mobile Application

without requiring a complete frontend rewrite.

---

# Final Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

Chess

- chess.js
- react-chessboard
- Stockfish (WebAssembly)

Visualization

- Recharts

Testing

- Vitest
- React Testing Library

Tooling

- Git
- GitHub
- ESLint
- Prettier
- VS Code

Deployment

- Vercel

---

# Guiding Rule

Every dependency must justify its existence.

If a feature can be built without adding another library, prefer the simpler solution.