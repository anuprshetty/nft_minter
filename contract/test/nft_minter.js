// mocha --> a javascript test framework.
// chai --> an assertion library.

const { expect } = require("chai");
const { ethers, run } = require("hardhat");
const { itParam } = require("mocha-param");

describe("NFTMinter", function () {
  let nftMinter;
  let owner;
  let user1;
  let user2;

  before(async function () {
    // console.log("Testing started – before all tests");
    await run("compile");
  });
  after(async function () {
    // console.log("Testing finished – after all tests");
  });
  beforeEach(async function () {
    // console.log("Before a test – enter a test");

    // JavaScript destructuring for arrays and objects.
    [owner, user1, user2] = await ethers.getSigners();
    const NFTMinter = await ethers.getContractFactory("NFTMinter"); // this method looks for a contract artifact file in the artifacts/ directory of your Hardhat project. If it finds the file, it returns a contract factory object that you can use to deploy and interact with the contract.
    nftMinter = await NFTMinter.connect(owner).deploy(
      "NFT Collection TomAndJerry",
      "COL-TNJ"
    ); // initiates for deploying the smart contract to this local testnet
    await nftMinter.waitForDeployment(); // waits for the contract deployment transaction to be confirmed and for the contract to be fully deployed on the local testnet
  });
  afterEach(async function () {
    // console.log("After a test – exit a test");
  });

  describe("deployment initial state", function () {
    it("should set the state variables to correct values after contract deployment", async function () {
      expect(await nftMinter.connect(owner).name()).to.equal(
        "NFT Collection TomAndJerry"
      );
      expect(await nftMinter.connect(owner).symbol()).to.equal("COL-TNJ");
      expect(await nftMinter.connect(owner).baseURI()).to.equal("");
      expect(await nftMinter.connect(owner).baseExtension()).to.equal(".json");
      expect(await nftMinter.connect(owner).cost()).to.equal(
        ethers.parseEther("0.0001")
      );
      expect(await nftMinter.connect(owner).maxSupply()).to.equal(1000);
      expect(await nftMinter.connect(owner).maxMintAmount()).to.equal(5);
      expect(await nftMinter.connect(owner).paused()).to.be.false;
    });
  });

  describe("mint", function () {
    describe("negative scenarios", function () {
      it("should revert when paused", async function () {
        await nftMinter.connect(owner).pause(true);
        expect(await nftMinter.connect(owner).paused()).to.equal(true);

        await expect(
          nftMinter.connect(user1).mint(user1.address, 1)
        ).to.be.revertedWith("minting is paused");
      });

      it("should revert when mintAmount is 0", async function () {
        await expect(
          nftMinter.connect(user1).mint(user1.address, 0)
        ).to.be.revertedWith("mint amount is less than 1");
      });

      it("should revert when mintAmount > maxMintAmount", async function () {
        await expect(
          nftMinter.connect(user1).mint(user1.address, 6)
        ).to.be.revertedWith("max mint amount exceeded");
      });

      it("should revert when (totalSupply + mintAmount) > maxSupply", async function () {
        let newMaxMintAmount = 250;
        await nftMinter.connect(owner).setmaxMintAmount(newMaxMintAmount);
        expect(await nftMinter.connect(owner).maxMintAmount()).to.equal(
          newMaxMintAmount
        );

        for (let i = 0; i < 3; i++) {
          await nftMinter.connect(owner).mint(owner.address, 250);
        }
        await nftMinter.connect(owner).mint(owner.address, 249);

        let totalSupply = await nftMinter.connect(owner).totalSupply();
        expect(totalSupply).to.equal(999);

        await expect(
          nftMinter.connect(owner).mint(owner.address, 2)
        ).to.be.revertedWith("max supply exceeded");

        await nftMinter.connect(owner).mint(owner.address, 1);

        let maxSupply = await nftMinter.connect(owner).maxSupply();
        totalSupply = await nftMinter.connect(owner).totalSupply();
        expect(totalSupply).to.equal(maxSupply);

        await expect(
          nftMinter.connect(owner).mint(owner.address, 1)
        ).to.be.revertedWith("max supply exceeded");

        maxSupply = await nftMinter.connect(owner).maxSupply();
        totalSupply = await nftMinter.connect(owner).totalSupply();
        expect(totalSupply).to.equal(maxSupply);
      });

      itParam(
        "should revert when user(except owner) doesn't send 0.0001 ether for each token to be minted: sent ${value} ether for 2 mintAmount",
        ["0", "0.0001", "0.0003"],
        async function (value) {
          await expect(
            nftMinter.connect(user1).mint(user1.address, 2, {
              value: ethers.parseEther(value),
            })
          ).to.be.revertedWith(
            "Need to send 0.0001 ether for each token to be minted"
          );
        }
      );
    });

    describe("minting", function () {
      it("should mint and transfer the specified amount of tokens to the given address", async function () {
        let mintAmount = 3;
        await nftMinter.connect(user1).mint(user2.address, mintAmount, {
          value: ethers.parseEther("0.0003"),
        });

        const user2_balance = await nftMinter
          .connect(user2)
          .balanceOf(user2.address);
        const user2_tokens = await nftMinter
          .connect(user2)
          .walletOfOwner(user2.address);

        expect(user2_balance).to.equal(mintAmount);
        expect(user2_tokens.length).to.equal(mintAmount);
      });
    });
  });

  describe("walletOfOwner", function () {
    it("user wallet should be correct with balance equal to the total number of tokens minted to the user address", async function () {
      let user2_balance = (
        await nftMinter.connect(user2).walletOfOwner(user2.address)
      ).length;
      expect(user2_balance).to.equal(0);

      await nftMinter.connect(user1).mint(user2.address, 1, {
        value: ethers.parseEther("0.0001"),
      });
      await nftMinter.connect(user1).mint(user2.address, 2, {
        value: ethers.parseEther("0.0002"),
      });

      user2_wallet = await nftMinter
        .connect(user2)
        .walletOfOwner(user2.address);
      user2_balance = user2_wallet.length;

      expect(user2_balance).to.equal(3);

      expect(user2_wallet[0]).to.equal(1);
      expect(user2_wallet[1]).to.equal(2);
      expect(user2_wallet[2]).to.equal(3);
    });
  });

  describe("tokenURI", function () {
    it("should revert if tokenId doesn't exist", async function () {
      await expect(nftMinter.connect(user1).tokenURI(0)).to.be.revertedWith(
        "ERC721Metadata: URI query for nonexistent token"
      );
    });

    it("should return empty string if baseURI is empty", async function () {
      await nftMinter.connect(owner).setBaseURI("");
      expect(await nftMinter.connect(owner).baseURI()).to.equal("");

      await nftMinter.connect(user1).mint(user1.address, 1, {
        value: ethers.parseEther("0.0001"),
      });
      expect(await nftMinter.connect(user1).totalSupply()).to.equal(1);
      expect(await nftMinter.connect(user1).balanceOf(user1.address)).to.equal(
        1
      );

      expect(await nftMinter.connect(user1).tokenURI(1)).to.be.equal("");
    });

    it("should return correct tokenURI for the given existing tokenId", async function () {
      await nftMinter.connect(user1).mint(user1.address, 1, {
        value: ethers.parseEther("0.0001"),
      });
      expect(await nftMinter.connect(user1).totalSupply()).to.equal(1);
      expect(await nftMinter.connect(user1).balanceOf(user1.address)).to.equal(
        1
      );

      await nftMinter.connect(owner).setBaseURI("<nft_metadata_folder_cid>");
      expect(await nftMinter.connect(user1).tokenURI(1)).to.be.equal(
        "ipfs://<nft_metadata_folder_cid>/1.json"
      );
    });
  });

  describe("onlyOwner modifier", function () {
    it("functions with onlyOwner modifier should revert if it's not called by the owner", async function () {
      const errorMessage = "Ownable: caller is not the owner";
      await expect(
        nftMinter.connect(user1).setmaxMintAmount(10)
      ).to.be.revertedWith(errorMessage);
      await expect(nftMinter.connect(user1).setBaseURI("")).to.be.revertedWith(
        errorMessage
      );
      await expect(
        nftMinter.connect(user1).setBaseExtension("")
      ).to.be.revertedWith(errorMessage);
      await expect(nftMinter.connect(user1).pause(true)).to.be.revertedWith(
        errorMessage
      );
      await expect(nftMinter.connect(user1).withdraw()).to.be.revertedWith(
        errorMessage
      );
    });
  });

  describe("setmaxMintAmount", function () {
    itParam(
      "should revert when maxMintAmount is invalid: maxMintAmount = ${value}",
      [0, 1001],
      async function (value) {
        await expect(
          nftMinter.connect(owner).setmaxMintAmount(value)
        ).to.be.revertedWith("Invalid maxMintAmount");
      }
    );

    it("should set the correct maxMintAmount", async function () {
      await nftMinter.connect(owner).setmaxMintAmount(20);
      expect(await nftMinter.connect(owner).maxMintAmount()).to.be.equal(20);
    });
  });

  describe("setBaseURI", function () {
    it("should set the correct baseURI", async function () {
      await nftMinter.connect(owner).setBaseURI("<nft_metadata_folder_cid>");
      expect(await nftMinter.connect(owner).baseURI()).to.be.equal(
        "ipfs://<nft_metadata_folder_cid>/"
      );
    });
  });

  describe("setBaseExtension", function () {
    it("should set the correct baseExtension", async function () {
      await nftMinter.connect(owner).setBaseExtension(".yml");
      expect(await nftMinter.connect(owner).baseExtension()).to.be.equal(
        ".yml"
      );
    });
  });

  describe("pause", function () {
    it("should pause and unpause the minting process", async function () {
      expect(await nftMinter.connect(owner).paused()).to.be.equal(false);

      await nftMinter.connect(owner).pause(true);
      expect(await nftMinter.connect(owner).paused()).to.be.equal(true);

      await nftMinter.connect(owner).pause(false);
      expect(await nftMinter.connect(owner).paused()).to.be.equal(false);
    });
  });

  describe("withdraw", function () {
    it("should withdraw contract balance to contract owner address", async function () {
      let contractBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceBefore).to.equal(0);

      let newMaxMintAmount = 250;
      await nftMinter.connect(owner).setmaxMintAmount(newMaxMintAmount);
      expect(await nftMinter.connect(owner).maxMintAmount()).to.equal(
        newMaxMintAmount
      );

      let ownerBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );

      let mintAmount = 250;
      let mintCost = 0.0001;
      for (let i = 0; i < 2; i++) {
        await nftMinter.connect(user1).mint(user1.address, mintAmount, {
          value: ethers.parseEther((mintAmount * mintCost).toString()),
        });
      }

      contractBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceBefore).to.equal(
        parseFloat(2 * mintAmount * mintCost)
      );

      tx = await nftMinter.connect(owner).withdraw();
      txReceipt = await tx.wait();

      txCost = parseFloat(
        ethers.formatEther(txReceipt.gasUsed * txReceipt.gasPrice)
      );

      contractBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceAfter).to.equal(0);

      ownerBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );
      expect(ownerBalanceAfter).to.equal(
        parseFloat(ownerBalanceBefore - txCost + contractBalanceBefore)
      );
    });

    it("multiple withdraw() function calls should maintain the consistency in the contract state and owner account", async function () {
      let contractBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceBefore).to.equal(0);

      let ownerBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );

      let tx = await nftMinter.connect(owner).withdraw();
      let txReceipt = await tx.wait();

      let txCost = parseFloat(
        ethers.formatEther(txReceipt.gasUsed * txReceipt.gasPrice)
      );

      let contractBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceAfter).to.equal(0);

      let ownerBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );
      expect(ownerBalanceAfter).to.equal(
        parseFloat(ownerBalanceBefore - txCost + contractBalanceBefore)
      );

      let newMaxMintAmount = 250;
      await nftMinter.connect(owner).setmaxMintAmount(newMaxMintAmount);
      expect(await nftMinter.connect(owner).maxMintAmount()).to.equal(
        newMaxMintAmount
      );

      ownerBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );

      let mintAmount = 250;
      let mintCost = 0.0001;
      for (let i = 0; i < 2; i++) {
        await nftMinter.connect(user1).mint(user1.address, mintAmount, {
          value: ethers.parseEther((mintAmount * mintCost).toString()),
        });
      }

      contractBalanceBefore = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceBefore).to.equal(
        parseFloat(2 * mintAmount * mintCost)
      );

      // multiple withdraw() function calls should maintain the consistency in the contract state and owner account.
      let totalTxCost = 0;
      for (let i = 0; i < 3; i++) {
        tx = await nftMinter.connect(owner).withdraw();
        txReceipt = await tx.wait();

        txCost = parseFloat(
          ethers.formatEther(txReceipt.gasUsed * txReceipt.gasPrice)
        );

        totalTxCost += txCost;
      }

      contractBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(nftMinter.target))
      );
      expect(contractBalanceAfter).to.equal(0);

      ownerBalanceAfter = parseFloat(
        ethers.formatEther(await ethers.provider.getBalance(owner.address))
      );
      expect(ownerBalanceAfter).to.equal(
        parseFloat(ownerBalanceBefore - totalTxCost + contractBalanceBefore)
      );
    });
  });
});
