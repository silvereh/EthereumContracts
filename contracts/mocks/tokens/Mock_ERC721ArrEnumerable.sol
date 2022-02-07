// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721ArrEnumerable.sol';

contract Mock_ERC721ArrEnumerable is ERC721ArrEnumerable {
	constructor() {}

	function mint() public {
		_mint( msg.sender );
	}
}
