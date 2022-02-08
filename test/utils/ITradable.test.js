const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_ITradable.sol/Mock_ITradable.json' )
const PROXY = require( '../../artifacts/contracts/mocks/external/Mock_ProxyRegistry.sol/Mock_ProxyRegistry.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeITradable } = require( './behavior.ITradable' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ITradable',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ITradable',
	PARAMS : {
		CONSTRUCT : {},
	},
}

async function fixture() {
	[
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const proxy_params = []
	let test_proxy_contract = await deployContract( test_contract_deployer, PROXY, proxy_params )

	const params = [
		test_proxy_contract.address
	]
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer, test_proxy_contract }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeITradable( fixture, CONTRACT.PARAMS )
	}
})
