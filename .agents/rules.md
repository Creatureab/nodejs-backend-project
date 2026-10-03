# AI Rules for This Repository

## Project context
- This repo contains a full-stack e-commerce application.
- The backend is in the root project folder and includes Express routes, middleware, validators, models, and helpers.
- The frontend is in the `frontend/` folder and uses Next.js with the App Router.
- Keep backend and frontend responsibilities separated. Do not mix server logic into UI code, or browser logic into API routes.

## Core rules
- Read the relevant existing files before making changes.
- Follow the current project patterns instead of inventing a new structure.
- Preserve existing API contracts unless the task explicitly requires a breaking change.
- Prefer small, focused edits over broad refactors.
- Keep names, folder structure, and conventions consistent with the current codebase.
- Do not add unnecessary dependencies or large libraries for small tasks.

## Backend rules
- Keep route, model, middleware, and validator logic organized by feature.
- Respect existing auth, role checks, and validation flows.
- Do not hardcode secrets, JWT keys, or environment values.
- Keep database and request validation consistent with existing schema and middleware patterns.
- Fail safely: validate inputs and return consistent error messages.

## Frontend rules
- Use the existing Next.js app structure inside `frontend/app/` and `frontend/components/`.
- Follow the current component and styling conventions already used in the project.
- Reuse existing shared utilities and context providers before creating duplicates.
- Preserve localization patterns and route names when making UI changes.
- Keep new pages and components aligned with the app’s existing design and data flow.

## Quality bar
- Before finalizing a change, verify the relevant behavior with the smallest available validation command.
- If a task affects APIs, check route usage and auth assumptions.
- If a task affects UI, confirm the page still renders correctly and remains consistent with the app design.
- Do not delete existing working functionality unless the task explicitly requires it.

## Safety rules
- Never commit or expose secrets, tokens, or private credentials.
- Avoid destructive changes to database models, auth flows, or uploaded files unless explicitly requested.
- If the task is ambiguous or risky, ask for clarification before major refactors or architectural changes.

## Default behavior
When in doubt, prefer the simplest fix that matches the existing repository patterns, keeps the app stable, and does not break the backend/frontend separation.
