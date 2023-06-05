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
