# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flaunch User Dashboard - A Next.js cryptocurrency portfolio tracker with Web3 authentication. The app allows users to view crypto positions for any wallet address, analyze portfolio performance, and access advanced analytics. Optionally supports Privy cross-app authentication for quick access to connected wallets.

## Key Commands

```bash
# Development (with HTTPS for Web3 features)
npm run dev

# Build
npm run build

# Production
npm start

# Linting
npm run lint
```

## Architecture

### Core Stack
- **Next.js 15** with App Router and TypeScript
- **Wagmi/Viem** for Web3 interactions
- **Privy** for optional authentication
- **TailwindCSS** with ShadCN UI components
- **React Query** for data fetching

### Project Structure
- `/app` - Next.js App Router pages and API routes
  - `/api/v1/base/users/[wallet]/positions` - Positions API endpoint
  - `/api/proxy` - API proxy routes for CORS handling
  - `/api/0x` - 0x API integration for token swaps
  - `/positions/[wallet]` - Main portfolio dashboard page (dynamic route)
  - `page.tsx` - Landing page with wallet input and feature highlights
- `/components` - React components
  - `FlayTokenGate.tsx` - FLAY token gating component (optional feature)
  - `PrivyAuthButton.tsx` - Web3 authentication button
  - `/ui` - Reusable ShadCN UI components
- `/lib` - Utilities and hooks
  - `/hooks/useFlayToken.ts` - FLAY token balance checking and 0x quote integration
  - `utils.ts` - Utility functions including formatting helpers
- `/types` - TypeScript type definitions

### Key Features
1. **Open Access**: Users can view any wallet address portfolio without authentication
2. **Privy Cross-App Authentication** (Optional): Quick access to connected Flaunch wallet
3. **Portfolio Analytics**: Displays positions with PnL, concentration warnings, and strategic insights
4. **Advanced Analytics**: Expandable position cards with risk assessment, DCA analysis, and exit strategies
5. **0x API Integration**: In-app token purchases through cross-app transactions (when authenticated)
6. **API Proxy**: Handles CORS for external API calls through `/api/proxy` routes

### API Integration Pattern
The app uses a dual API approach:
- Mock data in `/api/v1/base/users/[wallet]/positions/route.ts` for development
- Real API calls through proxy routes configured via `API_SERVER_URL` environment variable
- Pagination support with automatic fetching of all positions using `limit` and `offset` parameters
- Duplicate detection to handle API edge cases

### Environment Variables
Key variables from `env.template`:
- `API_SERVER_URL` - Backend API server URL (for proxy routes)
- `NEXT_PUBLIC_API_URL` - Public API URL for direct calls
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication app ID
- `NEXT_PUBLIC_PRIVY_PROVIDER_ID` - Privy provider ID for cross-app authentication
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `ZEROEX_API_KEY` - 0x API key for token swap quotes (server-side only)
- `NEXT_PUBLIC_BASE_RPC_URL` (optional) - Custom Base chain RPC URL

### HTTPS Requirement
The development server runs with `--experimental-https` flag which generates self-signed certificates in `/certificates`. This is required for Web3 wallet connections in development.

### State Management
- React Query for server state and data fetching
- Local React state for UI state
- Privy cross-app accounts for wallet state (when authenticated)
- Wagmi hooks for blockchain interactions (balances, token reads)

### Authentication Flow (Optional)
1. User can view any wallet address without authentication
2. Optionally, user logs in via Privy using Flaunch app credentials for quick access
3. App receives cross-app embedded wallet address
4. User can quickly navigate to their own portfolio from the landing page

### Token Swap Integration (For FLAY token gating feature)
The app includes infrastructure for 0x API integration to facilitate FLAY token purchases using `useCrossAppAccounts().sendTransaction()`, with fallback options to various Base DEXs (Uniswap, Aerodrome, BaseSwap). This is currently implemented but not required for basic app usage.