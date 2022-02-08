const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect
const { ethers } = require( 'hardhat' )

const { TEST_ACTIVATION } = require( '../test-activation-module' )
const { deployContract } = require( '../contract-deployment-module' )

const {
	THROW,
} = require( '../test-var-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'Transfer Price Comparison',
}

// For contract data
const CONTRACTS = [
	{
		NAME : 'Minter_ERC721',
		MAX  : 1152,
	},
	{
		NAME : 'Minter_ERC721A',
		MAX  : 2500,
	},
	{
		NAME : 'Minter_ERC721B',
		MAX  : 1161,
	},
	{
		NAME : 'Minter_ERC721Base2',
		MAX  : 1160,
	},
	{
		NAME : 'Minter_ERC721Map',
		MAX  : 1180,
	},
	{
		NAME : 'Minter_ERC721Arr',
		MAX  : 1186,
	},
]

const transferBehavior = ( contract_name ) => {
	describe( contract_name, function() {
		let contract_deployer_address
		let token_owner_address
		let user1_address

		let contract_deployer
		let token_owner
		let user1

		let addrs

		let contract
		let contract_address
		let contract_artifact

		before( async function() {
			[
				contract_deployer,
				token_owner,
				user1,
				...addrs
			] = await ethers.getSigners()

			contract_deployer_address = contract_deployer.address
			token_owner_address = token_owner.address
			user1_address = user1.address

			contract_artifact = await ethers.getContractFactory( contract_name )
		})

		beforeEach( async function() {
			const params = []
			contract = await deployContract( contract_artifact, false, params )
			contract_address = contract.address
			await contract.connect( token_owner ).mint_01()
		})

		it( 'Transfer a token', async function() {
			await contract.connect( token_owner ).functions['safeTransferFrom(address,address,uint256)']( token_owner_address, user1_address, 0 )
			expect( await contract.ownerOf( 0 ) ).to.equal( user1_address )
		})
	})
}

if ( TEST_ACTIVATION.PRICE_TRANSFER_ERC721 ) {
	for ( let i = 0; i < CONTRACTS.length; i ++ ) {
		const contractTested = CONTRACTS[ i ]
		transferBehavior( contractTested.NAME )
	}
}
