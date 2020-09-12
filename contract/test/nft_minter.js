const { expect } = require("chai");
const { ethers } = require("hardhat");
const { itParam } = require("mocha-param");

describe("NFTMinter", function () {
  let nftMinter;
  let owner;
  let user1;
  let user2;

  before(async function () {
    // console.log("Testing started – before all tests");
  });
  after(async function () {
    // console.log("Testing finished – after all tests");
  });
  beforeEach(async function () {
    // console.log("Before a test – enter a test");

    // JavaScript destructuring for arrays and objects.
    [owner, user1, user2] = await ethers.getSigners();
    const NFTMinter = await ethers.getContractFactory("NFTMinter"); // this method looks for a contract artifact file in the artifacts/ directory of your Hardhat project. If it finds the file, it returns a contract factory object that you can use to deploy and interact with the contract.
    nftMinter = await NFTMinter.connect(owner).deploy(); // initiates for deploying the smart contract to this local testnet
    await nftMinter.deployed(); // waits for the contract deployment transaction to be confirmed and for the contract to be fully deployed on the local testnet
  });
  afterEach(async function () {
    // console.log("After a test – exit a test");
  });
});
