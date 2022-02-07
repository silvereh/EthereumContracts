const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeTemplate } = require( './template.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'Contract',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_Contract',
	PARAMS : {
		CONSTRUCT    : [],
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC2981( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
