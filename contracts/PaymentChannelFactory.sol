// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./PaymentChannel.sol";

contract PaymentChannelFactory {
    address public implementation;

    event PaymentChannelCreated(address paymentChannel);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    /**
     * @dev Function to create a new payment channel.
     * @param _sender Sender of the payment
     * @param _receiver Receiver of the payment
     * @param _expiration Expiration of the payment
     * @param _token ERC1155 token address
     * @param _id ERC1155 token id
     * @return paymentChannel Address of the new payment channel
     */
    function createPaymentChannel(
        address payable _sender,
        address _receiver,
        uint256 _expiration,
        ERC1155 _token,
        uint256 _id
    ) external returns (address paymentChannel) {
        paymentChannel = Clones.clone(implementation);
        PaymentChannel(paymentChannel).initialize(_sender, _receiver, _expiration, _token, _id);
        emit PaymentChannelCreated(paymentChannel);
    }
}
