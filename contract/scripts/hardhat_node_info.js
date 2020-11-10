const { ethers, config } = require("hardhat");

async function fetchAccounts() {
  const hardhat_node_url = "http://localhost:8545";

  const provider = new ethers.providers.JsonRpcProvider(hardhat_node_url);
  const accounts = await provider.listAccounts();

  // fetching accounts_metadata from hardhat.config.js file
  const accounts_metadata = config.networks.hardhat.accounts;

  console.log("\nHardhat Local Network:\n");

  console.log("-------------------- Accounts --------------------");

  console.log("Accounts Metadata: ", accounts_metadata);

  console.log("----------------------------------------");

  for (let i = 0; i < accounts.length; i++) {
    const address = accounts[i];
    const balance = ethers.utils.formatEther(
      await provider.getBalance(address)
    );

    const wallet = ethers.Wallet.fromMnemonic(
      accounts_metadata.mnemonic,
      accounts_metadata.path + `/${i}`
    );
    const privateKey = wallet.privateKey;

    console.log(`${i + 1}) ${address}`);
    console.log(`Private Key: ${privateKey}`);
    console.log(`balance: ${balance} ETH`);
    console.log("----------------------------------------");
  }
}

fetchAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
