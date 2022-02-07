// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../../interfaces/IERC721Metadata.sol';
import '../ERC721Map.sol';

abstract contract ERC721MapMetadata is ERC721Map, IERC721Metadata {
	// Token name
	string private _name;

	// Token symbol
	string private _symbol;

	// Token Base URI
	string private _baseURI;

	/**
	* @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
	*/
	function _initERC721MapMetadata( string memory name_, string memory symbol_ ) internal {
		_name   = name_;
		_symbol = symbol_;
	}

	/**
	* @dev See {IERC721Metadata-name}.
	*/
	function name() public view virtual override returns ( string memory ) {
		return _name;
	}

	/**
	* @dev See {IERC721Metadata-symbol}.
	*/
	function symbol() public view virtual override returns ( string memory ) {
		return _symbol;
	}

	/**
	* @dev See {IERC721Metadata-tokenURI}.
	*/
	function tokenURI( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( string memory ) {
		return bytes( _baseURI ).length > 0 ? string( abi.encodePacked( _baseURI, _toString( tokenId_ ) ) ) : _toString( tokenId_ );
	}

	/**
	* @dev See {IERC165-supportsInterface}.
	*/
	function supportsInterface( bytes4 interfaceId_ ) public view virtual override(IERC165, ERC721Map) returns ( bool ) {
		return 
			interfaceId_ == type( IERC721Metadata ).interfaceId ||
			super.supportsInterface( interfaceId_ );
	}

	function _setBaseURI( string memory baseURI_ ) internal virtual {
		_baseURI = baseURI_;
	}

	/**
	* @dev Converts a `uint256` to its ASCII `string` decimal representation.
	*/
	function _toString( uint256 value ) internal pure returns ( string memory ) {
		// Inspired by OraclizeAPI's implementation - MIT licence
		// https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

		if ( value == 0 ) {
			return "0";
		}
		uint256 temp = value;
		uint256 digits;
		while ( temp != 0 ) {
			digits ++;
			temp /= 10;
		}
		bytes memory buffer = new bytes( digits );
		while ( value != 0 ) {
			digits -= 1;
			buffer[ digits ] = bytes1( uint8( 48 + uint256( value % 10 ) ) );
			value /= 10;
		}
		return string( buffer );
	}
}
