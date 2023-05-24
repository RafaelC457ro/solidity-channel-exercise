// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract PaymentChannel is EIP712, ERC1155Receiver {
    bool public initialized;
    address public sender;
    address public receiver;
    uint256 public amount;
    uint256 public expiration;
    ERC1155 public token;
    uint256 public id;

    event PaymentClosed(uint256 amount);
    event PaymentCanceled();

    constructor() EIP712("PaymentChannel", "1.0.0") {}

    function initialize(
        address _sender,
        address _receiver,
        uint256 _amount,
        uint256 _expiration,
        ERC1155 _token,
        uint256 _id
    ) external {}

    /**
     * @dev Function to be called when a safe transfer is received.
     */
    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    /**
     * @dev Function to be called when a safe batch transfer is received.
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }
}
