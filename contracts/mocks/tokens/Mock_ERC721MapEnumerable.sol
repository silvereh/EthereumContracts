// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721MapEnumerable.sol';

contract Mock_ERC721MapEnumerable is ERC721MapEnumerable {
	constructor() {}

	function mint() public {
		_mint( msg.sender );
	}
}
