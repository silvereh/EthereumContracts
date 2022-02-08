// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../interfaces/IERC2981.sol";
import "../interfaces/IERC165.sol";

abstract contract ERC2981Base is IERC165, IERC2981 {
	// Errors
	error IERC2981_INVALID_ROYALTIES();

	// Royalty rate is stored out of 10,000 instead of a percentage to allow for
	// up to two digits below the unit such as 2.5% or 1.25%.
	uint256 private constant ROYALTY_BASE = 10000;

	// Represents the percentage of royalties on each sale on secondary markets.
	// Set to 0 to have no royalties.
	uint256 private _royaltyRate;

	// Address of the recipient of the royalties.
	address private _recipient;

	function _initERC2981Base( address recipient_, uint256 royaltyRate_ ) internal {
		_setRoyaltyInfo( recipient_, royaltyRate_ );
	}

	/**
	* @dev See {IERC2981-royaltyInfo}.
	* 
	* Note: This function should be overriden to revert on a query for non existent token.
	*/
	function royaltyInfo( uint256 tokenId_, uint256 salePrice_ ) external view virtual override returns ( address, uint256 ) {
		if ( salePrice_ == 0 || _royaltyRate == 0 ) {
			return ( _recipient, 0 );
		}
		uint256 _royaltyAmount_ = _royaltyRate * salePrice_ / ROYALTY_BASE;
		return ( _recipient, _royaltyAmount_ );
	}

	/**
	* @dev Sets the royalty rate to `royaltyRate_`.
	* 
	* Requirements: 
	* 
	* - `royaltyRate_` cannot be higher than `ROYALTY_BASE`;
	*/
	function _setRoyaltyInfo( address recipient_, uint256 royaltyRate_ ) internal virtual {
		if ( royaltyRate_ > ROYALTY_BASE ) {
			revert IERC2981_INVALID_ROYALTIES();
		}
		_royaltyRate = royaltyRate_;
		_recipient = recipient_;
	}

	/**
	* @dev See {IERC165-supportsInterface}.
	*/
	function supportsInterface( bytes4 interfaceId_ ) public view virtual override returns ( bool ) {
		return 
			interfaceId_ == type( IERC2981 ).interfaceId ||
			interfaceId_ == type( IERC165 ).interfaceId;
	}
}
