const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

// const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/.sol/.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeTemplate } = require( './behavior.template' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'Contract',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_Contract',
	PARAMS : {
		CONSTRUCT    : [],
	},
}

async function fixture() {
	[
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const params = []
	let test_contract
	// test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeTemplate( fixture, CONTRACT.PARAMS )
	}
})
