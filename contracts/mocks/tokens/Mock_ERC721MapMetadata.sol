// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC721/extensions/ERC721MapMetadata.sol';

contract Mock_ERC721MapMetadata is ERC721MapMetadata {
	constructor( string memory name_, string memory symbol_ ) {
		_initERC721MapMetadata( name_, symbol_ );
	}

	function mint() public {
		_mint( msg.sender );
	}

	function setBaseURI( string memory baseURI_ ) public {
		_setBaseURI( baseURI_ );
	}
}
