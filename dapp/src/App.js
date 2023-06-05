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

  
}
