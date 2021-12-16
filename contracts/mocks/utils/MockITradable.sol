// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../utils/ITradable.sol";

contract MockITradable is ITradable {
	constructor( address proxyRegistryAddress_ ) ITradable( proxyRegistryAddress_ ) {}

	function isRegisteredProxy( address tokenOwner_, address operator_ ) public view returns ( bool ) {
		return _isRegisteredProxy( tokenOwner_, operator_ );
	}
}