import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import contractAddresses from "./artifacts/addresses.json";

// Components
import Navbar from "./components/Navbar";
import NetworkError from "./components/NetworkError";
import Home from "./pages/Home";
import BuyTickets from "./pages/BuyTickets";
import AdminPanel from "./pages/AdminPanel";
import ClaimFunds from "./pages/ClaimFunds";

// Contract ABIs
import ZeroLossLotteryABI from "./artifacts/contracts/ZeroLossLottery.sol/ZeroLossLottery.json";
import MockCoinABI from "./artifacts/contracts/Coin.sol/Coin.json";

// COIN token has 18 decimals
const COIN_DECIMALS = 18;
function App() {
  // State variables
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [coinContract, setCoinContract] = useState(null);
  const [lotteryAddress, setLotteryAddress] = useState("");
  const [coinAddress, setCoinAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [page, setPage] = useState("home");
  const [lotteryData, setLotteryData] = useState({
    totalTickets: 0,
    interestPool: 0,
    drawCompleted: false,
    userTickets: 0,
    coinBalance: 0,
    isWinner: 0,
    hasClaimed: false,
    winner: "",
    secondWinner: "",
  });
  const [networkError, setNetworkError] = useState(null);

  // Initialize web3 provider
  const initProvider = async (skipAccountRequest = false) => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        let accounts;
        if (!skipAccountRequest) {
          accounts = await web3Provider.send("eth_requestAccounts", []);
        } else {
          accounts = await web3Provider.listAccounts();
        }

        // Check if we have any accounts before proceeding
        if (!accounts || accounts.length === 0) {
          // Only log if we were expecting an account (i.e., on reconnect)
          if (skipAccountRequest) {
            console.log("No accounts available for reconnection.");
          }
          // Clear connection state and stop execution
          setAccount("");
          setProvider(null);
          setSigner(null);
          localStorage.setItem("walletConnected", "false");
          return;
        }

        const networkId = await web3Provider.getNetwork();

        // Check if connected to zeta Testnet (chainId 7001)
        if (networkId.chainId !== 7001) {
          setNetworkError({
            currentNetwork: networkId.name,
            currentChainId: networkId.chainId,
            requiredChainId: 7001,
          });
          return;
        } else {
          setNetworkError(null);
        }

        const web3Signer = web3Provider.getSigner();
        const address = await web3Signer.getAddress();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(address);

        const lotteryAddr = contractAddresses.ZeroLossLottery;
        const coinAddr = contractAddresses.Coin;
        setLotteryAddress(lotteryAddr);
        setCoinAddress(coinAddr);

        const lottery = new ethers.Contract(
          lotteryAddr,
          ZeroLossLotteryABI.abi,
          web3Signer
        );
        setLotteryContract(lottery);

        const coin = new ethers.Contract(coinAddr, MockCoinABI.abi, web3Signer);
        setCoinContract(coin);

        // Check if user is owner
        const owner = await lottery.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());

        // Load lottery data
        await refreshLotteryData(lottery, coin, address);
      } catch (error) {
        console.error("Error initializing provider:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask to use this dApp");
    }
  };

  // Helper function to format COIN amounts (18 decimals)
  const formatCoin = (amount) => {
    return ethers.utils.formatUnits(amount, COIN_DECIMALS);
  };

  // Helper function to parse COIN amounts (18 decimals)
  const parseCoin = (amount) => {
    return ethers.utils.parseUnits(amount.toString(), COIN_DECIMALS);
  };

  // Refresh lottery data
  const refreshLotteryData = async (lottery, coin, address) => {
    if (!lottery || !coin) return;

    try {
      const totalTickets = await lottery.totalTickets();
      const interestPool = await lottery.interestPool();
      const drawCompleted = await lottery.drawCompleted();
      const userTickets = await lottery.tickets(address);
      const coinBalance = await coin.balanceOf(address);
      const isWinner = await lottery.isWinner(address);
      const hasClaimed = await lottery.hasClaimed(address);

      // Get winner information if draw is completed
      let winner = "";
      let secondWinner = "";
      if (drawCompleted) {
        winner = await lottery.winners(0);
        secondWinner = await lottery.winners(1);
      }

      setLotteryData({
        totalTickets: totalTickets.toNumber(),
        interestPool: formatCoin(interestPool),
        drawCompleted,
        userTickets: userTickets.toNumber(),
        coinBalance: formatCoin(coinBalance),
        isWinner: isWinner,
        hasClaimed,
        winner,
        secondWinner,
      });
    } catch (error) {
      console.error("Error refreshing lottery data:", error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Reconnect with the new account
          initProvider(true);
        } else {
          // User disconnected all accounts
          setAccount("");
          setProvider(null);
          setSigner(null);
          setLotteryContract(null);
          setCoinContract(null);
          localStorage.setItem("walletConnected", "false");

          // Reset lottery data to default values
          setLotteryData({
            totalTickets: 0,
            interestPool: 0,
            drawCompleted: false,
            userTickets: 0,
            coinBalance: 0,
            isWinner: 0,
            hasClaimed: false,
          });
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        // Reload the page when chain changes
        window.location.reload();
      });
    }

    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  // Check for saved wallet connection on component mount
  useEffect(() => {
    const checkPreviousConnection = async () => {
      const isConnected = localStorage.getItem("walletConnected");
      if (isConnected === "true" && window.ethereum) {
        try {
          // First check if accounts are available before trying to reconnect
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            initProvider(true);
          } else {
            // No accounts available, clear the connection state
            localStorage.setItem("walletConnected", "false");
          }
        } catch (error) {
          console.error("Error reconnecting wallet", error);
          localStorage.setItem("walletConnected", "false");
        }
      }
    };

    checkPreviousConnection();
  }, []);

  // Persist wallet connection state
  useEffect(() => {
    if (account) {
      localStorage.setItem("walletConnected", "true");
    } else {
      localStorage.setItem("walletConnected", "false");
    }
  }, [account]);

  useEffect(() => {
    if (account && lotteryContract && coinContract) {
      refreshLotteryData(lotteryContract, coinContract, account);

      // Set up event listeners
      const ticketsPurchasedFilter = lotteryContract.filters.TicketsPurchased();
      const interestAddedFilter = lotteryContract.filters.InterestAdded();
      const drawCompletedFilter = lotteryContract.filters.DrawCompleted();
      const fundsClaimedFilter = lotteryContract.filters.FundsClaimed();

      lotteryContract.on(ticketsPurchasedFilter, () =>
        refreshLotteryData(lotteryContract, coinContract, account)
      );
      lotteryContract.on(interestAddedFilter, () =>
        refreshLotteryData(lotteryContract, coinContract, account)
      );
      lotteryContract.on(drawCompletedFilter, () =>
        refreshLotteryData(lotteryContract, coinContract, account)
      );
      lotteryContract.on(fundsClaimedFilter, () =>
        refreshLotteryData(lotteryContract, coinContract, account)
      );

      return () => {
        lotteryContract.removeAllListeners(ticketsPurchasedFilter);
        lotteryContract.removeAllListeners(interestAddedFilter);
        lotteryContract.removeAllListeners(drawCompletedFilter);
        lotteryContract.removeAllListeners(fundsClaimedFilter);
      };
    }
  }, [account, lotteryContract, coinContract]);

  // Function to switch correct network
  const switchToNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1B59" }], // chainId for Zeta Testnet: 7001
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        addNetwork();
      }
    }
  };

  // Function to add correct network to wallet
  const addNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1B59",
            chainName: "Zeta Testnet",
            nativeCurrency: {
              name: "Zeta",
              symbol: "ZETA",
              decimals: 18,
            },
            rpcUrls: ["https://zetachain-athens.g.allthatnode.com/archive/evm"],
            blockExplorerUrls: ["https://athens.explorer.zetachain.com/"],
          },
        ],
      });
    } catch (error) {
      console.error("Error adding correct network", error);
    }
  };

  // Render different pages based on state
  const renderPage = () => {
    switch (page) {
      case "buy":
        return (
          <BuyTickets
            lotteryContract={lotteryContract}
            coinContract={coinContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, coinContract, account)
            }
            parseCoin={parseCoin}
          />
        );
      case "admin":
        return isOwner ? (
          <AdminPanel
            lotteryContract={lotteryContract}
            coinContract={coinContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, coinContract, account)
            }
            parseCoin={parseCoin}
          />
        ) : (
          <div className="error-message">
            You are not authorized to access this page.
          </div>
        );
      case "claim":
        return (
          <ClaimFunds
            lotteryContract={lotteryContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, coinContract, account)
            }
          />
        );
      default:
        return (
          <Home lotteryData={lotteryData} setPage={setPage} isOwner={isOwner} />
        );
    }
  };

  return (
    <div className="app">
      <Navbar
        account={account}
        connectWallet={() => initProvider()}
        setPage={setPage}
        isOwner={isOwner}
        coinBalance={lotteryData.coinBalance}
      />
      <div className="container">{renderPage()}</div>

      {networkError && (
        <NetworkError
          networkError={networkError}
          onSwitchNetwork={switchToNetwork}
          onAddNetwork={addNetwork}
        />
      )}
    </div>
  );
}

export default App;
