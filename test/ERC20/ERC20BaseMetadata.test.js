const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC20BaseMetadata.sol/Mock_ERC20BaseMetadata.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20Base } = require( './behavior.ERC20Base' )
const { shouldBehaveLikeERC20BaseMetadata } = require( './behavior.ERC20BaseMetadata' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseMetadata',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC20BaseMetadata',
	PARAMS : {
		CONSTRUCT : {
			name_   : 'Coin Token',
			symbol_ : 'COIN'
		},
		INIT_SUPPLY : 0,
	},
}

async function fixture() {
	[
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const params = [
		CONTRACT.PARAMS.CONSTRUCT.name_,
		CONTRACT.PARAMS.CONSTRUCT.symbol_
	]
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC20Base( fixture, CONTRACT.PARAMS )
		shouldBehaveLikeERC20BaseMetadata( fixture, CONTRACT.PARAMS )
	}
})
