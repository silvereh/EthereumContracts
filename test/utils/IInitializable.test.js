const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_IInitializable.sol/Mock_IInitializable.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIInitializable } = require( './behavior.IInitializable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IInitializable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IInitializable',
	PARAMS : {
		CONSTRUCT : {},
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
		shouldBehaveLikeIInitializable( fixture, CONTRACT.PARAMS )
	}
})
