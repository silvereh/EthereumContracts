const { shouldBehaveLikeERC721BaseEnumerable } = require( './ERC721BaseEnumerable.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721BaseEnumerable',
	CONTRACT : true,
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC721BaseEnumerable',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC721BaseEnumerable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
