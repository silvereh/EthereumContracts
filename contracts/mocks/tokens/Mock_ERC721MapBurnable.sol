// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721MapBurnable.sol';

contract Mock_ERC721MapBurnable is ERC721MapBurnable {
	constructor() {}

	function mint() public {
		_mint( msg.sender );
	}
}
