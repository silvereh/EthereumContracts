const { shouldBehaveLikeERC20BaseBurnable } = require( './ERC20BaseBurnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseBurnable',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC20BaseBurnable',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC20BaseBurnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
