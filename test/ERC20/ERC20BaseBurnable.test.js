const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC20BaseBurnable.sol/Mock_ERC20BaseBurnable.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20Base } = require( './behavior.ERC20Base' )
const { shouldBehaveLikeERC20BaseBurnable } = require( './behavior.ERC20BaseBurnable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseBurnable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC20BaseBurnable',
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
		shouldBehaveLikeERC20BaseBurnable( fixture, CONTRACT.PARAMS )
	}
})
