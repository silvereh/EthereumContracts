const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIWhitelistable } = require( './IWhitelistable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IWhitelistable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IWhitelistable',
	PARAMS : {
		CONSTRUCT : [],
		PASS_ROOT : ethers.BigNumber.from( '0xcf5ce81531095391e96302b4ec6ec1f49c1928610a7726678f84245d26dc4803' ),
		PASS_MAX  : 3,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeIWhitelistable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
