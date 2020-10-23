# NFT Minter

## Commands

### nft_minter

- npm install -g @remix-project/remixd
- remixd --> terminal command in project root directory (nft_minter) to share the local project root directory with web Remix IDE.

### nft_minter/dapp

- brew install node@16
- node -v
- npx create-react-app nft_viewer
- npm i web3
- npm i ethers
- npm install react-bootstrap bootstrap@5.1.3

### nft_minter/contract

- brew install --cask ipfs
- npm install --save-dev hardhat
- npx hardhat --> initial project setup
- npx hardhat node --> a local node is created with a built-in blockchain that can be used to simulate transactions and interactions with smart contracts. The node also has pre-funded accounts with test ether, which can be used for testing transactions without spending real money.
- npx hardhat clean --> clear build artifacts
- npx hardhat compile
- npx hardhat test
- npx hardhat node --> starts HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
- npx hardhat run scripts/deploy.js --network hardhat
- npx hardhat coverage --network hardhat --> for solidity-coverage plugin report

#### mocha

- Mocha, a javascript test framework.
- istanbul/nyc - JavaScript test coverage made simple.
- istanbul/nyc is a code coverage tool which works well with mocha.
  -- npm install --save-dev nyc

#### Remix IDE and Ethernal integration with Hardhat

- npx hardhat node
- open ethernal website to see local blockchain network info --> https://app.tryethernal.com/transactions
- compile and deploy contract using hardhat
  -- npx hardhat compile
  -- npx hardhat run scripts/deploy.js
- Open Remix IDE (Web)
- run remixd in project root directory (terminal) to share project with Remix IDE
- Load project in Remix IDE by connecting to localhost using remixd.
- compile and deploy contract using Remix IDE once again (It's a workaround for Ethernal tool sync)
- Now interact with deployed smart contract from Remix IDE.
- Analyze the blockchain and contract state from Ethernal tool.

### VS Code Extension

#### Solidity Visual Developer

- vs code command palette(CMD+SHIFT+P) --> >surya
