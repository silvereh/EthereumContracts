const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC721Base } = require( './ERC721Base.behavior' )
const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )
const { deployContract } = require( '../contract-deployment-module' )

const {
	contract_deployer_name,
	token_owner_name,
	proxy_user_name,
	wl_user1_name,
	wl_user2_name,
	user1_name,
	user2_name,
	ERROR,
	THROW,
	CST,
} = require( '../test-var-module' )

// For activating or de-activating test cases
const TEST = {
	METHODS : {
		name       : true,
		symbol     : true,
		tokenURI   : true,
		setBaseURI : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
		INTROSPECTION : true,
		ERC721_BASE   : true,
	},
}

// For contract data
const CONTRACT = {
	METHODS : {
		name : {
			SIGNATURE : 'name()',
			PARAMS    : [],
		},
		symbol : {
			SIGNATURE : 'symbol()',
			PARAMS    : [],
		},
		tokenURI : {
			SIGNATURE : 'tokenURI(uint256)',
			PARAMS    : [ 'index_' ],
		},
		setBaseURI : {
			SIGNATURE : 'setBaseURI(string)',
			PARAMS    : [ 'baseURI' ],
		},
	},
}

const shouldBehaveLikeERC721BaseMetadata = ( contract_name, contract_params ) => {
	if ( TEST.USE_CASES.ERC721_BASE ) {
		shouldBehaveLikeERC721Base( contract_name, contract_params )
	}

	describe( 'Should behave like ERC721BaseMetadata', () => {
		let contract_deployer_name = 'ContractDeployer'
		let token_owner_name = 'TokenOwner'
		let proxy_user_name = 'ProxyUser'
		let wl_user1_name = 'WlUser1'
		let wl_user2_name = 'WlUser2'
		let user1_name = 'User1'
		let user2_name = 'User2'

		let contract_deployer_address
		let token_owner_address
		let proxy_user_address
		let wl_user1_address
		let wl_user2_address
		let user1_address
		let user2_address

		let contract_deployer
		let token_owner
		let proxy_user
		let wl_user1
		let wl_user2
		let user1
		let user2

		let addrs

		let contract
		let contract_address
		let contract_artifact

		let holder_artifact

		let defaultArgs = {}
		let funcs

		before( async () => {
			[
				contract_deployer,
				token_owner,
				proxy_user,
				wl_user1,
				wl_user2,
				user1,
				user2,
				...addrs
			] = await ethers.getSigners()

			contract_deployer_address = contract_deployer.address
			token_owner_address = token_owner.address
			proxy_user_address = proxy_user.address
			wl_user1_address = wl_user1.address
			wl_user2_address = wl_user2.address
			user1_address = user1.address
			user2_address = user2.address

			contract_artifact = await ethers.getContractFactory( contract_name )
		})

		beforeEach( async () => {
			contract = await deployContract( contract_artifact, contract_params.CONSTRUCT )
			contract_address = contract.address
		})

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				it( 'Contract should support IERC721Metadata', async () => {
					expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC721Metadata ) ).to.be.true
				})

				describe( CONTRACT.METHODS.name.SIGNATURE, () => {
					if ( TEST.METHODS.name ) {
						it( 'Name should be "' + contract_params.CONSTRUCT[ 0 ] + '"', async () => {
							expect( await contract.name() ).to.equal( contract_params.CONSTRUCT[ 0 ] )
						})
					}
				})

				describe( CONTRACT.METHODS.symbol.SIGNATURE, () => {
					if ( TEST.METHODS.symbol ) {
						it( 'Symbol should be "' + contract_params.CONSTRUCT[ 1 ] + '"', async () => {
							expect( await contract.symbol() ).to.equal( contract_params.CONSTRUCT[ 1 ] )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenURI.SIGNATURE, () => {
					if ( TEST.METHODS.tokenURI ) {
						beforeEach( async () => {
							await contract.mint( token_owner_address )
						})

						it( 'Unminted token URI should be reverted with ' + ERROR.IERC721Metadata_NONEXISTANT_TOKEN, async () => {
							await expect( contract.tokenURI( contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721Metadata_NONEXISTANT_TOKEN )
						})

						it( 'First token URI should be "' + contract_params.INIT_SUPPLY + '"', async () => {
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY.toString() )
						})

						it( 'Second token URI should be "' + ( contract_params.INIT_SUPPLY + 1 ).toString() + '"', async () => {
							await contract.mint( token_owner_address )
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY + 1 ) ).to.equal( ( contract_params.INIT_SUPPLY + 1 ).toString() )
						})
					}
				})

				describe( CONTRACT.METHODS.setBaseURI.SIGNATURE, () => {
					if ( TEST.METHODS.setBaseURI ) {
						it( 'First token URI should now be "' + contract_params.BASE_URI + contract_params.INIT_SUPPLY + '"', async () => {
							await contract.mint( token_owner_address )
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY.toString() )
							await contract.setBaseURI( contract_params.BASE_URI )
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.BASE_URI + contract_params.INIT_SUPPLY )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
					defaultArgs = {}
					defaultArgs[ CONTRACT.METHODS.name.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.symbol.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.tokenURI.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.setBaseURI.SIGNATURE ] = {
						err  : null,
						args : [
							contract_params.BASE_URI,
						],
					}
				})

				Object.entries( CONTRACT.METHODS ).forEach( ( [ prop, val ] ) => {
					describe( val.SIGNATURE, () => {
						const testSuite = getTestCasesByFunction( val.SIGNATURE, val.PARAMS )

						testSuite.forEach( testCase => {
							it( testCase.test_description, async () => {
								await generateTestCase( contract, testCase, defaultArgs, prop, val )
							})
						})
					})
				})
			}
		})
	})
}

module.exports = {
	shouldBehaveLikeERC721BaseMetadata,
}
