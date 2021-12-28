const { shouldBehaveLikeITradable } = require( './ITradable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ITradable',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockITradable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeITradable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
