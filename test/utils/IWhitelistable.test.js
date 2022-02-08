const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_IWhitelistable.sol/Mock_IWhitelistable.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeIWhitelistable } = require( './behavior.IWhitelistable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IWhitelistable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_IWhitelistable',
	PARAMS : {
		CONSTRUCT : {},
		PASS_ROOT : ethers.BigNumber.from( '0xcf5ce81531095391e96302b4ec6ec1f49c1928610a7726678f84245d26dc4803' ),
		PASS_MAX  : 3,
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
		shouldBehaveLikeIWhitelistable( fixture, CONTRACT.PARAMS )
	}
})
