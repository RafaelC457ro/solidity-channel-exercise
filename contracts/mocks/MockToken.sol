// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockToken is ERC1155 {
    constructor() ERC1155("https://exemple.com/api/item/{id}.json") {}

    /**
        @notice allow anyone to mint, it is just for testing purposes
        @param to Receiver of the newly created tokens
        @param id Id of the tokens to be created
        @param amount Amount of tokens to be created
        @param data Metadata to mint the tokens
     */
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external {
        _mint(to, id, amount, data);
    }
}
