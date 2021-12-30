const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20BaseMetadata } = require( './ERC20BaseMetadata.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseMetadata',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC20BaseMetadata',
	PARAMS : {
		CONSTRUCT   : [
			'Coin Token',
			'COIN'
		],
		INIT_SUPPLY : 0,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC20BaseMetadata( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
