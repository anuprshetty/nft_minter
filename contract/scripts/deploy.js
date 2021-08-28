// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const DEPLOY_MODES = ["DeploySetup", "DeployE2E", "SetupE2E"];
const DEPLOY_MODE = process.env.DEPLOY_MODE;
if (!DEPLOY_MODE || !DEPLOY_MODES.includes(DEPLOY_MODE)) {
  throw new Error("Invalid DEPLOY_MODE");
}

class BaseContract {
  async deployContract() {
    const maxRetries = 6;
    const retryDelaySeconds = 10;

    let retries = 0;

    while (retries < maxRetries) {
      try {
        const Contract = await hre.ethers.getContractFactory(this.name);
        this.contract = await Contract.deploy();
        await this.contract.waitForDeployment();
        break;
      } catch (error) {
        if ("code" in error && error.code === "UND_ERR_HEADERS_TIMEOUT") {
          console.error(
            `Error UND_ERR_HEADERS_TIMEOUT (${this.name} contract). Retrying in ${retryDelaySeconds} seconds ...`
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
        `Error UND_ERR_HEADERS_TIMEOUT (${this.name} contract). Failed to deploy after ${maxRetries} retries.`
      );
      process.exitCode = 1;
    }

    hre.ethernalUploadAst = true;
    await hre.ethernal.push({
      name: this.name,
      address: this.contract.target,
    });

    this.setup_output.name = this.name;
    this.setup_output.address = this.contract.target;
  }

  async generate_dapp_contract_info() {
    this.artifact = await hre.artifacts.readArtifact(this.name);

    const dapp_contract_info = {
      contractName: this.artifact.contractName,
      sourceName: this.artifact.sourceName,
      contractAddress: this.contract.target,
      abi: this.artifact.abi,
    };

    const file_path = path.join(
      dapp_contracts_info_folder_path,
      `${dapp_contract_info.contractName}.json`
    );

    fs.writeFileSync(file_path, JSON.stringify(dapp_contract_info, null, 2));
  }
}

class NFTMinter extends BaseContract {
  constructor() {
    super();
    this.name = "NFTMinter";
  }

  async setupContractInitiate() {
    this.setup_input.address = this.contract.target;
    this.setup_input.nft_metadata_folder_cid =
      output_nft_info.nft_metadata_folder_cid;
  }

  async setupContract() {
    const Contract = await hre.ethers.getContractFactory(this.name);

    this.contract = Contract.attach(this.setup_input.address);

    await (
      await this.contract.setBaseURI(this.setup_input.nft_metadata_folder_cid)
    ).wait();

    this.setup_output.name = this.name;
    this.setup_output.address = this.contract.target;
    this.setup_output.setup_info = {};

    if (
      (await this.contract.baseURI()) !==
      `ipfs://${this.setup_input.nft_metadata_folder_cid}/`
    ) {
      throw new Error(`Error at setupContract (${this.name} contract)`);
    }
    this.setup_output.setup_info.setBaseURI = {
      nft_metadata_folder_cid: this.setup_input.nft_metadata_folder_cid,
    };
  }
}

const ContractClasses = [NFTMinter];

const contract_instances = [];
for (const ContractClass of ContractClasses) {
  contract_instances.push(new ContractClass());
}

function load_contracts_setup_inputs() {
  file_path = path.join(__dirname, "..", "contracts_setup_inputs.json");
  const contracts_setup_inputs = JSON.parse(fs.readFileSync(file_path, "utf8"));

  for (const contract_instance of contract_instances) {
    contract_instance.setup_input =
      contract_instance.name in contracts_setup_inputs
        ? contracts_setup_inputs[contract_instance.name]
        : {};

    contract_instance.setup_output = {};
  }
}
load_contracts_setup_inputs();

function load_output_nft_info() {
  file_path = path.join(__dirname, "../..", "nft/outputs/output_nft_info.json");
  return JSON.parse(fs.readFileSync(file_path, "utf8"));
}
let output_nft_info = undefined;
if (DEPLOY_MODE === "DeploySetup") {
  output_nft_info = load_output_nft_info();
}

function setup_dapp_contracts_info() {
  const folder_path = path.join(__dirname, "..", "dapp_contracts_info/");

  if (!fs.existsSync(folder_path)) {
    fs.mkdirSync(folder_path);
  }

  return folder_path;
}
const dapp_contracts_info_folder_path = setup_dapp_contracts_info();

async function display_hardhat_network_info() {
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

async function main() {
  await hre.run("compile");

  await display_hardhat_network_info();

  console.log("-----------------------------------------------------");
  console.log("------------- Contracts Deployment Info -------------");
  console.log("-----------------------------------------------------");

  for (const contract_instance of contract_instances) {
    if (DEPLOY_MODE === "DeploySetup") {
      await contract_instance.deployContract();
      await contract_instance.setupContractInitiate();
      await contract_instance.setupContract();
    } else if (DEPLOY_MODE === "DeployE2E") {
      await contract_instance.deployContract();
    } else if (DEPLOY_MODE === "SetupE2E") {
      await contract_instance.setupContract();
    } else {
      throw new Error("Invalid DEPLOY_MODE");
    }

    console.log(`${JSON.stringify(contract_instance.setup_output, null, 2)}`);
    console.log("-----------------------------------------------------");

    await contract_instance.generate_dapp_contract_info();
  }

  console.log("\nSUCCESS: contracts deployment ... DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.log(
    "\n--------------------------- ERROR --------------------------\n"
  );
  console.error(error);
  console.log(
    "\n------------------------------------------------------------\n"
  );
  console.log(
    "ERROR NOTE: Make sure you have properly updated contracts_setup_inputs.json file."
  );
  process.exitCode = 1;
});
