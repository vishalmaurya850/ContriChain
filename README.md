---
 
 # CryptoFund
 
 ![CryptoFund Logo](https://raw.githubusercontent.com/vishalmaurya850/ContriChain/refs/heads/master/app/favicon.ico)
 
 **CryptoFund** is a decentralized crowdfunding platform on Ethereum, enhanced with real-time market insights and AI predictions. Powered by Vertex AI and Alpha Vantage, it aids funding and stock market forecasting—all in one.
 
 ---
 
 ## Table of Contents
 - [Features](#features)
 - [Tech Stack](#tech-stack)
 - [Prerequisites](#prerequisites)
 - [Installation](#installation)
 - [Configuration](#configuration)
 - [Running the App](#running-the-app)
 - [Usage](#usage)
 - [Vertex AI & Alpha Vantage Integration](#vertex-ai--alpha-vantage-integration)
 - [Deployment](#deployment)
 - [Contributing](#contributing)
 - [License](#license)
 
 ---
 
 ## Features
 - **Decentralized Crowdfunding**: Launch and fund campaigns on Ethereum with transparent, blockchain-backed transactions.
 - **Real-Time Tracking**: Monitor ETH contributions instantly via Etherscan.
 - **Admin Dashboard**: Access stats on campaigns, funds raised, and user activity.
 - **Secure Authentication**: NextAuth.js ensures safe user and admin access.
 - **AI-Powered Insights**: Predicts campaign success, offers funding advice, and forecasts Stock market trends using real-time data.
 - **Contributor Showcase**: Highlights backers with donation details for community engagement.
 
 ---
 
 ## Tech Stack
 - **Frontend**: Next.js 15.1.0, React, Tailwind CSS
 - **Backend**: Node.js, MongoDB
 - **Blockchain**: Ethereum (ETH transactions)
 - **AI**: Google Vertex AI (predictive analytics, stock forecasting, generative responses)
 - **Real-Time Data**: Alpha Vantage (market data feed)
 - **Authentication**: NextAuth.js
 - **Deployment**: Vercel
 
 ---
 
 ## Prerequisites
 - **Node.js**: v18.x or later
 - **pnpm**: v8.x or later (or npm)
 - **MongoDB**: Local instance or MongoDB Atlas
 - **Ethereum Wallet**: MetaMask or similar for testing
 - **Git**: For cloning the repo
 
 ---
 
 ## Installation
 1. **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/cryptofund.git
    cd cryptofund
    ```
 
 2. **Install Dependencies**:
    ```bash
    pnpm install
    ```
 
 ---
 
 ## Configuration
 1. **Environment Variables**:
    Create a `.env.local` file in the root directory and add:
    ```env
    # MongoDB
    MONGODB_URI=mongodb://localhost:27017/cryptofund
 
    # NextAuth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secret-here
 
    # Flagsmith (Feature Flags)
    NEXT_PUBLIC_FLAGSMITH_ENV_ID=your-flagsmith-env-id
 
    # Google Cloud (Vertex AI)
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
    GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
 
    # Alpha Vantage (Real-Time Market Data)
    ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
 
    # Ethereum Blockchain
    ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
    NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
    ```
 
 2. **MongoDB Setup**:
    - Set up a local MongoDB instance or use MongoDB Atlas.
    - Ensure the `campaigns`, `users`, and `transactions` collections exist.
 
 3. **Ethereum Setup**:
    - Provide an Ethereum RPC URL (e.g., Infura, Alchemy) for blockchain interactions.
    - Deploy your smart contract and update `NEXT_PUBLIC_CONTRACT_ADDRESS`.
 
 4. **Flagsmith**:
    - Create a Flagsmith project and get your environment ID for feature toggles.
 
 ---
 
 ## Running the App
 1. **Development Mode**:
    ```bash
    pnpm dev
    ```
    or
    ```bash
    npm run dev
    ```
 
    Open `http://localhost:3000` in your browser. Vertex AI and Alpha Vantage will start automatically.
 
 3. **Build and Start**:
    ```bash
    pnpm build
    pnpm start
    ```
    or
    ```bash
    npm run build
    npm start
    ```
 
 ---
 
 ## Usage
 - **Create a Campaign**: Sign in, set a goal, and deploy on Ethereum via the smart contract.
 - **Contribute**: Connect your wallet, donate ETH, and track contributions live.
 - **Admin Access**: Log in as an admin (set `isAdmin: true` in MongoDB `users`) to view platform stats.
 - **AI Insights**: Get campaign success predictions, funding advice, and ETH market forecasts integrated throughout the app.
 
 ---
 
 ## Vertex AI & Alpha Vantage Integration
 Vertex AI and Alpha Vantage are fully embedded in CryptoFund and activate when the app starts—no separate setup needed:
 - **Real-Time Data**: Alpha Vantage streams live Stock Market prices, stored in MongoDB and fed into Vertex AI.
 - **AI Capabilities**:
   - Predicts campaign success using campaign data and market conditions.
   - Forecasts ETH price trends to optimize funding strategies.
   - Generates funding advice (e.g., “ETH is up 5%—promote your campaign now”).
 - **How It Works**:
   - Real-time data flows from Alpha Vantage to the app’s backend.
   - Vertex AI models (trained on campaign and market data) power predictions and advice across all pages.
   - Accessible via API endpoints like `/api/vertex-analysis`.
 
 ---
 
 ## Deployment
 CryptoFund is live at [www.contrichain.vercel.app](https://www.contrichain.vercel.app). To deploy your own instance:
 
 
 ---
 
 ## Contributing
 We welcome contributions! Follow these steps:
 1. Fork the repo.
 2. Create a branch (`git checkout -b feature/your-feature`).
 3. Commit changes (`git commit -m "Add your feature"`).
 4. Push to your fork (`git push origin feature/your-feature`).
 5. Open a Pull Request.
 
 Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).
 
 ---
 
 ## License
 This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
 
 ---