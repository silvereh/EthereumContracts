const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20Base } = require( './ERC20Base.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20Base',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC20Base',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC20Base( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
