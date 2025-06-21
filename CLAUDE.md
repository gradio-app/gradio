# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Frontend Development:**
These commands must always be run from root. Individual packages do not have their own scripts.

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build production frontend (expensive, do not use for diagnostics)
- `pnpm format:write` - Format code using Prettier
- `pnpm lint` - Run ESLint on JS/TS files
- `pnpm ts:check` - Run TypeScript type checking
- `pnpm test` - Run Vitest unit tests
- `pnpm test:browser` - Run Playwright browser tests (only use if everything has already been built)
- `pnpm test:browser:full` - Build everything and run Playwright browser tests

**Backend Development:**
- `scripts/run_backend_tests.sh` - Run Python backend tests
- `scripts/lint_backend.sh` - Run ruff linting on Python code
- `scripts/type_check_backend.sh` - Run pyright type checking
- `scripts/format_backend.sh` - Format Python code with ruff

**Building:**
- `scripts/build_frontend.sh` - Build frontend for production
- `pnpm build:lite` - Build Gradio Lite (WASM version)

## Architecture Overview

Gradio is a full-stack application with a Python backend and Svelte frontend:

**Backend (Python):**
- Core library in `/gradio/` - handles component definitions, server routing, and app logic
- FastAPI-based HTTP server with WebSocket support for real-time updates
- Component system with base classes in `gradio/components/base.py`
- Event handling and queueing system for managing user interactions
- Python interface classes: `Interface` (high-level), `Blocks` (low-level), `ChatInterface` (chatbots)

**Frontend (Svelte/TypeScript):**
- Modular component architecture in `/js/` with each component in its own package
- Uses pnpm workspaces for monorepo management
- Vite for bundling, with PostCSS and Tailwind for styling
- Real-time communication with backend via WebSockets
- Component library includes 30+ built-in components (textbox, image, audio, etc.)

**Key Directories:**
- `/js/[component]/` - Individual Svelte component packages
- `/gradio/components/` - Python component definitions
- `/demo/` - Example applications and demos
- `/test/` - Backend Python tests
- `/js/spa/test/` - Frontend Playwright tests

**Build System:**
- Uses pnpm workspaces to manage multiple JS packages
- Hatch for Python packaging
- Svelte components are built with @sveltejs/package
- Frontend assets are copied to Python package during build

**Testing Strategy:**
- Backend: pytest for Python unit/integration tests
- Frontend: Vitest for unit tests, Playwright for E2E browser tests
- Component tests use @playwright/experimental-ct-svelte for component testing

## Development Workflow

1. **Local Development:** Run `pnpm dev` for frontend server. Run `python run.py` or `gradio run.py` in a `demo/*` directory for backend server.
2. **Code Quality:** Always run linting and type checking before committing
3. **Testing:** Run both backend and frontend test suites
4. **Component Development:** Each UI component has both Python (gradio/components/) and Svelte (js/) implementations that must stay in sync

## Important Notes

- Gradio supports both Interface (high-level) and Blocks (low-level) APIs
- Components communicate via a standardized event system
- The app supports hot reloading for rapid development
- Uses a queue system for handling concurrent user requests
- Gradio Lite runs entirely in browser using Pyodide (no server needed)