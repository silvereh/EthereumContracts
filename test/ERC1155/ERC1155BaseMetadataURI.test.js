const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC1155BaseMetadataURI } = require( './ERC1155BaseMetadataURI.behavior' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC1155BaseMetadataURI',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC1155BaseMetadataURI',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
		INIT_SERIES : 0,
		BASE_URI    : 'baseURI/{id}',
	},
}

describe( TEST.NAME, () => {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC1155BaseMetadataURI( CONTRACT.NAME, CONTRACT.PARAMS )
	}
})
