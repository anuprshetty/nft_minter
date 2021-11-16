// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

class Utils {
  static dapp_contracts_info_folder_path;
  static contracts_setup_outputs = {};

  static {
    Utils.dapp_contracts_info_folder_path = Utils.setup_dapp_contracts_info();
  }

  static async display_hardhat_network_info() {
    let provider = hre.ethers.provider;

    const hardhat_network_info = {
      name: provider._networkName,
      url:
        "url" in hre.config.networks[provider._networkName]
          ? hre.config.networks[provider._networkName].url
          : "",
      chainId: parseInt((await provider.getNetwork()).chainId),
    };

    console.log("\n---------------- Hardhat Network Info ----------------");
    console.log(`${JSON.stringify(hardhat_network_info, null, 2)}`);
    console.log("------------------------------------------------------\n");
  }

  static setup_dapp_contracts_info() {
    const folder_path = path.join(__dirname, "..", "dapp_contracts_info/");

    if (fs.existsSync(folder_path)) {
      fs.rmSync(folder_path, { recursive: true });
    }
    fs.mkdirSync(folder_path);

    return folder_path;
  }

  static async generate_dapp_contract_info(contractName, contractInstances) {
    const artifact = await hre.artifacts.readArtifact(contractName);

    const dapp_contract_info = {
      contractName: artifact.contractName,
      sourceName: artifact.sourceName,
      contractInstances: contractInstances,
      abi: artifact.abi,
    };

    fs.writeFileSync(
      path.join(
        Utils.dapp_contracts_info_folder_path,
        `${dapp_contract_info.contractName}.json`
      ),
      JSON.stringify(dapp_contract_info, null, 2)
    );
  }
}

class BaseContract {
  constructor(contract_name, contract_instance_name) {
    this.contract_name = contract_name;
    this.contract_instance_name = contract_instance_name;
    this.contract_address = "";
    this.contract = null;
    this.contract_constructor_args = [];

    if (!(this.contract_name in Utils.contracts_setup_outputs)) {
      Utils.contracts_setup_outputs[this.contract_name] = {};
    }
    Utils.contracts_setup_outputs[this.contract_name][
      this.contract_instance_name
    ] = {};
  }

  async deployContract() {
    const maxRetries = 6;
    const retryDelaySeconds = 10;

    let retries = 0;

    while (retries < maxRetries) {
      try {
        const Contract = await hre.ethers.getContractFactory(
          this.contract_name
        );
        this.contract = await Contract.deploy(
          ...this.contract_constructor_args
        );
        await this.contract.waitForDeployment();
        break;
      } catch (error) {
        if ("code" in error && error.code === "UND_ERR_HEADERS_TIMEOUT") {
          console.error(
            `Error UND_ERR_HEADERS_TIMEOUT (${this.contract_name} contract). Retrying in ${retryDelaySeconds} seconds ...`
          );

          retries++;

          await new Promise((resolve) =>
            setTimeout(resolve, retryDelaySeconds * 1000)
          );
        } else {
          throw error;
        }
      }
    }

    if (retries === maxRetries) {
      console.error(
        `Error UND_ERR_HEADERS_TIMEOUT (${this.contract_name} contract). Failed to deploy after ${maxRetries} retries.`
      );
      process.exitCode = 1;
    }

    this.contract_address = this.contract.target;

    hre.ethernalUploadAst = true;
    await hre.ethernal.push({
      name: this.contract_name,
      address: this.contract_address,
    });

    Utils.contracts_setup_outputs[this.contract_name][
      this.contract_instance_name
    ]["address"] = this.contract_address;
  }

  async attachContract() {
    const Contract = await hre.ethers.getContractFactory(this.contract_name);

    this.contract = Contract.attach(this.contract_address);

    Utils.contracts_setup_outputs[this.contract_name][
      this.contract_instance_name
    ]["address"] = this.contract_address;
  }
}

class NFTMinter extends BaseContract {
  constructor(contract_instance_name, output_nft_info) {
    super("NFTMinter", contract_instance_name);

    this.output_nft_info = output_nft_info;
    this.contract_constructor_args = [
      output_nft_info.nft_collection_name,
      output_nft_info.symbol,
    ];
  }

  async setBaseURI(NFTMetadataFolderCID) {
    await (await this.contract.setBaseURI(NFTMetadataFolderCID)).wait();

    if ((await this.contract.baseURI()) !== `ipfs://${NFTMetadataFolderCID}/`) {
      throw new Error(
        `Error in ${this.setBaseURI.name}() method while setting up ${this.contract_name} contract - ${this.contract_instance_name} contract_instance`
      );
    }
  }
}

class BaseDeploy {
  constructor() {
    this.nft_collections = [];
  }

  async deploy() {
    const output_nfts_info = await this.get_output_nfts_info();

    this.nft_collections = [];
    for (let output_nft_info in output_nfts_info) {
      output_nft_info = output_nfts_info[output_nft_info];

      const nft_collection = new NFTMinter(
        output_nft_info.nft_collection_id,
        output_nft_info
      );
      this.nft_collections.push(nft_collection);
    }

    for (const nft_collection of this.nft_collections) {
      await nft_collection.deployContract();
    }

    const dapp_contracts_info = [
      {
        contractName: this.nft_collections[0].contract_name,
        contractInstances: this.nft_collections.map((nft_collection) => ({
          name: nft_collection.contract_instance_name,
          address: nft_collection.contract_address,
        })),
      },
    ];

    for (const dapp_contract_info of dapp_contracts_info) {
      await Utils.generate_dapp_contract_info(
        dapp_contract_info.contractName,
        dapp_contract_info.contractInstances
      );
    }
  }

  async setBaseURI() {
    for (const nft_collection of this.nft_collections) {
      await nft_collection.setBaseURI(
        nft_collection.output_nft_info.nft_metadata_folder_cid
      );
    }
  }
}

class DeploySetup extends BaseDeploy {
  async deploySetup() {
    await this.deploy();
    await this.setup();
  }

  async get_output_nfts_info() {
    return JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../..", "nft/outputs/output_nfts_info.json"),
        "utf8"
      )
    );
  }

  async setup() {
    await this.setBaseURI();
  }
}

class DeployE2E extends BaseDeploy {
  async deployE2E() {
    await this.deploy();
  }

  async get_output_nfts_info() {
    const output_nfts_info = {
      tom_and_jerry: {
        nft_collection_id: "tom_and_jerry",
        nft_collection_name: "NFT Collection TomAndJerry",
        name: "Tom and Jerry",
        symbol: "COL-TNJ",
        image_name: "tom_and_jerry.png",
        num_copies: 0,
        ipfs_node_rpc_api: "/ip4/127.0.0.1/tcp/5001",
        nft_image_folder_cid: "",
        nft_metadata_folder_cid: "",
      },
    };

    return output_nfts_info;
  }
}

class SetupE2E extends BaseDeploy {
  async setupE2E() {
    await this.setup();
  }

  async setup() {
    await this.setupPrerequisites();
    await this.setBaseURI();
  }

  async setupPrerequisites() {
    const all_contracts_setup_inputs = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "contracts_setup_inputs.json"),
        "utf8"
      )
    );

    for (let contracts_setup_inputs in all_contracts_setup_inputs) {
      contracts_setup_inputs =
        all_contracts_setup_inputs[contracts_setup_inputs];
      for (let contract_setup_inputs in contracts_setup_inputs) {
        contract_setup_inputs = contracts_setup_inputs[contract_setup_inputs];
        if (!contract_setup_inputs.address) {
          throw new Error(`contracts_setup_inputs.json file is invalid.`);
        }
      }
    }

    
  }
}




