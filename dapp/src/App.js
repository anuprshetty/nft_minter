// import logo from "./logo.svg";
import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3 from "web3";
import NFTMinter from "./NFTMinter.json";
import React, { Component } from "react";
import { formatBalance, formatChainAsNum } from "./utils";
/*
--> default export vs named export:
import DefaultComponent, { NamedComponent1, NamedComponent2 } from "./components/ComponentFile";

--> Note: For default export, you can specify any name while exporting. But for named export, you should specify the exact name.
Ex:
import AnyNameForDefaultComponent, { NamedComponent1, NamedComponent2 } from "./components/ComponentFile";
*/

/*
The Component Lifecycle:
- 1. Mounting:
  -- “Render phase” --> Pure and has no side effects. May be paused, aborted or restarted by React.
    --- constructor()
    --- render()
  -- “Commit phase” --> Can work with DOM, run side effects, schedule updates.
    --- React updates DOM and refs
    --- componentDidMount()
- 2. Updating:
  -- “Render phase” --> Pure and has no side effects. May be paused, aborted or restarted by React.
    --- update happens when any of new props, setState() or forceUpdate() happens.
    --- render()
  -- “Commit phase” --> Can work with DOM, run side effects, schedule updates.
    --- React updates DOM and refs
    --- componentDidUpdate()
- 3. Unmounting:
  -- “Render phase” --> Pure and has no side effects. May be paused, aborted or restarted by React.
    --- nothing happens
  -- “Commit phase” --> Can work with DOM, run side effects, schedule updates.
    --- componentWillUnmount()
*/
export default class App extends Component {
  /*
  The class based component provides 2 special class attributes:
  - this.props --> for properties object
  - this.state --> for state object
  */

  constructor() {
    super();

    this.state = {
      wallet: { accounts: [], balance: 0, chainId: 0 },
    };
    this.contract = null;
  }

  async componentDidMount() {
    if (window.ethereum) {
      console.log("component mounted");
    } else {
      console.error("Metamask not installed");
    }
  }

  async componentWillUnmount() {
    window.ethereum?.removeListener("chainChanged", this.refreshPage);
    window.ethereum?.removeListener("accountsChanged", this.refreshAccounts);
  }

  ethChainId = async () => {
    try {
      var chainId = formatChainAsNum(
        await window.ethereum.request({
          method: "eth_chainId",
        })
      );

      return chainId;
    } catch (err) {
      console.error("Error connecting to Metamask: ", err);
      return 0;
    }
  };

  refreshPage = () => {
    window.location.reload(true);
  };

  refreshChain = async () => {
    var chainId = await this.ethChainId();
    console.log("chainId: ", chainId);

    this.setState((prevState) => ({
      ...prevState,
      wallet: {
        ...prevState.wallet,
        chainId: chainId,
      },
    }));
  };

  ethRequestAccounts = async () => {
    try {
      /*
      - When a user connects their wallet (e.g., Metamask) to a web application, the wallet's user interface already displays the connected accounts. However, the web application itself does not have automatic access to the account information. So the web application needs explicit permission from the user to access the accounts programmatically.
      - So await window.ethereum.send('eth_requestAccounts'); line is used to send a request to the Ethereum provider (e.g., Metamask extension) to prompt the user for permission to access that user's Ethereum accounts connected to the wallet by the web application programmatically. This step is necessary to ensure that the web application has explicit user consent before accessing account-related information.
      - Once the user grants permission, the await window.ethereum.request({method: "eth_requestAccounts",}) method retrieves the list of connected accounts available in the connected wallet.
      - NOTE: Here accounts list contains only one account address. That will be the account selected by the user in the Metamask UI.
      */
      var accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      return accounts;
    } catch (err) {
      console.error("Error connecting to Metamask: ", err);
      return [];
    }
  };

