# Galaxy Green — Developer & Agent Guidelines

## Project Overview

Galaxy Green (Sai Suraksha Nagar, Madhurawada, Visakhapatnam) is a luxury plotted development web portal and interactive booking platform built with TanStack Start, React 19, Tailwind CSS, and MySQL.

## Key Rules & Guidelines

1. **Database Source of Truth**: All plots, lead inquiries, and site configuration are dynamically managed in MySQL (`galaxy_green` database).
2. **Security Standards**:
   - Admin authentication uses secure server-side bcrypt hashing (`$2b$10$...`).
   - Rate limiting and honeypot field checks are enforced on public lead generation forms.
3. **Performance & Asset Standards**:
   - Maintain image payloads under 400 KB per asset using progressive JPEG/WebP compression.
   - Keep secondary modals (e.g., `AdminLeadsDrawer`, `BrochureModal`) lazy-loaded via `React.lazy()` to preserve sub-100 KiB initial JS chunks.
   - All Radix UI slider components must forward explicit `aria-label` to `SliderPrimitive.Thumb`.
   - Maintain production `.htaccess` in `public/` and deployment root with 1-year immutable caching for static assets and unblocked `_serverFn` routes for LiteSpeed/Passenger.
4. **No Third-Party Platform Locking**: Keep codebase modular, independent, and standard.
5. **'Make it Ready' / 'Ready' Automated Pipeline Protocol**:
   Whenever the user asks to "make it ready" or says "ready", the agent must unconditionally execute:
   - Build validation and packaging: Run `node scripts/bundle-cpanel.mjs` to update `galaxygreen-cpanel.zip`.
   - Git synchronization: Commit all modified project files with descriptive message and push to GitHub `origin main`.
   - Localhost preview: Ensure local dev server is active and open `http://localhost:8080`.
6. **Mandatory Git Push Protocol**: Whenever ANY code or asset change is made, the agent must immediately commit all changes with a descriptive commit message and push to GitHub `origin main`.
