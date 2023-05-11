# Solidity Channel Exercise

This time, you will need to code a factory of payment channels that use the EIP 712.
The specification of EIP 712 is up to you, but keep in mind that any user should be
able to create signatures for any given channel without worrying about it being replayable
in the same contract or in another.Note that as we will be creating a lot of payment channels,
and they are going to be used with a few transactions to be later discarded, you should use
minimal proxies to create them. Bonus points for using ERC 1155 tokens in the payment channels.
Note: This contracts do NOT have to be upgradeable, change the library that you think it has
to be changed.

```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

# todo

- [ ] check https://github.com/dapphub/dapptools
