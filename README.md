# FRA Atlas Prototype

A comprehensive Forest Rights Act (FRA) implementation platform built with React, TypeScript, Supabase, and modern web technologies.

## 🚀 Features

### 🔹 Supabase Integration
- **Live Database**: Connected to Supabase with real-time data
- **TypeScript Types**: Auto-generated database types for type safety
- **Custom Hooks**: Reusable hooks for claims, schemes, documents, and user management
- **Role-based Access**: Admin and Officer roles with different permissions

### 🔹 Dashboard
- **Live KPIs**: Real-time statistics from Supabase
- **Interactive Charts**: Monthly trends and status distribution using Recharts
- **Skeleton Loading**: Smooth loading states for better UX
- **Filtering**: State and status-based filtering

### 🔹 Decision Support System
- **Scheme Matching**: Automatic eligibility matching based on claim criteria
- **Priority Scoring**: Intelligent recommendation system
- **Evidence Tracking**: Supporting evidence for each recommendation
- **Budget Impact**: Financial impact analysis

### 🔹 Document Management
- **OCR Integration**: Text extraction from uploaded documents
- **Entity Highlighting**: Named entity recognition for villages, claims, applicants
- **Search Functionality**: Full-text search across documents
- **Metadata Management**: Structured data extraction and storage

### 🔹 Admin Panel
- **Role-based Access**: Admin-only features with proper authorization
- **Data Management**: Dataset switching and export capabilities
- **System Configuration**: Layer management and user role configuration
- **Export Options**: CSV, GeoJSON, and PDF exports

### 🔹 UI/UX Enhancements
- **Dark/Light Mode**: Theme toggle with persistent preferences
- **Global Search**: Unified search across claims, villages, and documents
- **Skeleton Loaders**: Loading states for better perceived performance
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, ShadCN/UI
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **State Management**: React Hooks, Zustand
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel/Netlify ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd forest-rights-pilot
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Set Up Supabase

#### Option A: Use Existing Project
The project is already configured with a Supabase project. The connection details are in:
- `src/integrations/supabase/client.ts`
- `supabase/config.toml`

#### Option B: Create New Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Update the connection details in `src/integrations/supabase/client.ts`
3. Run the migration: `supabase/migrations/001_initial_schema.sql`

### 4. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📊 Database Schema

### Tables

#### Claims
```sql
claims (
  id, type, state, village, area, status, date, 
  applicant_name, tribe, poverty_index, groundwater_index, 
  agri_area, forest_degradation
)
```

#### Schemes
```sql
schemes (
  id, name, eligibility, priority, evidence_keys, 
  weights, budget, households_affected
)
```

#### Documents
```sql
documents (
  id, filename, status, uploaded_at, extracted_text, metadata
)
```

#### Users
```sql
users (
  id, role, email, name
)
```

## 🔧 Custom Hooks

### useClaims
```typescript
const { claims, loading, error } = useClaims({
  state: 'Maharashtra',
  status: 'Approved',
  dateRange: { start: '2024-01-01', end: '2024-12-31' }
});
```

### useSchemes
```typescript
const { schemes, loading, error } = useSchemes({
  filters: { minBudget: 100000, maxPriority: 3 }
});
```

### useDocuments
```typescript
const { documents, loading, error } = useDocuments({
  searchTerm: 'village',
  status: 'Processed'
});
```

### useUserRole
```typescript
const { role, isAdmin, isOfficer, updateUserRole } = useUserRole();
```

## 🎨 UI Components

### Theme Toggle
```typescript
import { ThemeToggle } from '@/components/ThemeToggle';
```

### Global Search
```typescript
import { GlobalSearch } from '@/components/GlobalSearch';
```

### Skeleton Loading
```typescript
import { Skeleton } from '@/components/ui/skeleton';
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all features including admin panel
- **Officer**: Read-only access to most features, limited admin access

### Role-based Components
```typescript
import { useAdminGuard } from '@/hooks/useUserRole';

const { hasAccess, loading } = useAdminGuard();
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN/UI components
│   ├── ThemeToggle.tsx # Dark/light mode toggle
│   └── GlobalSearch.tsx # Global search component
├── hooks/              # Custom React hooks
│   ├── useClaims.ts    # Claims data management
│   ├── useSchemes.ts   # Schemes data management
│   ├── useDocuments.ts # Documents management
│   └── useUserRole.ts  # User role management
├── integrations/       # External service integrations
│   └── supabase/       # Supabase configuration
├── lib/                # Utility functions and types
│   └── dbTypes.ts      # Database TypeScript types
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── DSS.tsx        # Decision support system
│   ├── Documents.tsx  # Document management
│   └── Admin.tsx      # Admin panel
└── store/              # State management
```

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 🔧 Environment Variables

Create a `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 API Documentation

### Claims Endpoints
- `GET /claims` - Fetch all claims with optional filters
- `POST /claims` - Create new claim
- `PUT /claims/:id` - Update claim
- `DELETE /claims/:id` - Delete claim

### Schemes Endpoints
- `GET /schemes` - Fetch all schemes
- `POST /schemes` - Create new scheme
- `PUT /schemes/:id` - Update scheme

### Documents Endpoints
- `GET /documents` - Fetch all documents
- `POST /documents` - Upload new document
- `PUT /documents/:id` - Update document metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Supabase integration
- ✅ Role-based access control
- ✅ Live dashboard with real-time data
- ✅ Decision support system
- ✅ Document management
- ✅ Dark/light mode toggle
- ✅ Global search functionality
- ✅ Admin panel with role-based access
- ✅ TypeScript types for all database tables
- ✅ Custom hooks for data management
- ✅ Skeleton loading states
- ✅ Responsive design

---

**FRA Atlas Prototype** - Empowering Forest Rights Act implementation through technology.