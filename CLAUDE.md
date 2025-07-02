# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start development server with turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Project Architecture

This is a Next.js 15 project using the App Router pattern with the following key technologies:

- **Frontend Framework**: Next.js 15 (with App Router and Turbopack)
- **UI Components**: Custom components built with Tailwind CSS and Radix UI primitives
- **State Management**: React Query for server state, Zustand for client state
- **Authentication**: Clerk for user authentication
- **Database**: Supabase for data storage
- **Form Handling**: React Hook Form with Zod validation

### Key Features

1. **Trading Dashboard**: Main dashboard with welcome card, watchlist, and recent trades
2. **Watchlist Management**: Users can track stock symbols and monitor price changes
   - Requires user authentication
   - Watchlist preferences stored persistently in Supabase with user-specific settings
3. **Trade Validation**: System for validating trades based on specific conditions:
   - Time-based validation (trading hours)
   - Price-based conditions for long/short positions
   - FVG (Fair Value Gap) analysis

### Key Components

- **API Routes**:
  - `/api/watchlist`: Fetches stock watchlist data from Supabase with user preferences
  - `/api/watchlist/preferences`: Manages user watchlist visibility preferences
  - `/api/cron/stock-data`: Scheduled job to fetch and update stock data from external API

- **Data Flow**:
  1. Stock data is fetched from Financial Modeling Prep API via scheduled cron job
  2. Data is stored in Supabase tables (`stock_eod_data`, `latest_stock_eod_data`)
  3. Client components fetch data using React Query
  4. User interactions update local and persistent state

### Database Schema

The application uses Supabase with tables including:
- `stock_eod_data`: Historical end-of-day stock data
- `latest_stock_eod_data`: Latest price information for watchlist items
- `user_watchlist_preferences`: User-specific watchlist visibility preferences (uses symbol as identifier)

### Architecture Patterns

1. **Server Components**: Used for data-fetching and initial rendering
2. **Client Components**: Used for interactive elements with "use client" directive
3. **Hybrid Approach**: Server components pass data to client components as props

## Important Notes

- The application uses environment variables for API keys and database connections
- Authentication is managed through Clerk with JWT integration for Supabase RLS
- Stock data is fetched from Financial Modeling Prep API
- Watchlist preferences are stored in Supabase with user-specific RLS policies