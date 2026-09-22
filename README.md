# Galaxy Green — Sai Suraksha Nagar, Visakhapatnam

A modern, high-performance real estate portal and interactive plotted layout showcase for **Galaxy Green (Sai Suraksha Nagar)** located near Gambheeram, NH-16, Visakhapatnam. Built with **TanStack Start**, **React 19**, **Tailwind CSS**, and backed by **MySQL**.

---

## 🌟 Key Features

- **Interactive Layout Map**: Live SVG-based plot layout grid with real-time availability statuses (Available, Booked, Reserved).
- **Dynamic Pricing Calculator**: Instant EMI and plot price estimates based on facing, size, and amenities.
- **Site Tour Booking**: Direct booking for guided on-site inspections with automated confirmation and WhatsApp notifications.
- **Dealer & Admin CRM**:
  - Secure bcrypt authentication for dealer login.
  - Live lead management with status updates (New, Contacted, Site Visit Done, Converted, Lost).
  - Dynamic project configuration updates (pricing, bank loans, RERA info) persisted to MySQL.
  - One-click CSV lead export.
- **Enterprise-Grade SEO**:
  - Validated JSON-LD schemas (RealEstateAgent, SingleFamilyResidence, FAQPage, BreadcrumbList).
  - Complete OpenGraph and Twitter card metadata for optimal social previews and Google search rankings.
  - Dynamic `sitemap.xml` and `robots.txt`.
- **Security & Bot Protection**:
  - In-memory rate limiting for lead submission endpoints.
  - Honeypot spam defense to block automated bot submissions.
  - Server-side validation via Zod schemas.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start)
- **Frontend**: React 19, Tailwind CSS v4, Radix UI, Lucide Icons
- **Backend & Database**: Nitro server runtime, Node.js, `mysql2` with connection pooling
- **Security**: bcryptjs, Zod validation, rate limiting

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v20 or higher recommended)
- MySQL Server running locally or remotely

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=mysql://root:your_password@localhost:3306/galaxy_green
```

### 3. Database Initialization & Seeding

To initialize the MySQL tables (`plots`, `inquiries`, `admin_config`) and seed baseline inventory:

```sh
npm run db:seed
```

Alternatively, you can import `database/galaxy_green_mysql.sql` directly into MySQL Workbench or phpMyAdmin:

```sh
mysql -u root -p galaxy_green < database/galaxy_green_mysql.sql
```

### 4. Run Development Server

```sh
npm run dev
```

The application will be available at `http://localhost:8080`.

### 5. Build for Production

```sh
npm run build
npm run preview
```

---

## 📂 Project Structure

```
├── database/            # Production MySQL schemas and seed SQL files
├── public/              # Static assets, layout diagrams, robots.txt, sitemap.xml
├── scripts/             # MySQL migration and database seed CLI scripts
├── src/
│   ├── components/      # UI components (Navbar, Footer, Modals, Admin CRM Drawer)
│   ├── lib/             # Database connection, inquiry APIs, SEO schema generators
│   └── routes/          # TanStack Start file-based routes (Homepage, API endpoints)
├── package.json
└── vite.config.ts
```

---

## 📄 License

Private repository — All rights reserved © Galaxy Green.
