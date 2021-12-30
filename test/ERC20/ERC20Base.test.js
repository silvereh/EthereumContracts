const { shouldBehaveLikeERC20Base } = require( './ERC20Base.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20Base',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC20Base',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC20Base( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
