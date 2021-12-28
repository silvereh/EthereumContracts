// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../../interfaces/IERC721Enumerable.sol';
import '../ERC721Base.sol';

/**
* @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
* the Metadata extension and the Enumerable extension.
* 
* Note: This implementation is only compatible with a sequential order of tokens minted.
* If you need to mint tokens in a random order, you will need to override the following functions:
* Note also that this implementations is fairly inefficient and as such, 
* those functions should be avoided inside non-view functions.
*/
abstract contract ERC721BaseEnumerable is ERC721Base, IERC721Enumerable {
	// Errors
	error IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS();
	error IERC721Enumerable_NULL_ADDRESS_BALANCE();
	error IERC721Enumerable_NONEXISTANT_TOKEN();

	/**
	* @dev See {IERC721Enumerable-totalSupply}.
	*/
	function totalSupply() public view virtual override returns ( uint256 ) {
		return _totalSupply();
	}

	/**
	* @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
	*/
	function tokenOfOwnerByIndex(address tokenOwner_, uint256 index_) public view virtual override returns ( uint256 tokenId ) {
		if ( tokenOwner_ == address( 0 ) ) {
			revert IERC721Enumerable_NULL_ADDRESS_BALANCE();
		}
		if ( ! _exists( index_ ) ) {
			revert IERC721Enumerable_NONEXISTANT_TOKEN();
		}
		uint256 _supplyMinted_ = _supplyMinted();
		uint256 _count_ = 0;
		for ( uint256 i = 0; i < _supplyMinted_; i++ ) {
			if ( _exists( i ) && tokenOwner_ == ownerOf( i ) ) {
				if ( index_ == _count_ ) {
					return i;
				}
				_count_++;
			}
		}
		revert IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS();
	}

	/**
	* @dev See {IERC721Enumerable-tokenByIndex}.
	*/
	function tokenByIndex( uint256 index_ ) public view virtual override returns ( uint256 ) {
		if ( ! _exists( index_ ) ) {
			revert IERC721Enumerable_NONEXISTANT_TOKEN();
		}
		return index_;
	}

	/**
	* @dev See {IERC165-supportsInterface}.
	*/
	function supportsInterface( bytes4 interfaceId_ ) public view virtual override(IERC165, ERC721Base) returns ( bool ) {
		return 
			interfaceId_ == type( IERC721Enumerable ).interfaceId ||
			interfaceId_ == type( IERC721 ).interfaceId ||
			interfaceId_ == type( IERC165 ).interfaceId;
	}

	/**
	* @dev The current total supply of existing tokens.
	*/
	function _totalSupply() internal view virtual returns ( uint256 ) {
		uint256 _supplyMinted_ = _supplyMinted();
		uint256 _count_ = 0;
		for ( uint256 i = 0; i <= _supplyMinted_; i++ ) {
			if ( _exists( i ) ) {
				_count_++;
			}
		}
		return _count_;
	}
}
