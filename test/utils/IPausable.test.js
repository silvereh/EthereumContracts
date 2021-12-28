const { shouldBehaveLikeIPausable } = require( './IPausable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IPausable',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockIPausable',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeIPausable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
