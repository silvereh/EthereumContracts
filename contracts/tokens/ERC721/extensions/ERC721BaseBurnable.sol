// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../ERC721Base.sol";

abstract contract ERC721BaseBurnable is ERC721Base {
	// Error
	error ERC721Burnable_CALLER_NOT_APPROVED();

	/**
	* @dev Burns `tokenId_`. See {ERC721Base._burn}.
	*
	* Requirements:
	*
	* - The caller must own `tokenId_` or be an approved operator.
	*/
	function burn( uint256 tokenId_ ) public virtual {
		_burnFrom( msg.sender, tokenId_ );
	}

	function burnFrom( address owner_, uint256 tokenId_ ) public virtual {
		if ( ! _isApprovedOrOwner( msg.sender, tokenId_ ) ) {
			revert ERC721Burnable_CALLER_NOT_APPROVED();
		}
		_burnFrom( owner_, tokenId_ );
	}

	function _burnFrom( address owner_, uint256 tokenId_ ) internal virtual {
		_transfer( owner_, address( 0 ), tokenId_ );
	}
}
