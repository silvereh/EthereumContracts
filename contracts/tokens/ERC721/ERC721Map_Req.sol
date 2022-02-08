// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../interfaces/IERC721.sol";
import "../../interfaces/IERC721Receiver.sol";

/**
* @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
* the Metadata extension and the Enumerable extension.
* 
* Note: This implementation is only compatible with a sequential order of tokens minted.
* If you need to mint tokens in a random order, you will need to override the following functions:
* ~ ownerOf() 
* ~ _exists()
* ~ _mint()
* ~ _burn()
* Note also that the implementations of the function balanceof() are extremely inefficient and as such, 
* those functions should be avoided inside non-view functions.
*/
abstract contract ERC721Map_Req is IERC165, IERC721 {
	// Token IDs
	uint256 private _tokenIds;

	// List of owner addresses
	mapping( uint256 => address ) private _owners;

	// Mapping from token ID to approved address
	mapping( uint256 => address ) private _tokenApprovals;

	// Mapping from owner to operator approvals
	mapping( address => mapping( address => bool ) ) private _operatorApprovals;

	/**
	* @dev Reverts if to_ is the null address.
	*/
	modifier isValidTransfer( address to_ ) {
		require ( to_ != address( 0 ), 'IERC721_NULL_ADDRESS_TRANSFER' );
		_;
	}

	/**
	* @dev Reverts if `tokenId_` doesn't exist.
	*
	* Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
	*
	* Tokens start existing when they are minted,
	* and stop existing when they are burned.
	*/
	modifier exists( uint256 tokenId_ ) {
		require ( _owners[ tokenId_ ] != address( 0 ), 'IERC721_NONEXISTANT_TOKEN' );
		_;
	}

	/**
	* @dev Reverts if the caller is not allowed to manage `tokenId_`.
	*/
	modifier isApprovedOrOwner( uint256 tokenId_ ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		bool _isApproved_ = msg.sender == _tokenOwner_ ||
												msg.sender == _tokenApprovals[ tokenId_ ] ||
												_operatorApprovals[ _tokenOwner_ ][ msg.sender ];
		require ( _isApproved_, 'IERC721_CALLER_NOT_APPROVED' );
		_;
	}

	/**
	* @dev See {IERC721-safeTransferFrom}.
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override exists( tokenId_ ) isApprovedOrOwner( tokenId_ ) isValidTransfer( to_ ) {
		_safeTransfer( from_, to_, tokenId_, "" );
	}

	/**
	* @dev See {IERC721-safeTransferFrom}.
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_, bytes memory data_ ) public virtual override exists( tokenId_ ) isApprovedOrOwner( tokenId_ ) isValidTransfer( to_ ) {
		_safeTransfer( from_, to_, tokenId_, data_ );
	}

	/**
	* @dev See {IERC721-transferFrom}.
	*/
	function transferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override exists( tokenId_ ) isApprovedOrOwner( tokenId_ ) isValidTransfer( to_ ) {
		_transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-balanceOf}.
	* 
	* Note: Prefer calling this function in view-only functions.  
	*/
	function balanceOf( address tokenOwner_ ) public view virtual override returns ( uint256 ) {
		if ( tokenOwner_ == address( 0 ) ) {
			return 0;
		}

		uint256 _count_ = 0;
		for ( uint256 i = 0; i < _tokenIds; i++ ) {
			if ( tokenOwner_ == _owners[ i ] ) {
				_count_++;
			}
		}
		return _count_;
	}

	/**
	* @dev See {IERC721-ownerOf}.
	*/
	function ownerOf( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( address ) {
		return _owners[ tokenId_ ];
	}

	/**
	* @dev See {IERC721-approve}.
	*/
	function approve( address to_, uint256 tokenId_ ) public virtual override exists( tokenId_ ) isApprovedOrOwner( tokenId_ ) {
		require ( to_ != _owners[ tokenId_ ], 'IERC721_APPROVE_OWNER' );

		_tokenApprovals[ tokenId_ ] = to_;
		emit Approval( _owners[ tokenId_ ], to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-getApproved}.
	*/
	function getApproved( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( address operator ) {
		return _tokenApprovals[ tokenId_ ];
	}

	/**
	* @dev See {IERC721-setApprovalForAll}.
	*/
	function setApprovalForAll( address operator_, bool approved_ ) public virtual override {
		require ( operator_ != msg.sender, 'IERC721_APPROVE_CALLER' );
		_operatorApprovals[ msg.sender ][ operator_ ] = approved_;
		emit ApprovalForAll( msg.sender, operator_, approved_ );
	}

	/**
	* @dev See {IERC721-isApprovedForAll}.
	*/
	function isApprovedForAll( address tokenOwner_, address operator_ ) public view virtual override returns ( bool ) {
		return _operatorApprovals[ tokenOwner_ ][ operator_ ];
	}

	/**
	* @dev See {IERC165-supportsInterface}.
	*/
	function supportsInterface( bytes4 interfaceId_ ) public view virtual override returns ( bool ) {
		return 
			interfaceId_ == type( IERC721 ).interfaceId ||
			interfaceId_ == type( IERC165 ).interfaceId;
	}

	/**
	* @dev The amount of tokens that have been minted.
	*/
	function _supplyMinted() internal view virtual returns ( uint256 ) {
		return _tokenIds;
	}

	function _exists( uint256 tokenId_ ) internal view virtual returns ( bool ) {
		return _owners[ tokenId_ ] != address( 0 );
	}

	/**
	* @dev Transfers `tokenId_` from `from_` to `to_`.
	* As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
	*
	* Emits a {Transfer} event.
	*/
	function _transfer( address from_, address to_, uint256 tokenId_ ) internal virtual {
		_tokenApprovals[ tokenId_ ] = address( 0 );
		_owners[ tokenId_ ] = to_;
		emit Transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev Safely transfers `tokenId_` token from `from_` to `to_`, checking first that contract recipients
	* are aware of the ERC721 protocol to prevent tokens from being forever locked.
	*
	* `data_` is additional data, it has no specified format and it is sent in call to `to_`.
	*
	* This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
	* implement alternative mechanisms to perform token transfer, such as signature-based.
	*
	* Requirements:
	*
	* - If `to_` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
	*
	* Emits a {Transfer} event.
	*/
	function _safeTransfer( address from_, address to_, uint256 tokenId_, bytes memory data_ ) internal virtual {
		_tokenApprovals[ tokenId_ ] = address( 0 );
		_owners[ tokenId_ ] = to_;
		require ( _checkOnERC721Received( from_, to_, tokenId_, data_ ), 'IERC721_NON_ERC721_RECEIVER' );
		emit Transfer( from_, to_, tokenId_ );
	}

	function _mint( address to_ ) internal virtual {
		_transfer( address( 0 ), to_, _supplyMinted() );
		_tokenIds ++;
	}

	/**
	* @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
	* The call is not executed if the target address is not a contract.
	*
	* @param from_ address representing the previous owner of the given token ID
	* @param to_ target address that will receive the tokens
	* @param tokenId_ uint256 ID of the token to be transferred
	* @param data_ bytes optional data to send along with the call
	* @return bool whether the call correctly returned the expected magic value
	*/
	function _checkOnERC721Received( address from_, address to_, uint256 tokenId_, bytes memory data_ ) internal returns ( bool ) {
		// This method relies on extcodesize, which returns 0 for contracts in
		// construction, since the code is only stored at the end of the
		// constructor execution.
		// 
		// IMPORTANT
		// It is unsafe to assume that an address not flagged by this method
		// is an externally-owned account (EOA) and not a contract.
		//
		// Among others, the following types of addresses will not be flagged:
		//
		//  - an externally-owned account
		//  - a contract in construction
		//  - an address where a contract will be created
		//  - an address where a contract lived, but was destroyed
		uint256 _size_;
		assembly {
			_size_ := extcodesize( to_ )
		}

		// If address is a contract, check that it is aware of how to handle ERC721 tokens
		if ( _size_ > 0 ) {
			try IERC721Receiver( to_ ).onERC721Received( msg.sender, from_, tokenId_, data_ ) returns ( bytes4 retval ) {
				return retval == IERC721Receiver.onERC721Received.selector;
			}
			catch ( bytes memory reason ) {
				require ( reason.length != 0, 'IERC721_NON_ERC721_RECEIVER' );

				assembly {
					revert( add( 32, reason ), mload( reason ) )
				}
			}
		}
		else {
			return true;
		}
	}
}
