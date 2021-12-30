const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIWhitelisted } = require( './IWhitelisted.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IWhitelisted',
}

// For contract data
const CONTRACT = {
	NAME : 'MockIWhitelisted',
	PARAMS : {
		CONSTRUCT : [],
		PASS_ROOT : ethers.BigNumber.from( '0xcf5ce81531095391e96302b4ec6ec1f49c1928610a7726678f84245d26dc4803' ),
		PASS_MAX  : 3,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeIWhitelisted( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
