const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC1155Base } = require( './ERC1155Base.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC1155Base',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC1155Base',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
		INIT_SERIES : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC1155Base( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
