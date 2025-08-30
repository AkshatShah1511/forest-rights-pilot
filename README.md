# FRA Atlas & Decision Support System - Prototype

A comprehensive Forest Rights Act (FRA) Atlas and Decision Support System prototype built with React, TypeScript, and modern web technologies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (optional)
npm run build
```

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: Zustand, React Query
- **Maps**: Leaflet, React Leaflet (with OpenStreetMap fallback)
- **Charts**: Recharts
- **Routing**: React Router DOM

## 📱 Features

### Dashboard
- KPI cards showing claims statistics
- State-wise progress charts
- Monthly processing trends
- Data quality metrics
- Quick action buttons

### FRA Atlas
- Interactive map with multiple layers (IFR, CR, CFR, Assets)
- Layer toggles and opacity controls
- Feature info drawer with details
- Geographic and claim-based filtering
- Search and bookmark functionality

### Village Details
- Comprehensive village profiles
- Claims data table with export
- Environmental trend charts
- Asset visualization
- Issues and overlap detection

### Decision Support System (DSS)
- Scheme recommendation engine
- Priority-based filtering
- Evidence-based scoring
- Action planning interface
- Multi-village analysis

### Document OCR/NER Viewer
- Document upload interface (demo)
- Named Entity Recognition highlighting
- Metadata extraction forms
- Text search and filtering

### Admin Panel
- Dataset management (Maharashtra Demo / India Minimal)
- Layer configuration
- User role management
- System information and controls

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Utilities (API, DSS logic)
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
public/mock/            # Mock data files (JSON/GeoJSON)
```

## 📊 Mock Data

All data is contained in `/public/mock/` for demo purposes:
- `states.json` - State master data
- `districts.json` - District boundaries
- `villages.json` - Village details with indicators
- `claims.json` - FRA claims data
- `*.geojson` - Spatial layer data
- `schemes.json` - Government scheme definitions

## 🎯 Demo Script (2-3 minutes)

1. **Dashboard Overview** - Show KPIs and click state bar
2. **Atlas Navigation** - Toggle layers, click village polygon
3. **InfoDrawer → DSS** - Open recommendations for selected village
4. **Action Planning** - Mark recommendation as planned
5. **Documents** - Show OCR/NER extraction
6. **Admin** - Switch datasets, show role management

## ⚙️ Configuration

### Environment Variables (Optional)
- `MAPBOX_TOKEN` - For Mapbox tiles (fallback to OpenStreetMap if not provided)

### Customization
- Colors and themes in `src/index.css`
- Component variants in `tailwind.config.ts`
- Mock data in `public/mock/` directory

## 🔒 Role-Based Access

- **Admin**: Full access to all features
- **Dept Officer**: Limited exports, no admin functions
- **NGO**: Read-only access with basic exports

## 📝 Development Notes

- All external API calls are mocked
- Map uses OpenStreetMap tiles by default
- Data persists in localStorage for demo
- Built for demo/prototype purposes only
- Optimized for desktop viewing

## 🎨 Design System

Government-tech inspired design with:
- Primary blue (#1e40af) for official elements
- Success green for approved claims
- Warning orange for pending items
- Semantic color tokens throughout
- Consistent spacing and typography
- Accessible contrast ratios

---

**Version**: 1.0.0-prototype  
**Build Date**: 2024-01-30  
**Demo Ready**: ✅