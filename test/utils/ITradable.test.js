const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeITradable } = require( './ITradable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ITradable',
}

// For contract data
const CONTRACT = {
	NAME : 'MockITradable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeITradable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
