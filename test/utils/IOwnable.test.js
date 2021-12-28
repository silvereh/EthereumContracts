const { shouldBehaveLikeIOwnable } = require( './IOwnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IOwnable',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockIOwnable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeIOwnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
