import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers, utils } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json'; //import abi

// Constants
const TWITTER_HANDLE = 'austin_beyond';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-9k5ivjsj9s';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x886D3C79c7C214f26c43d2Fd1c33d2dB85913bb9";

const App = () => {

  //state bariable used to store user's public wallet using use state
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    // make sure have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /**
     * check if have access to user's wallet
     */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /**
     * grab first account if multiple are authorized
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found"); //need to connect wallet/authoriize for first time
    }
  }

  /**
   * implement connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask");
        return;
      }
      // request access to account
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      // print connected public address
      console.log("Connected", accounts[0]); //get first account
      setCurrentAccount(accounts[0]);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      //string, hex code of chainId of the Rinkeby test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby test network!");
      }

    } catch(error) {
      console.log(error);
    }
  }

  // setup event listener
  const setupEventListener = async () => {
    // mostly looks like mint function
    try {
      const { ethereum } = window;

      if (ethereum) {
        // create new provider insance
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner(); // get signer for write function
        // create new instance of of contract with signer
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        // "capture" event when contract throws it - similar to webhooks
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        // create new provider insance
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner(); // get signer for write function
        // create new instance of of contract with signer
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to show wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT({
          value: utils.parseEther("0.0015"),
        }); //call mint function in contract with mint cost as value

        console.log("Mining.. please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const getTokenIdsMinted = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);
        const _tokenIds = await connectedContract.tokenIds();
        setTokenIdsMinted(_tokenIds.toString());
        console.log(`Minted ${_tokenIds} tokens`)
      } else {
        console.log("Ethereum object doesn't exist");
      } 
    } catch (error) {
      console.log(error)
    }
  };
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button mint-button">
      Mint NFT
    </button>
  )

  /**
   * runs function when page loads
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenIdsMinted();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}  
        </div>
        <div className="sub-text">
          {tokenIdsMinted}/{TOTAL_MINT_COUNT} have been minted
        </div>
        <div>
          <p className="sub-text">
            View collection on <a href={OPENSEA_LINK}>OpenSea</a>
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
