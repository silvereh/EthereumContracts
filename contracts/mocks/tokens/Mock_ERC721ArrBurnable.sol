// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721ArrBurnable.sol';

contract Mock_ERC721ArrBurnable is ERC721ArrBurnable {
	constructor() {}

	function mint() public {
		_mint( msg.sender );
	}
}
