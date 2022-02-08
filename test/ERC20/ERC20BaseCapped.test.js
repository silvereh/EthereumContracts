const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC20BaseCapped.sol/Mock_ERC20BaseCapped.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC20Base } = require( './behavior.ERC20Base' )
const { shouldBehaveLikeERC20BaseCapped } = require( './behavior.ERC20BaseCapped' )

const {
	ERROR,
} = require( '../test-var-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC20BaseCapped',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC20BaseCapped',
	PARAMS : {
		CONSTRUCT   : {
			maxSupply_ : 1000
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
		CONTRACT.PARAMS.CONSTRUCT.maxSupply_
	]
	let test_contract = await deployContract( test_contract_deployer, ARTIFACT, params )
	return { test_contract, test_contract_deployer }
}

describe( TEST.NAME, function() {
	if ( TEST_ACTIVATION[ TEST.NAME ] ) {
		shouldBehaveLikeERC20Base( fixture, CONTRACT.PARAMS )
		shouldBehaveLikeERC20BaseCapped( fixture, CONTRACT.PARAMS )
		it( 'Inputting an incorrect max supply should be reverted with ' + ERROR.ERC20BaseCapped_INVALID_MAX_SUPPLY, async function() {
			await expect( deployContract( test_contract_deployer, ARTIFACT, [ 0 ] ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_INVALID_MAX_SUPPLY )
		})
	}
})
