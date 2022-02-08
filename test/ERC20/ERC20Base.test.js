const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC20Base.sol/Mock_ERC20Base.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20Base } = require( './behavior.ERC20Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20Base',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC20Base',
	PARAMS : {
		CONSTRUCT   : [],
		INIT_SUPPLY : 0,
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
		shouldBehaveLikeERC20Base( fixture, CONTRACT.PARAMS )
	}
})
