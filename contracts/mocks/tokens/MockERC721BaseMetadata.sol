// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721BaseMetadata.sol';

contract MockERC721BaseMetadata is ERC721BaseMetadata {
	constructor( string memory name_, string memory symbol_ ) ERC721BaseMetadata( name_, symbol_ ) {}

	function setBaseURI( string memory baseURI_ ) public {
		_setBaseURI( baseURI_ );
	}

	function supplyMinted() public view returns ( uint256 ) {
		return _supplyMinted();
	}

	function mint( address to_ ) public {
		_safeMint( to_ );
	}
}
