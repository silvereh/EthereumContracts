// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721BaseEnumerable.sol';

contract MockERC721BaseEnumerable is ERC721BaseEnumerable {
	constructor() {}

	function supplyMinted() public view returns ( uint256 ) {
		return _supplyMinted();
	}

	function mint( address to_ ) public {
		_safeMint( to_ );
	}
}
