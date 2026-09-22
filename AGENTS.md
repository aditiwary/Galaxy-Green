# Galaxy Green — Developer & Agent Guidelines

## Project Overview

Galaxy Green (Sai Suraksha Nagar, Madhurawada, Visakhapatnam) is a luxury plotted development web portal and interactive booking platform built with TanStack Start, React 19, Tailwind CSS, and MySQL.

## Key Rules & Guidelines

1. **Database Source of Truth**: All plots, lead inquiries, and site configuration are dynamically managed in MySQL (`galaxy_green` database).
2. **Security Standards**:
   - Admin authentication uses secure server-side bcrypt hashing (`$2b$10$...`).
   - Rate limiting and honeypot field checks are enforced on public lead generation forms.
   - Admin routes require valid bearer tokens or authenticated sessions.
3. **No Third-Party Platform Locking**: Keep codebase modular, independent, and standard.
