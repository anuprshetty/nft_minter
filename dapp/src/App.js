// import logo from "./logo.svg";
import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3 from "web3";
/*
--> default export vs named export:
import DefaultComponent, { NamedComponent1, NamedComponent2 } from "./components/ComponentFile";

--> Note: For default export, you can specify any name while exporting. But for named export, you should specify the exact name.
Ex:
import AnyNameForDefaultComponent, { NamedComponent1, NamedComponent2 } from "./components/ComponentFile";
*/

function App() {
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
            class="gradient col-lg-5 mt-5"
            style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #000000" }}
          >
            <h4 style={{ color: "#FFFFFF" }}>Mint Portal</h4>
            <h5 style={{ color: "#FFFFFF" }}>Please connect your wallet</h5>
            <Button
              variant="dark"
              style={{ marginBottom: "5px", color: "#FFFFFF" }}
            >
              Connect Wallet
            </Button>
            <div
              class="card"
              id="wallet-address"
              style={{ marginTop: "3px", boxShadow: "1px 1px 4px #000000" }}
            >
              <label style={{ color: "#000000" }} for="floating Input">
                Wallet Address
              </label>
              <input
                type="number"
                name="amount"
                defaultValue="1"
                min="1"
                max="5"
              />
              <label style={{ color: "#000000" }}>
                Please select the amount of NFTS to mint.
              </label>
              <Button variant="dark">Mint/Buy</Button>
            </div>
            <label style={{ color: "#FFFFFF" }}>
              Price 0.06 ETH each mint.
            </label>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
