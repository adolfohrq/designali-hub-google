# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Database Configuration

**ALWAYS USE MCP SUPABASE TOOLS** for database operations and configurations in this project.

The project is configured with Supabase MCP integration. For any database-related tasks including:
- Schema changes and migrations
- Table creation/modification
- Database queries
- Configuration updates
- Type generation
- Storage configuration
- Edge Functions deployment

You MUST use the Supabase MCP tools (prefixed with `mcp__supabase__`) rather than manual Firebase/Firestore operations.

Available MCP Supabase tools include:
- `mcp__supabase__list_tables` - List all database tables
- `mcp__supabase__execute_sql` - Execute SQL queries
- `mcp__supabase__apply_migration` - Apply database migrations
- `mcp__supabase__generate_typescript_types` - Generate TypeScript types
- `mcp__supabase__get_advisors` - Check for security/performance issues
- And many more (see function definitions)

## Project Overview

Designali Hub is a React-based personal productivity and learning management application with Supabase backend integration and Google Gemini AI features. The app allows users to manage tools, videos, notes, courses, and learning resources in a centralized dashboard.

**Original Project:** https://ai.studio/apps/drive/19Kyrpam4rW8q6_XURu5U9J_AjOOumM4m

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (starts on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Environment Setup

1. Create or update `.env.local` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

2. Configure Supabase connection:
   - Use MCP Supabase tools to manage database configuration
   - Required credentials are managed through the MCP connection

## Architecture

### Technology Stack

- **Frontend Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (via CDN)
- **Charts:** Recharts 3.4.1
- **AI Integration:** Google Gemini AI (@google/genai)
- **Backend:** Supabase (PostgreSQL + Storage + Edge Functions)
- **Notifications:** react-hot-toast

### Application Structure

The app uses a **single-page architecture** with client-side routing managed through state:

- **`App.tsx`**: Main application component that handles authentication state and page routing via enum-based navigation
- **`types.ts`**: Centralized type definitions for all data models (Tool, Video, Note, Course, Resource, etc.)
- **`pages/`**: Page components for each major section (Dashboard, Ferramentas, Videos, Notas, Estudo, Recursos)
- **`components/`**: Reusable UI components (Sidebar, Header, Modal, Card, Icons, ContentPageLayout)
- **`services/supabase.ts`**: Supabase client initialization
- **`data/mockData.ts`**: Mock data for initial development/testing

### Navigation System

Navigation uses the `Page` enum (defined in `types.ts`) rather than URL-based routing:
- Active page is tracked in `App.tsx` via `activePage` state
- Page changes are triggered by `setActivePage(Page.X)` calls
- Sidebar and quick actions navigate by updating this state

### Data Flow

1. **Supabase Real-time Subscriptions**: Each page uses Supabase real-time features to subscribe to table changes
2. **Local State Management**: React `useState` for component-level state, no global state management library
3. **AI Integration**: Gemini API accessed via `@google/genai` client library for AI-powered features (tool suggestions, etc.)

### Database Tables

The app uses these Supabase tables:
- `tools` - Design/development tools with categories
- `videos` - Educational video links from YouTube/Vimeo
- `notes` - User notes with markdown support and tags
- `courses` - Learning courses with progress tracking
- `resources` - Articles, books, podcasts, and other learning resources

Each table item includes:
- Standard fields from type definitions in `types.ts`
- `id` field (primary key, UUID)
- `is_favorite` boolean for favoriting functionality
- `created_at` and `updated_at` timestamps

### Styling Conventions

- **Tailwind Utility Classes**: Primary styling approach
- **Custom Theme Colors**: Defined in `index.html` Tailwind config
  - `brand-purple` (#6D28D9)
  - `brand-purple-light` (#EDE9FE)
  - `brand-dark` (#111827)
  - `brand-light` (#F9FAFB)
  - `brand-gray` (#6B7280)
- **Font**: Inter from Google Fonts

### Path Aliasing

The project uses `@/` as an alias for the root directory:
```typescript
import { Tool } from '@/types';
import Sidebar from '@/components/Sidebar';
```

## Key Implementation Patterns

### Adding a New Page

1. Create page component in `pages/` directory
2. Add new page to `Page` enum in `types.ts`
3. Import and add case in `App.tsx` `renderPage()` switch statement
4. Add page title to `getPageTitle()` mapping in `App.tsx`
5. Add navigation entry in `components/Sidebar.tsx`

### Supabase Integration Pattern

Each page that displays data follows this pattern:
```typescript
useEffect(() => {
  const subscription = supabase
    .from('table_name')
    .on('*', payload => {
      // Handle real-time updates
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Gemini AI Integration

The Gemini API key is injected via Vite's define config (see `vite.config.ts`):
```typescript
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```

Access in components via `process.env.GEMINI_API_KEY`.

## Important Notes

- **No Git Repository**: This project is not currently a git repository
- **TypeScript Decorators**: Enabled via `experimentalDecorators` in tsconfig.json
- **Module System**: Uses ESM with bundler resolution
- **Type Checking**: TypeScript strict mode is not enabled; uses loose type checking
- **Import Maps**: HTML uses import maps for CDN dependencies (see `index.html`)
- **@ts-ignore**: Used for some library imports that lack type definitions (recharts, react-hot-toast)

## Database Best Practices

When working with the database:
1. Always use MCP Supabase tools for schema changes
2. Generate TypeScript types after migrations using `mcp__supabase__generate_typescript_types`
3. Run security advisors regularly using `mcp__supabase__get_advisors`
4. Use proper RLS (Row Level Security) policies for all tables
5. Keep migrations tracked and versioned