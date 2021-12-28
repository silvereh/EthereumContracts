// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

abstract contract IWhitelisted {
	// Errors
	error IWhitelisted_NOT_SET();
	error IWhitelisted_CONSUMED();
	error IWhitelisted_FORBIDDEN();
	error IWhitelisted_NO_ALLOWANCE();

	bytes32 private _root;
	uint256 private _passMax;
	mapping( address => uint256 ) private _consumed;

	/**
	* @dev Sets the pass to protect the whitelist.
	*/
	function _setWhitelist( bytes32 root_, uint256 passMax_ ) internal virtual {
		if ( passMax_ < 1 ) {
			revert IWhitelisted_NO_ALLOWANCE();
		}

		_root    = root_;
		_passMax = passMax_;
	}

	/**
	* @dev Returns the amount that `account_` is allowed to access from the whitelist.
	* 
	* Requirements:
	* 
	* - `_root` must be set.
	* 
	* See {IWhitelisted-_consumeWhitelist}.
	*/
	function _checkWhitelistAllowance( address account_, bytes32 proof_, bool flag_ ) internal view returns ( uint256 ) {
		if ( _root == 0 ) {
			revert IWhitelisted_NOT_SET();
		}

		if ( _consumed[ account_ ] >= _passMax ) {
			revert IWhitelisted_CONSUMED();
		}

		if ( ! _computeProof( account_, proof_, flag_ ) ) {
			revert IWhitelisted_FORBIDDEN();
		}

		uint256 _res_;
		unchecked {
			_res_ = _passMax - _consumed[ account_ ];
		}

		return _res_;
	}

	function _computeProof( address account_, bytes32 proof_, bool flag_ ) private view returns ( bool ) {
		uint256 _res_;
		uint256 _account_ = uint256( keccak256( abi.encodePacked( account_ ) ) );
		unchecked {
			if ( flag_ ) {
				_res_ = _account_ - uint256( proof_ );
			}
			else {
				_res_ = _account_ + uint256( proof_ );
			}
		}

		return _res_ == uint256( _root );
	}

	/**
	* @dev Consumes `amount_` pass passes from `account_`.
	* 
	* Note: Before calling this function, eligibility should be checked through {IWhitelisted-checkWhitelistAllowance}.
	*/
	function _consumeWhitelist( address account_, bytes32 proof_, bool flag_, uint256 qty_ ) internal {
		if ( qty_ > _passMax ) {
			revert IWhitelisted_FORBIDDEN();
		}

		uint256 _allowed_ = _checkWhitelistAllowance( account_, proof_, flag_ );

		if ( _allowed_ < qty_ ) {
			revert IWhitelisted_FORBIDDEN();
		}

		_consumed[ account_ ] += qty_;
	}
}
