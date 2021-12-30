const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721BaseMetadata } = require( './ERC721BaseMetadata.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721BaseMetadata',
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC721BaseMetadata',
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
