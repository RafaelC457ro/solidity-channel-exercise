import { BaseContract } from "ethers";

export function afterEvent(
  contract: BaseContract,
  event: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      contract.once(event, () => {
        resolve();
      });
    } catch (error) {
      reject();
    }
  });
}
