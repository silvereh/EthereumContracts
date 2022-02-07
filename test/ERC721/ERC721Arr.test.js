const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721Base } = require( './behavior.ERC721Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721Arr',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721Arr',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC721Base( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
