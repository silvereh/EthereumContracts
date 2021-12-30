const { shouldBehaveLikeERC20BaseCapped } = require( './ERC20BaseCapped.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseCapped',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC20BaseCapped',
	PARAMS : {
		CONSTRUCT   : [ 1000 ],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC20BaseCapped( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
