const { ethers, waffle } = require( 'hardhat' )

const { deployContract } = waffle

const ARTIFACT = require( '../../artifacts/contracts/mocks/tokens/Mock_ERC721OZ.sol/Mock_ERC721OZ.json' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { shouldBehaveLikeERC721OZ } = require( './behavior.ERC721OZ' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC721OZ',
}

// For contract data
const CONTRACT = {
	NAME : 'Mock_ERC721OZ',
	PARAMS : {
		CONSTRUCT : {
			name_   : 'NFT Token',
			symbol_ : 'NFT',
		},
		INIT_SUPPLY : 0,
		TX_MAX      : 1080,
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
		shouldBehaveLikeERC721OZ( fixture, CONTRACT.PARAMS )
	}
})
