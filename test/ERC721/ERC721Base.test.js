const { shouldBehaveLikeERC721Base } = require( './ERC721Base.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721Base',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC721Base',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC721Base( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
