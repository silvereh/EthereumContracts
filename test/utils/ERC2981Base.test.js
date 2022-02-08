const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/utils/Mock_ERC2981Base.sol/Mock_ERC2981Base.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC2981 } = require( './behavior.ERC2981Base' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC2981Base',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC2981Base',
	PARAMS : {
		CONSTRUCT : {
			royaltyRate_ : 1000
		},
		ROYALTY_BASE : 10000,
	},
}

async function fixture() {
	[
		test_contract_deployer,
		...addrs
	] = await ethers.getSigners()

	const params = [
		test_contract_deployer.address,
		CONTRACT.PARAMS.CONSTRUCT.royaltyRate_
	]
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC2981( fixture, CONTRACT.PARAMS )
	}
})