  ethGetBalance = async (account) => {
    var balance = formatBalance(
      await window.ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"], // balance of the account at the latest block
      })
    );

    return balance;
  };

  refreshAccounts = async () => {
    var accounts = await this.ethRequestAccounts();
    var balance = 0;
    if (accounts.length > 0) {
      balance = await this.ethGetBalance(accounts[0]);
    }
    console.log("accounts: ", accounts);
    console.log("balance: ", balance);

    this.setState((prevState) => ({
      ...prevState,
      wallet: {
        ...prevState.wallet,
        accounts: accounts,
        balance: balance,
      },
    }));
  };

  /*
  - Class methods definition as arrow functions:
    -- Due to ES6 (ECMAScript 6) version of JavaScript, use arrow functions to define methods inside the class to automatically bind the method to the class instance. 
    -- So that the 'this' keyword referenced inside the method will always refer to the class instance in which the method is defined, no matter how the function is called or passed as a callback.
  - Class methods definition as regular functions (without arrow functions):
    -- If the method is defined regularly without arrow function (like, async connectWallet(){}), then the value of 'this' keyword inside the method depends on how the function is called. 
    -- If the function is called as a method of an object, then 'this' keyword refers to the object itself. However, if the function is called standalone or passed as a callback, then 'this' keyword can change its value or become undefined, leading to potential bugs. 
    -- So if you define a method regularly without arrow function and you want that 'this' keyword referenced inside the method to always refer to the class instance in which the method is defined, then you need to explicitly bind the method to the class instance inside the constructor (like this, this.connectWallet = this.connectWallet.bind(this);).
  */
  connectWallet = async () => {
    /*
    - Ethereum Provider API --> It is a Javascript API which internally uses JSON-RPC protocol to interact with the Ethereum compatible blockchain network or node.
  
    - window.ethereum --> It is an Ethereum Provider API object injected by Metamask.
      - Here window.ethereum(Ethereum Provider API) internally uses a third party network provider API(Ex: Infura, as configured in Metamask settings). That third party API will internally use the JSON-RPC protocol to interact with the Ethereum netowrk.
      - By default, Metamask uses Infura as remote procedure call (RPC) provider(aka network provider) to offer the most reliable and private access to Ethereum data.
      - If you are using the Metamask browser extension, it automatically injects the window.ethereum object into the browser's JavaScript environment.
      - When a user has Metamask installed and active, the window.ethereum object is available for your web application to use.
      - If window.ethereum == undefined or null, it means that Metamask extension is not installed or not active.
    */
    if (window.ethereum) {
      /*
      Providers in web3.js:
        1. HttpProvider:
          - This provider allows connecting to a remote Ethereum node via HTTP or HTTPS.
          - It requires specifying the URL of the Ethereum node as the provider endpoint.
          - The HttpProvider is useful when interacting with public Ethereum networks or when connecting to a locally running Ethereum node.
          - Ex: const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/API_KEY'));
        2. WebsocketProvider:
          - This provider establishes a WebSocket connection with an Ethereum node that support WebSocket connections.
          - WebSocket is a communication protocol that provides full-duplex communication channels over a single TCP connection. WebSocket allows for efficient and low-latency data exchange, making it well-suited for real-time applications.
          - It enables real-time bidirectional communication with the Ethereum node, allowing for subscriptions to events, real-time updates, and efficient communication with the Ethereum network.
          - The WebsocketProvider is commonly used when working with real-time data or building applications that require constant updates from the blockchain.
          - Ex: const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/v3/API_KEY'));
        3. IpcProvider:
          - This provider allows connecting to a locally running Ethereum node using an Inter-Process Communication (IPC) file.
          - The IPCProvider is commonly used when interacting with a local Ethereum node running on the same machine as the application.
          - Ex: const web3 = new Web3(new Web3.providers.IpcProvider('/path/to/geth.ipc', require('net')));
        4. MetamaskProvider:
          - It is a specific type of provider designed to interact with the Ethereum network through the Metamask browser extension.
          - Internally, the MetamaskProvider can use different underlying communication protocols, such as HTTP or WebSockets, depending on how the Metamask extension is configured. It abstracts away the specific details of the communication protocol and exposes a unified interface for interacting with the Ethereum network.
          - When a user has Metamask installed and enabled in their browser, the MetamaskProvider can be used to interact with the Ethereum network through the user's Metamask accounts.
          - Web3.js sets up the necessary communication channels with Metamask to send requests, receive responses, and handle Ethereum-related operations.
          - Ex: const web3 = new Web3(window.ethereum);
        5. Custom Providers:
          - Web3.js also allows creating custom providers to connect to specific Ethereum-compatible networks or other custom setups.
          - Custom providers can implement the necessary interfaces with communication logic to connect to the network and interact with it.
          - This requires advanced knowledge and skillset.
          - Ex: const web3 = new Web3(new MyCustomProvider('https://customnetwork.example.com'));
      */
      let web3 = new Web3(window.ethereum);

      await this.refreshChain();
      await this.refreshAccounts();

      window.ethereum.on("chainChanged", this.refreshPage);
      window.ethereum.on("accountsChanged", this.refreshAccounts);

      var nftMinterABI = NFTMinter.abi;
      var nftMinterAddress = process.env.REACT_APP_NFT_MINTER_ADDRESS;
      this.contract = new web3.eth.Contract(nftMinterABI, nftMinterAddress);
    } else {
      console.log("Please install Metamask");
    }
  };



  render() {
    /*
    --> JSX - JavaScript XML
    -->  It is an extension to JavaScript syntax that allows you to write HTML-like code within JavaScript.
    --> JSX is primarily associated with the React library and is commonly used to define the structure and appearance of components in React applications.
    --> However, it is important to note that JSX is not actual HTML. Instead, it is a syntactic sugar that gets transformed into regular JavaScript function calls during the compilation process.
    --> Ex: const element = <h1>Hello, JSX!</h1>;
        After compilation,
        const element = React.createElement('h1', null, 'Hello, JSX!');
    */
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <form
              className="gradient col-lg-5 mt-5"
              style={{
                borderRadius: "25px",
                boxShadow: "1px 1px 15px #000000",
              }}
            >
              <h1 style={{ fontWeight: 900, margin: "5px", color: "#FFFFFF" }}>
                Mint Portal
              </h1>
              <Button
                onClick={this.connectWallet}
                variant="dark"
                style={{
                  fontWeight: "bold",
                  margin: "5px",
                  color: "#FFFFFF",
                }}
              >
                Connect To Wallet
              </Button>
              {this.state.wallet.accounts.length > 0 && (
                <div
                  className="card"
                  style={{ margin: "5px", boxShadow: "1px 1px 4px #000000" }}
                >
                  <label
                    style={{ fontWeight: "bold", color: "#000000" }}
                    htmlFor="floating Input"
                  >
                    Your Connected Account: {this.state.wallet.accounts[0]}
                  </label>
                  <label
                    style={{ fontWeight: "bold", color: "#000000" }}
                    htmlFor="floating Input"
                  >
                    Balance: {this.state.wallet.balance} ETH
                  </label>
                  <label
                    style={{ fontWeight: "bold", color: "#000000" }}
                    htmlFor="floating Input"
                  >
                    Blockchian Network ID: {this.state.wallet.chainId}
                  </label>
                </div>
              )}
              <label
                style={{
                  display: "block",
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                1 NFT minting price: 0.0001 ETH
              </label>
              {this.state.wallet.accounts.length > 0 && (
                <div
                  className="card"
                  style={{ margin: "10px", boxShadow: "1px 1px 4px #000000" }}
                >
                  <label style={{ fontWeight: "bold", color: "#000000" }}>
                    Please select the amount of NFTs to mint
                  </label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue="1"
                    min="1"
                    max="5"
                    style={{ fontWeight: "bold", color: "#000000" }}
                  />
                  <Button
                    onClick={this.mint}
                    variant="dark"
                    style={{ fontWeight: "bold" }}
                  >
                    Mint
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }
}
