const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC721Map_110.sol/Mock_ERC721Map_110.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721Base } = require( './behavior.ERC721Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721Map_110',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721Map_110',
	PARAMS : {
		CONSTRUCT : {},
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
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
		shouldBehaveLikeERC721Base( fixture, CONTRACT.PARAMS )
	}
})
