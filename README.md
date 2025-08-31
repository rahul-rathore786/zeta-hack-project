# No Risk Pot

## 🔗 Live Website

- Visit the [live version](https://no-risk-zeta-pot.vercel.app/)

- Presentation [Click Here](https://www.youtube.com/watch?v=MwpnkbAAaoQ)

## Project Overview

No Risk Pot is a revolutionary DeFi lottery platform where users can participate in lottery draws without risking their principal investment. Here's how it works:

1. Users purchase lottery tickets using COIN (a stablecoin).
2. The platform admin collects all ticket purchases and invests the pooled funds in liquidity pools or yield farming strategies to generate interest.
3. When a lottery draw occurs, winners are selected and prizes are distributed from the interest earned, not from the principal amount.
4. **Key differentiator:** All users receive their initial investment back, regardless of whether they win or lose the lottery.

### Prize Distribution

- 1st Prize: 50% of the total interest earned
- 2nd Prize: 30% of the total interest earned
- Platform Fee: 20% of the total interest earned goes to the platform owner

This creates a no-loss lottery system where participants can enjoy the excitement of potentially winning while preserving their capital.

## 🖼️ Project Screenshots

### 🏠 Home Page

**Home Page - View 1**  
![Home Page - View 1](./public/home1.png)

**Home Page - View 2**  
![Home Page - View 2](./public/home2.png)

**Home Page - View 3**  
![Home Page - View 3](./public/home3.png)

### 🎟️ Buy Ticket Page

**Buy Ticket using COIN**  
![Buy Ticket - Step 1](./public/buy_tkt.png)

### 🛠️ Admin Dashboard

**Admin Page - view-1**  
![Admin Page - Lottery Overview](./public/adminpage1.png)

**Admin Page - view-2**  
![Admin Page - Manage Tickets](./public/adminpage2.png)

**Admin Page - view-3**  
![Admin Page - Winners List](./public/adminpage3.png)

### 💰 Claim Fund Page

**Claim Fund Page**  
![Claim Fund Page](./public/claim_fund_page.png)

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── *.png (screenshots)
├── src/
│   ├── App.js
│   ├── index.js
│   ├── components/
│   │   └── NetworkError.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── BuyTickets.js
│   │   ├── AdminPanel.js
│   │   └── ClaimFunds.js
│   ├── styles/
│   │   ├── Home.css
│   │   ├── BuyTickets.css
│   │   ├── AdminPanel.css
│   │   ├── Navbar.css
│   │   └── NetworkError.css
│   └── artifacts/
│       └── addresses.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## 🚀 How to Run the Frontend

### Prerequisites

- Node.js 18 LTS recommended
- npm or pnpm
- MetaMask (or a compatible EVM wallet)

### Steps

1. Install dependencies

   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start the development server

   ```bash
   npm start
   # or
   pnpm start
   ```

3. Open http://localhost:3000 in your browser.

### Network

- The dApp targets the Zeta Testnet. If you are on another network, the app will prompt you to switch or add the network automatically.
- You may need some test COIN on Zeta Testnet to perform transactions.

## 📜 Deployed Contracts (Zeta Testnet)

Contracts are already deployed. You can verify them on the explorer below:

- Coin: `0xcfC913651a01e2421caeFA2bc296c5725De2391B`
- ZeroLossLottery: `0xCAd6D54Ad9B3f3B7437579b240b4258F546174a8`

> Note: The frontend reads addresses from `frontend/src/artifacts/addresses.json`.

## Security Considerations

- Always ensure your `.env` files are included in `.gitignore`
- Never commit sensitive keys or secrets to version control
- Use a dedicated development wallet with limited funds for testing
- Consider using a hardware wallet for production deployments
