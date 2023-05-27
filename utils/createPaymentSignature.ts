import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export async function createPaymentSignature(
  signer: SignerWithAddress,
  paymentChannelAddress: string,
  amount: number
) {
  const domain = {
    name: "PaymentChannel",
    version: "1.0.0",
    chainId: 31337,
    verifyingContract: paymentChannelAddress,
  } as const;

  const types = {
    Payment: [{ name: "amount", type: "uint256" }],
  };

  const value = {
    amount,
  } as const;

  // deployer signature
  const signature = await signer._signTypedData(domain, types, value);
  return signature;
}
