const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC1155BaseMetadataURI.sol/Mock_ERC1155BaseMetadataURI.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC1155Base } = require( './behavior.ERC1155Base' )
const { shouldBehaveLikeERC1155BaseMetadataURI } = require( './behavior.ERC1155BaseMetadataURI' )

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

async function fixture() {
	[
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const params = []
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC1155Base( fixture, CONTRACT.PARAMS )
		shouldBehaveLikeERC1155BaseMetadataURI( fixture, CONTRACT.PARAMS )
	}
})
