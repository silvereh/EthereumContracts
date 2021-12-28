const { shouldBehaveLikeERC721BaseMetadata } = require( './ERC721BaseMetadata.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721BaseMetadata',
	CONTRACT : true,
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
	if ( TEST.CONTRACT ) {
		shouldBehaveLikeERC721BaseMetadata( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
