// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const ethernal = require("hardhat-ethernal");

async function main() {
  const NFTMinter = await hre.ethers.getContractFactory("NFTMinter");
  const nftMinter = await NFTMinter.deploy();

  await nftMinter.deployed();

  hre.ethernalUploadAst = true;
  await hre.ethernal.push({
    name: "NFTMinter",
    address: nftMinter.address,
  });

  console.log(
    "NFTMinter contract is deployed at the address: ",
    nftMinter.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});