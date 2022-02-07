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
* 
* Note: ERC721Map_NoContext_Mod_NoPrivFunc
*/
abstract contract ERC721Base is IERC165, IERC721 {
	// Errors
	error IERC721_APPROVE_OWNER();
	error IERC721_APPROVE_CALLER();
	error IERC721_CALLER_NOT_APPROVED();
	error IERC721_NONEXISTANT_TOKEN();
	error IERC721_NULL_ADDRESS_BALANCE();
	error IERC721_NULL_ADDRESS_TRANSFER();
	error IERC721_NON_ERC721_RECEIVER();

	// Token IDs
	uint256 private _numTokens;

	// List of owner addresses
	mapping( uint256 => address ) private _owners;

	// Mapping from token ID to approved address
	mapping( uint256 => address ) private _tokenApprovals;

	// Mapping from owner to operator approvals
	mapping( address => mapping( address => bool ) ) private _operatorApprovals;

	/**
	* @dev Ensures the token exist
	* A token exists if it has been minted and is not owned by the null address
	* 
	* @param tokenId_ uint256 ID of the token to verify
	*/
	modifier exists( uint256 tokenId_ ) {
		if ( _owners[ tokenId_ ] == address( 0 ) ) {
			revert IERC721_NONEXISTANT_TOKEN();
		}
		_;
	}

	/**
	* @dev Ensures `operator_` is allowed to handle `tokenId_`
	* 
	* Note: To avoid multiple checks for the same data, it is assumed that existence of `tokeId_` 
	* has been verified prior via {exists}
	* If it hasn't been verified, this function might panic
	* 
	* @param operator_ address that tries to handle the token
	* @param tokenId_ uint256 ID of the token to be handled
	*/
	modifier isApprovedOrOwner( address operator_, uint256 tokenId_ ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		bool _isApproved_ = msg.sender == _tokenOwner_ ||
												msg.sender == _tokenApprovals[ tokenId_ ] ||
												_operatorApprovals[ _tokenOwner_ ][ msg.sender ];
		if ( ! _isApproved_ ) {
			revert IERC721_CALLER_NOT_APPROVED();
		}
		_;
	}

	/**
	* @dev Ensures the token is being transfered to a target address that can handle it.
	*
	* @param to_ target address that will receive the tokens
	* @param tokenId_ uint256 ID of the token to be transferred
	* @param data_ bytes optional data to send along with the call
	*/
	modifier isSafeTransfer( address to_, uint256 tokenId_, bytes memory data_ ) {
		_;
		address _tokenOwner_ = _owners[ tokenId_ ];
		bool ok = _checkOnERC721Received( _tokenOwner_, to_, tokenId_, data_ );
		if ( ! ok ) {
			revert IERC721_NON_ERC721_RECEIVER();
		}
	}

	/**
	* @dev Ensures the recipient is not the null address.
	* 
	* @param to_ target address that will receive the tokens
	*/
	modifier isValidTransfer( address to_ ) {
		if ( to_ == address( 0 ) ) {
			revert IERC721_NULL_ADDRESS_TRANSFER();
		}
		_;
	}

	/**
	* @dev Mints a token into `to_`.
	* 
	* This internal function can be used to perform token minting.
	* 
	* Emits a {Transfer} event.
	*/
	function _mint( address to_ ) internal virtual {
		_owners[ _numTokens ] = to_;
		emit Transfer( address( 0 ), to_, _numTokens );
		_numTokens ++;
	}

	/**
	* @dev Transfers `tokenId_` from `from_` to `to_`.
	*
	* This internal function can be used to implement alternative mechanisms to perform 
	* token transfer, such as signature-based, or token burning.
	* 
	* Emits a {Transfer} event.
	*/
	function _transfer( address from_, address to_, uint256 tokenId_ ) internal virtual {
		_tokenApprovals[ tokenId_ ] = address( 0 );
		_owners[ tokenId_ ] = to_;
		emit Transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-approve}.
	*/
	function approve( address to_, uint256 tokenId_ ) public virtual override exists( tokenId_ ) isApprovedOrOwner( msg.sender, tokenId_ ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		if ( to_ == _tokenOwner_ ) {
			revert IERC721_APPROVE_OWNER();
		}

		_tokenApprovals[ tokenId_ ] = to_;
		emit Approval( _tokenOwner_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-safeTransferFrom}.
	* 
	* Note: We can ignore `from_` as we can compare everything to the actual token owner, 
	* but we cannot remove this parameter to stay in conformity with IERC721
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override isValidTransfer( to_ ) exists( tokenId_ ) isApprovedOrOwner( msg.sender, tokenId_ ) isSafeTransfer( to_, tokenId_, "" ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		_transfer( from_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-safeTransferFrom}.
	* 
	* Note: We can ignore `from_` as we can compare everything to the actual token owner, 
	* but we cannot remove this parameter to stay in conformity with IERC721
	*/
	function safeTransferFrom( address from_, address to_, uint256 tokenId_, bytes memory data_ ) public virtual override isValidTransfer( to_ ) exists( tokenId_ ) isApprovedOrOwner( msg.sender, tokenId_ ) isSafeTransfer( to_, tokenId_, data_ ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		_transfer( _tokenOwner_, to_, tokenId_ );
	}

	/**
	* @dev See {IERC721-setApprovalForAll}.
	*/
	function setApprovalForAll( address operator_, bool approved_ ) public virtual override {
		if ( operator_ == msg.sender ) {
			revert IERC721_APPROVE_CALLER();
		}

		_operatorApprovals[ msg.sender ][ operator_ ] = approved_;
		emit ApprovalForAll( msg.sender, operator_, approved_ );
	}

	/**
	* @dev See {IERC721-transferFrom}.
	* 
	* Note: We can ignore `from_` as we can compare everything to the actual token owner, 
	* but we cannot remove this parameter to stay in conformity with IERC721
	*/
	function transferFrom( address from_, address to_, uint256 tokenId_ ) public virtual override isValidTransfer( to_ ) exists( tokenId_ ) isApprovedOrOwner( msg.sender, tokenId_ ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		_transfer( _tokenOwner_, to_, tokenId_ );
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
	* @dev Internal function returning whether a token exists. 
	* A token exists if it has been minted and is not owned by the null address.
	* 
	* @param tokenId_ uint256 ID of the token to verify
	* 
	* @return bool whether the token exists
	*/
	function _exists( uint256 tokenId_ ) internal virtual view returns ( bool ) {
		return _owners[ tokenId_ ] != address( 0 );
	}

	/**
	* @dev Internal function returning whether `operator_` is allowed to handle `tokenId_`
	* 
	* Note: To avoid multiple checks for the same data, it is assumed that existence of `tokeId_` 
	* has been verified prior via {_exists}
	* If it hasn't been verified, this function might panic
	* 
	* @param operator_ address that tries to handle the token
	* @param tokenId_ uint256 ID of the token to be handled
	* 
	* @return bool whether `operator_` is allowed to handle the token
	*/
	function _isApprovedOrOwner( address operator_, uint256 tokenId_ ) internal virtual view returns ( bool ) {
		address _tokenOwner_ = _owners[ tokenId_ ];
		bool _isApproved_ = operator_ == _tokenOwner_ ||
												operator_ == _tokenApprovals[ tokenId_ ] ||
												_operatorApprovals[ _tokenOwner_ ][ operator_ ];
		return _isApproved_;
	}

	/**
	* @dev Internal function returning the total number of tokens minted
	* 
	* @return uint256 the number of tokens that have been minted so far
	*/
	function _supplyMinted() internal virtual view returns ( uint256 ) {
		return _numTokens;
	}

	/**
	* @dev See {IERC721-balanceOf}.
	* 
	* Note: Avoid calling this function in non-view functions.  
	*/
	function balanceOf( address tokenOwner_ ) public view virtual override returns ( uint256 ) {
		if ( tokenOwner_ == address( 0 ) ) {
			return 0;
		}

		uint256 _count_ = 0;
		for ( uint256 i = _numTokens; i > 0; i-- ) {
			if ( tokenOwner_ == _owners[ i - 1 ] ) {
				_count_++;
			}
		}
		return _count_;
	}

	/**
	* @dev See {IERC721-getApproved}.
	*/
	function getApproved( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( address operator ) {
		return _tokenApprovals[ tokenId_ ];
	}

	/**
	* @dev See {IERC721-isApprovedForAll}.
	*/
	function isApprovedForAll( address tokenOwner_, address operator_ ) public view virtual override returns ( bool ) {
		return _operatorApprovals[ tokenOwner_ ][ operator_ ];
	}

	/**
	* @dev See {IERC721-ownerOf}.
	*/
	function ownerOf( uint256 tokenId_ ) public view virtual override exists( tokenId_ ) returns ( address ) {
		return _owners[ tokenId_ ];
	}

	/**
	* @dev See {IERC165-supportsInterface}.
	*/
	function supportsInterface( bytes4 interfaceId_ ) public view virtual override returns ( bool ) {
		return 
			interfaceId_ == type( IERC721 ).interfaceId ||
			interfaceId_ == type( IERC165 ).interfaceId;
	}
}
