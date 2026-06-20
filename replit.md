# Madhav Parivar - Devotional Management System

## Overview

This is a comprehensive devotional management system built for managing spiritual communities, devotees, families, events, and religious activities. The application provides a full-stack solution with a React frontend and Express backend, designed to handle various aspects of spiritual community management including devotee registration, family management, event planning, donations tracking, and volunteer coordination.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming support
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with TypeScript support

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Management**: Type-safe schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Core Entities
1. **Users**: Authentication and user management with role-based access
2. **Devotees**: Individual devotee profiles with comprehensive information
3. **Families**: Family unit management with relationships
4. **Mentors**: Spiritual guides and counselors management
5. **Events**: Event planning and management system
6. **Attendance**: Tracking participation in events and activities
7. **Donations**: Financial contribution tracking and management
8. **Volunteering**: Volunteer activity coordination
9. **Groups**: Community groups with messaging integration

### Advanced Features
1. **Dashboard Designer**: Customizable dashboard with draggable widgets
2. **ID Card Generator**: Professional ID card creation with multiple templates
3. **Theme System**: 8 complete themes (Devotional Classic, Matrix Digital, Iron Man Tech, Ocean Blue, Forest Green, Royal Purple, Sunset Orange, Midnight Dark) with full CSS variable coverage for dark/light modes
4. **Analytics**: Comprehensive reporting and analytics dashboard
5. **Bulk Operations**: Mass operations for devotee management
6. **Export/Import**: Data export and import capabilities
7. **GOD Mode Developer Studio**: 15-tab studio with 3 rows:
   - CONFIGURATION: App Info, Theme Studio, Navigation, Schema, Access Control
   - GOD MODE TOOLS: Data Browser, Relational Map, Macro Studio, Audit Trail, Dev Ops
   - GOD MODE POWER: API Console, Feature Flags, Seed Manager, Rollback, Visual Overrides
8. **Visual Editor**: In-place visual editing with 5-slot circular rollback buffer
9. **Feature Flags**: 8 module flags wired to sidebar navigation (donations, analytics, volunteering, idCards, mentors, events, attendance, groups)
10. **Seed Manager**: Reset to demo data or add test records for any entity
11. **Notifications**: Live notification system with bell icon, mark read/delete
12. **Dev Mode**: Code `DevelopZ`, yellow banner with quick Dev Studio link, VisualEditor floating button

## Data Flow

### Authentication Flow
1. User authentication through Replit Auth (OpenID Connect)
2. Session management with PostgreSQL-backed storage
3. Role-based access control for different user types
4. Secure API endpoints with authentication middleware

### Data Management Flow
1. Frontend forms with Zod validation
2. API requests through TanStack Query with optimistic updates
3. Server-side validation and business logic
4. Database operations through Drizzle ORM
5. Real-time updates and cache invalidation

### File Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Theme, Dashboard)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── migrations/            # Database migrations
```

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod for schema validation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm for type-safe database operations
- **Authentication**: openid-client for OAuth integration
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Build Tools**: esbuild for server bundling

### Development Dependencies
- **TypeScript**: Full TypeScript support across the stack
- **ESLint/Prettier**: Code formatting and linting
- **Vite**: Fast development server with HMR

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds the React application to `dist/public`
2. **Backend Build**: esbuild bundles the Express server to `dist/index.js`
3. **Database Setup**: Drizzle migrations ensure schema consistency

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Secret for session encryption
- **REPLIT_DOMAINS**: Allowed domains for authentication
- **ISSUER_URL**: OpenID Connect issuer URL

### Production Deployment
- Server runs on Node.js with production optimizations
- Static files served through Express
- Database connections pooled for performance
- Session storage in PostgreSQL for scalability

## Key Features

### Developer Mode
- Activated via the "Developer Mode" button in the sidebar using code **DevelopZ**
- Shows a persistent yellow banner when active
- Grants full system configuration access

### Devotee Profile Page (/devotees/:id)
- Full-page profile with large centered avatar (25% screen width)
- Quick stats: Attendance %, Total Donated, Total Seva Hours
- Clickable family member tiles (navigate between profiles)
- 4 tabs: Details, Attendance (BarChart), Donations (AreaChart + PieChart), Volunteering (BarChart)

### Events Management (/events)
- Card-based layout with event images (URL-based)
- Event type badges: satsang, festival, workshop, meeting
- Archive/unarchive individual events
- Auto-Archive Past button for bulk archiving
- Create/edit events with image preview

### Dashboard (/dashboard)
- Upcoming Events section above the attendance chart
- Shows next 5 events sorted by date with countdown (Today/Tomorrow/In X days)
- Event images, type, location, and capacity shown

### Storage
- Uses in-memory storage (MemoryStorage) — no PostgreSQL required
- Seed data: 10 devotees across 3 families, 6 events, 12 months of attendance/donation/volunteering history

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- March 13, 2026. Major feature additions: Developer Mode, Devotee Full Profile Page with analytics charts,
  Upcoming Events on Dashboard, Events image upload and archiving, Fixed Select.Item empty value bugs,
  Updated to in-memory storage with rich seed data
- March 26, 2026. GOD Mode expansion:
  - 5 new GOD MODE POWER tabs in Dev Studio (API Console, Feature Flags, Seed Manager, Rollback, Visual Overrides)
  - VisualEditorContext with 5-slot circular rollback buffer for in-place visual editing
  - Feature Flags now wired to sidebar nav (8 flags control module visibility live)
  - ThemeContext updated with full CSS variable coverage for all 8 themes (card, muted, border for dark themes)
  - DevMode banner overlap fixed (pt-7 applied to main content wrapper when banner active)
  - Seed Manager: resetAndReseed() + donations/volunteering support in seed/add endpoint
  - Visual Editor floating button in bottom-right corner (dev mode only)
- March 26, 2026 (Session 2). Notifications, Donations, Analytics, DevoteeProfile upgrades:
  - Notifications: isPinned field added; pin/unpin API endpoints; Header.tsx fully rewritten with
    pinned-first sort (amber section), proper word-wrap, 520px scrollable panel, server-side persistence
  - Document storage: MemoryStorage documentStore Map, document CRUD routes (/api/devotees/:id/documents),
    DevoteeProfile now has 5th "Documents" tab with file upload (images/PDF), type selector, download, delete
  - Donation Receipt Modal: Print Receipt (printer icon) button per row; branded receipt dialog with
    org header, receipt number, amount display, 80G notice, and browser print functionality
  - Analytics 4-tab layout: Overview, Devotees (age/gender/city/spiritual level), Donations (monthly/purpose/method), Events
  - Dashboard group actions: replaced console.log/alert with toast notifications and real Bulk Message dialog
  - Privacy verified: Dashboard shows only aggregate stats, no individual devotee profiles
  - All 8 themes verified: devotional, matrix, ironman, ocean, forest, royal, sunset, midnight
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```