const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20BaseBurnable } = require( './ERC20BaseBurnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseBurnable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC20BaseBurnable',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC20BaseBurnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
