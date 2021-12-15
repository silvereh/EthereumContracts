// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../utils/ERC2981Base.sol";

contract MockERC2981Base is ERC2981Base {
	constructor( address recipient_, uint256 rate_ ) ERC2981Base( recipient_, rate_ ) {}

	function setRoyaltyInfo( address recipient_, uint256 rate_ ) public {
		_setRoyaltyInfo( recipient_, rate_ );
	}
}
