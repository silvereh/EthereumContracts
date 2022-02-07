const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721OZ } = require( './behavior.ERC721OZ' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721B',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721B',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC721OZ( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
