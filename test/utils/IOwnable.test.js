const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIOwnable } = require( './IOwnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IOwnable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IOwnable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeIOwnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
