// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract PaymentChannel is EIP712, ERC1155Receiver {
    bool public initialized;
    address payable public sender;
    address public receiver;
    uint256 public amount;
    uint256 public expiration;
    ERC1155 public token;
    uint256 public id;

    event PaymentClosed(uint256 amount);
    event PaymentCanceled();

    constructor() EIP712("PaymentChannel", "1.0.0") {}

    /**
     * @dev Function initialize the payment channel using proxy Clones.
     * @param _sender Sender of the payment
     * @param _receiver Receiver of the payment
     * @param _amount Amount of the payment
     * @param _expiration Expiration of the payment
     * @param _token ERC1155 token address
     * @param _id ERC1155 token id
     */
    function initialize(
        address _sender,
        address _receiver,
        uint256 _amount,
        uint256 _expiration,
        ERC1155 _token,
        uint256 _id
    ) external {
        require(!initialized, "PaymentChannel: already initialized");
        initialized = true;
        sender = _sender;
        receiver = _receiver;
        amount = _amount;
        expiration = _expiration;
        token = _token;
        id = _id;
    }

    /**
     * @dev Function to receive the payment.
     * @param _amount Amount of the payment
     * @param _signature Payment signature
     */
    function close(uint256 _amount, bytes memory _signature) external {
        require(msg.sender == receiver, "PaymentChannel: only receiver can close");
        require(_verify(_amount, _signature), "PaymentChannel: invalid signature");
        token.safeTransferFrom(address(this), receiver, id, _amount, "0x");
        // transfer the remaining balance to the sender
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(this, id), "0x");
        emit PaymentClosed(_amount);
        selfdestruct(sender);
    }

    /**
     * @dev Function to cancel the payment.
     */
    function cancel() external {
        require(msg.sender == sender, "PaymentChannel: only sender can cancel");
        // check if the payment is expired
        require(block.timestamp >= expiration, "PaymentChannel: payment is not expired");
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(this, id), "0x");
        emit PaymentCanceled();
        selfdestruct(sender);
    }

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

    /**
     * @dev Function to verify the signature
     */
    function _verify(uint256 amount, bytes memory signature) private returns (bools) {
        bytes32 digest = EIP712._hashTypedDataV4(keccak256(abi.encode(keccak256("Payment(uint256 amount)"), amount)));
        address signer = ECDSA.recover(digest, signature);
        return signer == sender;
    }
}
