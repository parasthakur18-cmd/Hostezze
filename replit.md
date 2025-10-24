# Hostezee Property Management System

## Overview

Hostezee is a comprehensive, multi-property management system designed for mountain resort properties. It offers capabilities for booking coordination with custom pricing, advance payments, guest tracking, restaurant operations, and complete checkout with bill generation. The system integrates a robust financial module for tracking property lease agreements, lease payments, and expenses with auto-categorization. It generates detailed P&L reports per property, providing a unified platform for operational and financial management. The project aims to provide a modern SaaS solution with a mountain resort-inspired, mobile-first design system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend uses **React 18** with **TypeScript**, built with **Vite**. **Wouter** handles routing, and **TanStack Query** manages server state. Forms are built with **React Hook Form** and **Zod** for validation. The UI design system leverages **shadcn/ui**, **Tailwind CSS**, and **Radix UI** primitives, styled with a custom mountain-themed color palette, supporting light/dark modes and mobile-first responsiveness.

### Backend

The backend is built with **Express.js** on **Node.js** using **TypeScript**, following a RESTful API design. It handles authentication, user management, CRUD operations for core resources (properties, rooms, bookings, etc.), and financial transactions. Key features include active booking dashboards, checkout processing with bill calculation, and comprehensive expense management. Development uses hot module replacement, and production builds combine client and server bundles.

### Data Storage

**PostgreSQL** via Neon serverless is the primary database, accessed using **Drizzle ORM** for type-safe queries and migrations. The schema includes tables for users (with role-based access), properties, rooms, guests, bookings, menu items, orders, bills, extra services, property leases, lease payments, and property expenses with customizable categories and keyword-based auto-categorization. Data validation is enforced client-side with Zod and server-side using shared Zod schemas.

### Authentication & Authorization

Authentication is handled by **Replit Auth** with OpenID Connect (OIDC) via Passport.js, using session-based authentication with secure HTTP-only cookies stored in PostgreSQL. Authorization is role-based (admin, manager, staff, kitchen) with property-specific assignments, ensuring granular access control. Security measures include HTTPS-only cookies, environment variable-secured session secrets, and CSRF protection.

### Core Features

- **Multi-Property Management**: Supports managing multiple resort properties from a single interface.
- **Booking & Guest Management**: Comprehensive booking coordination, guest tracking, and advanced pricing options.
- **Restaurant & Order Management**: Integrates restaurant operations, order tracking, and kitchen workflow.
- **Financial Tracking**: Manages property lease agreements, payments, expenses with auto-categorization, and generates P&L reports.
- **Active Bookings Dashboard**: Real-time monitoring of checked-in guests with running totals and quick checkout.
- **Room Availability Calendar**: Visual calendar for room availability and occupancy across properties.
- **Bill Management**: Detailed bill viewing, generation, and professional printing with itemized charges.
- **Booking Editing**: Allows staff to modify existing reservations, including dates, room assignments, and pricing.

## External Dependencies

### Third-Party Services

-   **Replit Auth OIDC**: User authentication and identity management.
-   **Neon Serverless PostgreSQL**: Primary database service.

### Key NPM Packages

-   **Backend**: `express`, `drizzle-orm`, `@neondatabase/serverless`, `passport`, `openid-client`, `express-session`, `connect-pg-simple`.
-   **Frontend**: `react`, `react-dom`, `@tanstack/react-query`, `wouter`, `react-hook-form`, `zod`, `date-fns`.
-   **UI/Styling**: `@radix-ui/react-*`, `tailwindcss`, `class-variance-authority`, `lucide-react`.
-   **Build Tools**: `vite`, `esbuild`, `typescript`, `tsx`.

### Environment Configuration

-   **Required**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`.
-   **Optional**: `ISSUER_URL`, `REPLIT_DOMAINS`, `NODE_ENV`.