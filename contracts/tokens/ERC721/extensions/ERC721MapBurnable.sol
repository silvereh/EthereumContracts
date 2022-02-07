// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../ERC721Map.sol";

abstract contract ERC721MapBurnable is ERC721Map {
	/**
	* @dev Burns `tokenId_`.
	*
	* Requirements:
	*
	* - `tokenId_` must exist
	* - The caller must own `tokenId_` or be an approved operator
	*/
	function burn( uint256 tokenId_ ) public virtual {
		address _tokenOwner_ = ownerOf( tokenId_ );

		if ( ! _isApprovedOrOwner( msg.sender, tokenId_ ) ) {
			revert IERC721_CALLER_NOT_APPROVED();
		}

		_transfer( _tokenOwner_, address( 0 ), tokenId_ );
	}
}
