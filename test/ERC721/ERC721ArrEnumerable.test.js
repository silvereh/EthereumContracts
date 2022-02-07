const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721BaseEnumerable } = require( './behavior.ERC721BaseEnumerable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721ArrEnumerable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721ArrEnumerable',
	PARAMS : {
		CONSTRUCT : [],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC721BaseEnumerable( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
