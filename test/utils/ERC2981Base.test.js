const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC2981 } = require( './ERC2981Base.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC2981Base',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC2981Base',
	PARAMS : {
		CONSTRUCT    : [],
		ROYALTY_RATE : 1000,
		ROYALTY_BASE : 10000,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC2981( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
