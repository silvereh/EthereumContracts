const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721BaseMetadata } = require( './behavior.ERC721BaseMetadata' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721MapMetadata',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721MapMetadata',
	PARAMS : {
		CONSTRUCT   : [ 'NFT Token', 'NFT' ],
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
		BASE_URI    : 'baseURI',
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC721BaseMetadata( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
