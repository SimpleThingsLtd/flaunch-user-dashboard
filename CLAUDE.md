# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flaunch User Dashboard - A Next.js cryptocurrency portfolio tracker with Web3 authentication and FLAY token gating. The app allows users to view crypto positions, analyze portfolio performance, and access advanced analytics.

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
- **Privy** for authentication
- **TailwindCSS** with ShadCN UI components
- **React Query** for data fetching

### Project Structure
- `/app` - Next.js App Router pages and API routes
  - `/api/v1/base/users/[wallet]/positions` - Positions API endpoint
  - `/api/proxy` - API proxy routes for CORS handling
  - `/api/0x` - 0x API integration for token swaps
  - `/positions/[wallet]` - Main portfolio dashboard page
- `/components` - React components
  - `FlayTokenGate.tsx` - FLAY token requirement enforcement
  - `PrivyAuthButton.tsx` - Web3 authentication
  - `/ui` - Reusable ShadCN UI components
- `/lib` - Utilities and hooks
  - `/hooks/useFlayToken.ts` - FLAY token balance checking
- `/types` - TypeScript type definitions

### Key Features
1. **FLAY Token Gating**: Users need 100 FLAY tokens on Base chain to access the dashboard
2. **Privy Cross-App Authentication**: Uses Privy embedded wallets from the Flaunch app
3. **Portfolio Analytics**: Displays positions with PnL, concentration warnings, and strategic insights
4. **0x API Integration**: In-app token purchases through cross-app transactions
5. **API Proxy**: Handles CORS for external API calls through `/api/proxy` routes

### API Integration Pattern
The app uses a dual API approach:
- Mock data in `/api/v1/base/users/[wallet]/positions/route.ts` for development
- Real API calls through proxy routes configured via `API_SERVER_URL` environment variable
- Pagination support with automatic fetching of all positions

### Environment Variables
Key variables from `env.template`:
- `API_SERVER_URL` - Backend API server URL (for proxy)
- `NEXT_PUBLIC_API_URL` - Public API URL for direct calls
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect
- `ZX_API_KEY` - 0x API key for token swaps

### HTTPS Requirement
The development server runs with `--experimental-https` flag which generates self-signed certificates in `/certificates`. This is required for Web3 wallet connections in development.

### State Management
- React Query for server state
- Local React state for UI state
- Privy cross-app accounts for wallet state
- Wagmi hooks for blockchain interactions (balances, token reads)

### Authentication Flow
1. User logs in via Privy using the Flaunch app credentials
2. App receives cross-app embedded wallet address
3. FLAY token balance checked on the embedded wallet
4. If insufficient FLAY, user can purchase through 0x API using cross-app transactions

### Token Swap Integration
The app integrates with 0x API to facilitate FLAY token purchases directly within the interface using `useCrossAppAccounts().sendTransaction()`, with fallback options to various Base DEXs (Uniswap, Aerodrome, BaseSwap).