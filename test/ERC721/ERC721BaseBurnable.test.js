const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721BaseBurnable } = require( './ERC721BaseBurnable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721BaseBurnable',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC721BaseBurnable',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC721BaseBurnable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
