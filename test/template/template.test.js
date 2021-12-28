const { shouldBehaveLikeTemplate } = require( './template.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'Contract',
	CONTRACT : false,
}

// For contract data
const CONTRACT = {
	NAME : 'MockContract',
	PARAMS : {
		CONSTRUCT : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeTemplate( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
