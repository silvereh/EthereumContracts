// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import '../../tokens/ERC1155/extensions/ERC1155BaseBurnable.sol';

contract MockERC1155BaseBurnable is ERC1155BaseBurnable {
	constructor() {}

	function mint( address account_, uint256 id_, uint256 amount_ ) public {
		_mint( account_, id_, amount_ );
	}

	function batchMint( address account_, uint256[] memory ids_, uint256[] memory amounts_ ) public {
		_batchMint( account_, ids_, amounts_ );
	}
}