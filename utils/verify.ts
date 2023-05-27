import { run } from "hardhat";

export const verify = async (
  contractAddress: string,
  args: (string | undefined | string[])[]
) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.toLowerCase().includes("already verified")
    ) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};
