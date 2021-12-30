const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIPausable } = require( './IPausable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IPausable',
}

// For contract data
const CONTRACT = {
	NAME : 'MockIPausable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeIPausable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
