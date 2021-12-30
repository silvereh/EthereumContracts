// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../tokens/ERC20/ERC20Base.sol";

contract MockERC20Base is ERC20Base {
	constructor() {}

	function mint( address recipient_, uint256 amount_ ) public {
		_mint( recipient_, amount_ );
	}

	function mintBatch( address[] memory recipients_, uint256 amount_ ) public {
		_mintBatch( recipients_, amount_ );
	}

	function mintBatch( address[] memory recipients_, uint256[] memory amounts_ ) public {
		_mintBatch( recipients_, amounts_ );
	}
}
