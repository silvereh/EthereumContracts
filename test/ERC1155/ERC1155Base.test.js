const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC1155Base.sol/Mock_ERC1155Base.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC1155Base } = require( './behavior.ERC1155Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC1155Base',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC1155Base',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
		INIT_SERIES : 0,
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
	}
})
