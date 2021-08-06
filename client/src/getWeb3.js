import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const getWeb3 =async () =>{
  // new Promise(async (resolve, reject) => {
  //   // Wait for loading completion to avoid race conditions with web3 injection timing.
  //   window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          return(web3);
        } catch (error) {
          return(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        return(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          // "http://127.0.0.1:8545"// for development
          "https://ropsten.infura.io/v3/9f86490b4b644532bfb6e4f26a7ab590"//for testnet
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        return(web3);
      }
  //   });
  // });
    }



export const walletconnectinit =async () =>{

      const provider = new WalletConnectProvider({
        infuraId: "9f86490b4b644532bfb6e4f26a7ab590",
      });
    

    await provider.enable();
    console.log(provider)
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      console.log(chainId);
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
    });
    window.provider = provider;
    const web3 = new Web3(provider);

    return web3
    
  };

// export default getWeb3;
