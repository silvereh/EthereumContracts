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
	NAME : 'Mint Price Comparison',
}

// For contract data
const CONTRACTS = [
	{
		NAME : 'Minter_ERC721',
		MAX  : 1152,
	},
	{
		NAME : 'Minter_ERC721A',
		MAX  : 8248,
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
		MAX  : 1171,
	},
	{
		NAME : 'Minter_ERC721Arr',
		MAX  : 1186,
	},
]

const mintingBehavior = ( contract_name, contract_max ) => {
	describe( contract_name, () => {
		let contract_deployer_address
		let token_owner_address

		let contract_deployer
		let token_owner

		let addrs

		let contract
		let contract_address
		let contract_artifact

		before( async () => {
			[
				contract_deployer,
				token_owner,
				...addrs
			] = await ethers.getSigners()

			contract_deployer_address = contract_deployer.address
			token_owner_address = token_owner.address

			contract_artifact = await ethers.getContractFactory( contract_name )
		})

		beforeEach( async () => {
			const params = []
			contract = await deployContract( contract_artifact, params )
			contract_address = contract.address
		})

		it( 'Mint a single token', async () => {
			await contract.connect( token_owner ).mint_01()
			expect( await contract.balanceOf( token_owner_address ) ).to.equal( 1 )
		})

		it( 'Mint 5 tokens', async () => {
			await contract.connect( token_owner ).mint_05()
			expect( await contract.balanceOf( token_owner_address ) ).to.equal( 5 )
		})

		it( 'Mint 20 tokens', async () => {
			await contract.connect( token_owner ).mint_20()
			expect( await contract.balanceOf( token_owner_address ) ).to.equal( 20 )
		})

		it( 'Mint ' + contract_max + ' tokens', async () => {
			await contract.connect( token_owner ).mint_Max( contract_max )
			expect( await contract.balanceOf( token_owner_address ) ).to.equal( contract_max )
		})

		it( 'Mint ' + ( contract_max + 1 ) + ' tokens should run out of gas', async () => {
			await expect( contract.connect( token_owner ).mint_Max( contract_max + 1 ) ).to.be.rejectedWith( THROW.OUT_OF_GAS )
		})
	})
}

if ( TEST_ACTIVATION.PRICE_MINT_ERC721 ) {
	for ( let i = 0; i < CONTRACTS.length; i ++ ) {
		const contractTested = CONTRACTS[ i ]
		mintingBehavior( contractTested.NAME, contractTested.MAX )
	}
}
