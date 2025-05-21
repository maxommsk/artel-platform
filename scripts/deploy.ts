import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("ZNKToken");
  const token = await Token.deploy(1_000_000);
  await token.waitForDeployment();

  console.log("✅ Контракт токена развернут по адресу:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
