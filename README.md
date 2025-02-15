# Project Summary

Crème'ai is a Web3 portfolio advisor platform that combines AI-driven insights with unique real-time on-chain data to provide users with intelligent portfolio management customised to their needs.

# Technical Documentation

## Website

Deployed at [crème'ai](https://creme-ai.vercel.app)

## Demo Videos

-   [AI chat interface I](https://drive.google.com/file/d/18K4_e1fPBkw7CNu9LPnPqW0JsJHsjM8C/view?usp=drive_link)
-   [AI chat interface II & Overall App Review](https://drive.google.com/file/d/1cqCOAsxGJ7Zg70z_nKI7Jisq8XYcBScy/view?usp=drive_link)
-   [User Settings and embedded wallet access](https://drive.google.com/file/d/1kbAwETS-0V4MkA2UPnqZr9GXOjGrnemc/view?usp=sharing)
-   [Deploying a strategy](https://drive.google.com/file/d/1sPPYbzzy0nxuPChfLFJzjHEvsA20SaSt/view?usp=sharing)

## 1. Frontend Framework

-   **Next.js** 15.1.0 with TypeScript
-   **Tailwind CSS** for styling with custom configuration
-   **Framer Motion** for animations
-   Custom dark/light theme system with HSL color variables

## 2. Authentication & Web3 Integration

-   **Privy** for Web3 authentication and wallet management
-   Support for multiple chains:
    -   Ethereum Mainnet
    -   Arbitrum
    -   Base
    -   Optimism
-   Multi-wallet support with delegation capabilities, allowing Ai autonomous control over wallet capital

## 3. Backend Services

-   **Supabase** for database management
-   Multiple API integrations:
    -   **Alchemy SDK** for blockchain data (for work in progress)
    -   **OpenAI** for base model of AI analysis
    -   **CookieDAO API** for social metrics
    -   **DexScreener** currently for token pricing
    -   **Odos** for optimal order routing
    -   **Etherscan**, **Basescan**, **Optimistic**, **Arbiscan** for explorer API and links
    -   Twitter scraping capabilities

## 4. State Management

-   **Zustand** for global state management
-   Persistent storage with state partitioning
-   Dedicated stores for:
    -   Chat sessions
    -   Portfolio data
    -   User preferences
    -   News feed

## 5. Key Features

### AI Chat Interface

### Portfolio Management

-   Real-time portfolio tracking
-   Multi-chain asset visualization
-   Perform token swaps/send tokens on behalf of the user
-   Risk analysis and rebalancing suggestions
-   Custom portfolio creation, adjustment and execution

### Social Intelligence

-   Twitter/X integration for sentiment analysis
-   KOL (Key Opinion Leader) activity monitoring
-   Social metrics integration for market sentiment

## 6. Unique Technical Features

-   Smart Portfolio Rebalancing
-   Risk Scoring System

## Future Improvements

-   Add support for more chains and on-chain actions
-   Implement alternative reasoning models for:
    -   Diverse thinking process
    -   Cross examination
    -   Development for better price predictions and indications
-   Add more social platform integrations
-   Implement automated trading strategies
-   Add portfolio performance analytics
-   Enhance mobile responsiveness

## 7. Startup Instructions (Local Development)

-   `cp .env.template .env`
-   Fill in the required environment variables
-   `pnpm install`
-   `pnpm run dev`
-   For signing in to Crème'ai, you will need to create a privy wallet.

![Demo Screenshot 1](/public/screen_shot1.png)

![Demo Screenshot 2](/public/screen_shot2.png)

## 7. Safe Strategy Screenshots

![Demo Screenshot 3](/public/screen_shot_3.png)

![Demo Screenshot 4](/public/screen_shot_4.png)

![Demo Screenshot 5](/public/screen_shot_5.png)

![Demo Screenshot 6](/public/screen_shot_6.png)