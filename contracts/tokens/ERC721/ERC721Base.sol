// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../interfaces/IERC165.sol';
import '../../interfaces/IERC721.sol';
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
abstract contract ERC721Base is IERC165, IERC721 {
	// Errors
	error IERC721_APPROVE_OWNER();
	error IERC721_APPROVE_CALLER();
	error IERC721_CALLER_NOT_APPROVED();
	error IERC721_NONEXISTANT_TOKEN();
	error IERC721_NULL_ADDRESS_BALANCE();
	error IERC721_NULL_ADDRESS_TRANSFER();
	error IERC721_TOKEN_NOT_OWNED();
	error IERC721_NON_ERC721_RECEIVER();

	// Token IDs
	uint256 private _tokenIds;

	// List of owner addresses
	mapping( uint256 => address ) private _owners;

	// Mapping from token ID to approved address
	mapping( uint256 => address ) private _tokenApprovals;

	// Mapping from owner to operator approvals
	mapping( address => mapping( address => bool ) ) private _operatorApprovals;

	/**
	* @dev See {IERC721-safeTransferFrom}.
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override {
		safeTransferFrom( from_, to_, tokenId_, "" );
	}

	/**
	* @dev See {IERC721-safeTransferFrom}.
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_, bytes memory data_ ) public virtual override {
		if ( ! _isApprovedOrOwner( msg.sender, tokenId_ ) ) {
			revert IERC721_CALLER_NOT_APPROVED();
		}
		_safeTransfer( from_, to_, tokenId_, data_ );
	}

	/**
	* @dev See {IERC721-transferFrom}.
	*/
	function transferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override {
		if ( ! _isApprovedOrOwner( msg.sender, tokenId_ ) ) {
			revert IERC721_CALLER_NOT_APPROVED();
		}
		if ( to_ == address( 0 ) ) {
			revert IERC721_NULL_ADDRESS_TRANSFER();
		}
		_transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-balanceOf}.
	*/
	function balanceOf( address tokenOwner_ ) public view virtual override returns ( uint256 ) {
		if ( tokenOwner_ == address( 0 ) ) {
			revert IERC721_NULL_ADDRESS_BALANCE();
		}
		uint256 _count_ = 0;
		for ( uint256 i = 0; i < _tokenIds; i++ ) {
			if ( tokenOwner_ == _owners[i] ) {
				_count_++;
			}
		}
		return _count_;
	}

	/**
	* @dev See {IERC721-ownerOf}.
	*/
	function ownerOf( uint256 tokenId_ ) public view virtual override returns ( address ) {
		if ( ! _exists( tokenId_ ) ) {
			revert IERC721_NONEXISTANT_TOKEN();
		}
		return _owners[tokenId_];
	}

	/**
	* @dev See {IERC721-approve}.
	*/
	function approve( address to_, uint256 tokenId_ ) public virtual override {
		address _tokenOwner_ = ownerOf( tokenId_ );
		if ( to_ == _tokenOwner_ ) {
			revert IERC721_APPROVE_OWNER();
		}

		if ( msg.sender != _tokenOwner_ && ! isApprovedForAll( _tokenOwner_, msg.sender ) ) {
			revert IERC721_CALLER_NOT_APPROVED();
		}

		_approve( to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-getApproved}.
	*/
	function getApproved( uint256 tokenId_ ) public view virtual override returns ( address operator ) {
		if ( ! _exists( tokenId_ ) ) {
			revert IERC721_NONEXISTANT_TOKEN();
		}
		return _tokenApprovals[tokenId_];
	}

	/**
	* @dev See {IERC721-setApprovalForAll}.
	*/
	function setApprovalForAll( address operator_, bool approved_ ) public virtual override {
		if ( operator_ == msg.sender ) {
			revert IERC721_APPROVE_CALLER();
		}
		_operatorApprovals[msg.sender][operator_] = approved_;
		emit ApprovalForAll( msg.sender, operator_, approved_ );
	}

	/**
	* @dev See {IERC721-isApprovedForAll}.
	*/
	function isApprovedForAll( address tokenOwner_, address operator_ ) public view virtual override returns ( bool ) {
		return _operatorApprovals[tokenOwner_][operator_];
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

	/**
	* @dev Returns whether `tokenId_` exists.
	*
	* Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
	*
	* Tokens start existing when they are minted ( `_mint` ),
	* and stop existing when they are burned ( `_burn` ).
	*/
	function _exists( uint256 tokenId_ ) internal view virtual returns ( bool ) {
		return _owners[tokenId_] != address( 0 );
	}

	/**
	* @dev Returns whether `spender_` is allowed to manage `tokenId_`.
	*
	* Requirements:
	*
	* - `tokenId_` must exist.
	*/
	function _isApprovedOrOwner( address spender_, uint256 tokenId_ ) internal view virtual returns ( bool ) {
		address _tokenOwner_ = ownerOf( tokenId_ );
		return ( spender_ == _tokenOwner_ || getApproved( tokenId_ ) == spender_ || isApprovedForAll( _tokenOwner_, spender_ ) );
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
	* - `from_` cannot be the zero address.
	* - `to_` cannot be the zero address.
	* - `tokenId_` token must exist and be owned by `from_`.
	* - If `to_` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
	*
	* Emits a {Transfer} event.
	*/
	function _safeTransfer( address from_, address to_, uint256 tokenId_, bytes memory data_ ) internal virtual {
		if ( to_ == address( 0 ) ) {
			revert IERC721_NULL_ADDRESS_TRANSFER();
		}
		_transfer( from_, to_, tokenId_ );
		if ( ! _checkOnERC721Received( from_, to_, tokenId_, data_ ) ) {
			revert IERC721_NON_ERC721_RECEIVER();
		}
	}

	/**
	* @dev Transfers `tokenId_` from `from_` to `to_`.
	* As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
	*
	* Requirements:
	*
	* - `tokenId_` token must be owned by `from_`.
	*
	* Emits a {Transfer} event.
	*/
	function _transfer( address from_, address to_, uint256 tokenId_ ) internal virtual {
		if ( ownerOf( tokenId_ ) != from_ ) {
			revert IERC721_TOKEN_NOT_OWNED();
		}

		// Clear approvals from the previous owner
		_tokenApprovals[tokenId_] = address( 0 );
		_owners[tokenId_] = to_;

		emit Transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev Approve `to_` to operate on `tokenId_`
	*
	* Emits a {Approval} event.
	*/
	function _approve( address to_, uint256 tokenId_ ) internal virtual {
		_tokenApprovals[tokenId_] = to_;
		emit Approval( ownerOf( tokenId_ ), to_, tokenId_ );
	}

	/**
	* @dev Safely mints `tokenId_` and transfers it to `to`.
	*
	* Requirements:
	*
	* - If `to_` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
	*
	* Emits a {Transfer} event.
	*/
	function _safeMint( address to_ ) internal virtual {
		_safeMint( to_, "" );
	}

	/**
	* @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data_` parameter which is
	* forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
	*/
	function _safeMint( address to_, bytes memory data_ ) internal virtual {
		uint256 _tokenId_ = _tokenIds;
		_mint( to_, _tokenId_ );
		if ( ! _checkOnERC721Received( address( 0 ), to_, _tokenId_, data_ ) ) {
			revert IERC721_NON_ERC721_RECEIVER();
		}
	}

	/**
	* @dev Mints `tokenId_` and transfers it to `to_`.
	*
	* WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
	*
	* Requirements:
	*
	* - `tokenId_` must not exist.
	* - `to_` cannot be the zero address.
	*
	* Emits a {Transfer} event.
	*/
	function _mint( address to_, uint256 tokenId_ ) internal virtual {
		if ( to_ == address( 0 ) ) {
			revert IERC721_NULL_ADDRESS_TRANSFER();
		}

		_owners[ tokenId_ ] = to_;
		_tokenIds ++;

		emit Transfer( address( 0 ), to_, tokenId_ );
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
		if ( _isContract( to_ ) ) {
			try IERC721Receiver( to_ ).onERC721Received( msg.sender, from_, tokenId_, data_ ) returns ( bytes4 retval ) {
				return retval == IERC721Receiver.onERC721Received.selector;
			}
			catch ( bytes memory reason ) {
				if ( reason.length == 0 ) {
					revert IERC721_NON_ERC721_RECEIVER();
				}
				else {
					assembly {
						revert( add( 32, reason ), mload( reason ) )
					}
				}
			}
		}
		else {
			return true;
		}
	}

	/**
	* @dev Returns true if `account` is a contract.
	*
	* [IMPORTANT]
	* ====
	* It is unsafe to assume that an address for which this function returns
	* false is an externally-owned account (EOA) and not a contract.
	*
	* Among others, `_isContract` will return false for the following
	* types of addresses:
	*
	*  - an externally-owned account
	*  - a contract in construction
	*  - an address where a contract will be created
	*  - an address where a contract lived, but was destroyed
	* ====
	*/
	function _isContract(address account) internal view returns (bool) {
		// This method relies on extcodesize, which returns 0 for contracts in
		// construction, since the code is only stored at the end of the
		// constructor execution.

		uint256 size;
		assembly {
			size := extcodesize(account)
		}
		return size > 0;
	}
}
