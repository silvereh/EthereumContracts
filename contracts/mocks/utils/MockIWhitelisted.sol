// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../utils/IWhitelisted.sol";

contract MockIWhitelisted is IWhitelisted {
	constructor() {}

	function setWhitelist( bytes32 root_, uint256 passMax_ ) public {
		_setWhitelist( root_, passMax_ );
	}

	function checkWhitelistAllowance( address account_, bytes32 proof_, bool flag_ ) public view returns ( uint256 ) {
		return _checkWhitelistAllowance( account_, proof_, flag_ );
	}

	function consumeWhitelist( address account_, bytes32 proof_, bool flag_, uint256 qty_ ) public {
		_consumeWhitelist( account_, proof_, flag_, qty_ );
	}
}
