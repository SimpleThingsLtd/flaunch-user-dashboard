# Flaunch User Dashboard

A comprehensive Next.js application for tracking cryptocurrency positions with advanced analytics, real-time portfolio monitoring, and strategic insights.

## Features

🏠 **Landing Page**
- Clean, professional interface with wallet address input
- Feature highlights explaining the app's capabilities
- Modern gradient design with responsive layout

📊 **Portfolio Dashboard**
- **Portfolio Overview** with key metrics:
  - Total portfolio value
  - Number of positions
  - Profitable positions count
  - Average return percentage
- **Individual Position Cards** showing:
  - Token symbol, name, and images
  - Current holdings amount
  - Current value in USD
  - Position size percentage
  - PnL with color-coded indicators (green for profit, red for loss)
- **Contract address display** with click-to-copy functionality
- Links to blockchain explorer for each token

🔍 **Advanced Position Analytics**
- **Expandable Position Cards** with detailed insights:
  - **Risk & Concentration Warnings** for portfolio balance
  - **Position Building Strategy Analysis** (DCA effectiveness)
  - **Entry Performance Breakdown** (best/worst entry prices)
  - **Market Context & Token Health** metrics
  - **Strategic Exit Recommendations** based on performance
  - **Tax Planning Insights** and liquidity risk assessment
  - **Real Transaction History** with blockchain links

📈 **Professional Investment Analysis**
- Concentration risk assessment with visual warnings
- Dollar-cost averaging (DCA) strategy analysis
- Entry price performance tracking
- Market cap and volume analysis
- Risk/reward ratio calculations
- Exit strategy recommendations
- Tax implication warnings

🎨 **Design & UX**
- Built with Tailwind CSS and ShadCN UI components
- Responsive design that works on mobile and desktop
- Modern gradient backgrounds and clean card layouts
- Proper loading states and error handling
- Professional color scheme with profit/loss indicators
- Expandable cards for detailed analytics

🔧 **Technical Implementation**
- TypeScript for type safety
- Dynamic routing (`/positions/[wallet]`)
- Real-time API integration with pagination
- Advanced analytics calculations
- Proper component structure with reusable UI components
- Error handling and loading states
- Environment variable configuration

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SimpleThingsLtd/flaunch-user-dashboard.git
cd flaunch-user-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.template .env.local
# Edit .env.local with your API URL
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Enter Wallet Address**: On the landing page, enter any wallet address to view positions
2. **View Portfolio**: Navigate to the positions dashboard to see:
   - Overall portfolio metrics
   - Individual position cards with detailed information
   - Click any position card to expand for advanced analytics
   - Links to blockchain explorers for each token

## Project Structure

```
flaunch-user-dashboard/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── positions/
│   │   └── [wallet]/
│   │       └── page.tsx     # Positions dashboard with analytics
│   └── api/                 # API routes
├── components/
│   └── ui/                  # Reusable UI components
├── lib/
│   └── utils.ts             # Utility functions
├── types/
│   └── position.ts          # TypeScript interfaces
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## API Integration

The application fetches data from your existing API endpoints:

### 🔧 **API Configuration**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 📊 **API Endpoints Used**
- `GET /v1/base/users/{wallet}/positions/` - Get all positions for a wallet (with pagination)
- `GET /v1/base/users/{wallet}/positions/{tokenAddress}` - Get detailed position data

### 🔄 **Pagination Support**
The app automatically fetches all positions using pagination:
- Loops through all pages using `limit` and `offset` parameters
- Safety limits to prevent infinite loops
- Duplicate detection for robust data handling

## Advanced Analytics Features

### Risk Assessment
- **Portfolio Concentration** warnings when positions exceed risk thresholds
- **Diversification** recommendations
- **Liquidity Risk** assessment based on volume/market cap ratios

### Performance Analysis  
- **DCA Strategy** effectiveness tracking
- **Entry Price Analysis** showing best and worst entry points
- **Position Building Timeline** over time
- **Market Context** with token health metrics

### Strategic Insights
- **Exit Strategy** recommendations based on performance (2x, 5x+ gains)
- **Tax Planning** insights for significant gains
- **Risk/Reward** ratio calculations
- **Holding Period** analysis

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library
- **Radix UI** - UI primitives
- **Lucide React** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
