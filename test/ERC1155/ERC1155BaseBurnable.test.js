const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC1155BaseBurnable } = require( './ERC1155BaseBurnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC1155BaseBurnable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC1155BaseBurnable',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
		INIT_SERIES : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC1155BaseBurnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
