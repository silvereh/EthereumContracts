// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

import "../../tokens/ERC721/ERC721Arr_000.sol";

contract Minter_ERC721Arr_000 is ERC721Arr_000 {
	constructor() {}

	function mint_01() public {
		_mint( msg.sender );
	}

	function mint_05() public {
		for ( uint256 i; i < 5; i ++ ) {
			_mint( msg.sender );
		}
	}

	function mint_20() public {
		for ( uint256 i; i < 20; i ++ ) {
			_mint( msg.sender );
		}
	}

	function mint_Max( uint256 max_ ) public {
		for ( uint256 i; i < max_; i ++ ) {
			_mint( msg.sender );
		}
	}
}
