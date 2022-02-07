const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIInitializable } = require( './IInitializable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IInitializable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IInitializable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeIInitializable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
