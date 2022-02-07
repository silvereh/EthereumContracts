// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721ArrMetadata.sol';

contract Mock_ERC721ArrMetadata is ERC721ArrMetadata {
	constructor( string memory name_, string memory symbol_ ) {
		_initERC721ArrMetadata( name_, symbol_ );
	}

	function mint() public {
		_mint( msg.sender );
	}

	function setBaseURI( string memory baseURI_ ) public {
		_setBaseURI( baseURI_ );
	}
}
