// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  await hre.run("compile");

  const contracts_deploy_info = [
    {
      name: "NFTMinter",
      setupContract: setupContractNFTMinter,
    },
  ];

  setup_e2e_input_file_path = path.join(
    __dirname,
    "..",
    "setup_e2e_input.json"
  );
  const setup_e2e_input = JSON.parse(
    fs.readFileSync(setup_e2e_input_file_path, "utf8")
  );

  console.log("-----------------------------------------------------");
  console.log("------------- Contracts Deployment Info -------------");
  console.log("-----------------------------------------------------");

  // var dapp_contracts_info = [];
  for (const contract_deploy_info of contracts_deploy_info) {
    const contract_name = contract_deploy_info.name;
    contract_deploy_info.setupE2EInput = setup_e2e_input[contract_name];
    const deployed_contract_info = await deployContract(contract_deploy_info);

    deployed_contract_info.setupE2EInput = setup_e2e_input[contract_name];

    // const deployed_contract_artifact = await hre.artifacts.readArtifact(
    //   deployed_contract_info.name
    // );

    // var dapp_contract_info = {
    //   contractName: deployed_contract_artifact.contractName,
    //   sourceName: deployed_contract_artifact.sourceName,
    //   contractAddress: deployed_contract_info.address,
    //   abi: deployed_contract_artifact.abi,
    // };

    // dapp_contracts_info.push(dapp_contract_info);

    console.log(`${JSON.stringify(deployed_contract_info, null, 2)}`);
    console.log("-----------------------------------------------------");
  }

  // const dapp_contracts_info_folder_path = path.join(
  //   __dirname,
  //   "..",
  //   "dapp_contracts_info/"
  // );

  // if (!fs.existsSync(dapp_contracts_info_folder_path)) {
  //   fs.mkdirSync(dapp_contracts_info_folder_path);
  // }
  // for (const dapp_contract_info of dapp_contracts_info) {
  //   const dapp_contract_info_file_path = path.join(
  //     dapp_contracts_info_folder_path,
  //     `${dapp_contract_info.contractName}.json`
  //   );

  //   fs.writeFileSync(
  //     dapp_contract_info_file_path,
  //     JSON.stringify(dapp_contract_info, null, 2)
  //   );
  // }

  console.log("\nSUCCESS: contracts deployment ... DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((err) => {
  console.log(
    "\n--------------------------- ERROR --------------------------\n"
  );
  console.error(err);
  console.log(
    "\n------------------------------------------------------------\n"
  );
  console.log(
    "ERROR OCCURRED: Make sure you have properly updated setup_e2e_input.json file."
  );
  process.exitCode = 1;
});

async function deployContract(contract_deploy_info) {
  var deployed_contract_info = { name: contract_deploy_info.name };
  deployed_contract_info.setupE2EInput = contract_deploy_info.setupE2EInput;

  const Contract = await hre.ethers.getContractFactory(
    contract_deploy_info.name
  );

  const contract = Contract.attach(
    deployed_contract_info.setupE2EInput.address
  );
  // const contract = await Contract.deploy();
  // await contract.waitForDeployment();

  // hre.ethernalUploadAst = true;
  // await hre.ethernal.push({
  //   name: contract_deploy_info.name,
  //   address: contract.target,
  // });

  // deployed_contract_info.address = contract.target;
  deployed_contract_info.address = deployed_contract_info.setupE2EInput.address;

  await contract_deploy_info.setupContract(contract, deployed_contract_info);

  return deployed_contract_info;
}

async function setupContractNFTMinter(contract, deployed_contract_info) {
  // output_nft_info_file_path = path.join(
  //   __dirname,
  //   "../..",
  //   "nft/outputs/output_nft_info.json"
  // );
  // const output_nft_info = JSON.parse(
  //   fs.readFileSync(output_nft_info_file_path, "utf8")
  // );
  const output_nft_info = {
    nft_metadata_folder_cid:
      deployed_contract_info.setupE2EInput.nft_metadata_folder_cid,
  };

  await (
    await contract.setBaseURI(output_nft_info.nft_metadata_folder_cid)
  ).wait();

  if (
    (await contract.baseURI()) !==
    `ipfs://${output_nft_info.nft_metadata_folder_cid}/`
  ) {
    throw new Error(`Error at setupContract${deployed_contract_info.name}`);
  }

  deployed_contract_info.setBaseURI = output_nft_info.nft_metadata_folder_cid;
}
