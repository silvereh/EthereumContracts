const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers, waffle } = require( 'hardhat' )
const { loadFixture } = waffle

const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )

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

const shouldBehaveLikeERC721BaseMetadata = function( fixture, contract_params ) {
	describe( 'Should behave like ERC721BaseMetadata', function() {
		let contract_deployer_address
		let contract_deployer

		let token_owner_address
		let token_owner

		let proxy_user_address
		let proxy_user

		let wl_user1_address
		let wl_user1

		let wl_user2_address
		let wl_user2

		let contract_address
		let contract

		let user1_address
		let user1

		let user2_address
		let user2

		let addrs
		let holder_artifact

		before( async function() {
			[
				x,
				token_owner,
				proxy_user,
				wl_user1,
				wl_user2,
				user1,
				user2,
				...addrs
			] = await ethers.getSigners()

			token_owner_address = token_owner.address
			proxy_user_address = proxy_user.address
			wl_user1_address = wl_user1.address
			wl_user2_address = wl_user2.address
			user1_address = user1.address
			user2_address = user2.address
		})

		beforeEach( async function() {
			const { test_contract, test_contract_deployer } = await loadFixture( fixture )
			contract = test_contract
			contract_deployer = test_contract_deployer
			contract_deployer_address = test_contract_deployer.address
			contract_address = test_contract.address
		})


		describe( 'Correct input ...', function() {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				it( 'Contract should support IERC721Metadata', async function() {
					expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC721Metadata ) ).to.be.true
				})

				describe( CONTRACT.METHODS.name.SIGNATURE, function() {
					if ( TEST.METHODS.name ) {
						it( 'Name should be "' + contract_params.CONSTRUCT.name_ + '"', async function() {
							expect( await contract.name() ).to.equal( contract_params.CONSTRUCT.name_ )
						})
					}
				})

				describe( CONTRACT.METHODS.symbol.SIGNATURE, function() {
					if ( TEST.METHODS.symbol ) {
						it( 'Symbol should be "' + contract_params.CONSTRUCT.symbol_ + '"', async function() {
							expect( await contract.symbol() ).to.equal( contract_params.CONSTRUCT.symbol_ )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenURI.SIGNATURE, function() {
					if ( TEST.METHODS.tokenURI ) {
						beforeEach( async function() {
							await contract.connect( token_owner ).mint()
						})

						it( 'Unminted token URI should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function() {
							await expect( contract.tokenURI( contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})

						it( 'First token URI should be "' + contract_params.INIT_SUPPLY + '"', async function() {
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY.toString() )
						})

						it( 'Second token URI should be "' + ( contract_params.INIT_SUPPLY + 1 ).toString() + '"', async function() {
							await contract.connect( token_owner ).mint()
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY + 1 ) ).to.equal( ( contract_params.INIT_SUPPLY + 1 ).toString() )
						})
					}
				})

				describe( CONTRACT.METHODS.setBaseURI.SIGNATURE, function() {
					if ( TEST.METHODS.setBaseURI ) {
						it( 'First token URI should now be "' + contract_params.BASE_URI + contract_params.INIT_SUPPLY + '"', async function() {
							await contract.connect( token_owner ).mint()
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY.toString() )
							await contract.setBaseURI( contract_params.BASE_URI )
							expect( await contract.tokenURI( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.BASE_URI + contract_params.INIT_SUPPLY )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', function() {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async function() {
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

				Object.entries( CONTRACT.METHODS ).forEach( function( [ prop, val ] ) {
					describe( val.SIGNATURE, function() {
						const testSuite = getTestCasesByFunction( val.SIGNATURE, val.PARAMS )

						testSuite.forEach( testCase => {
							it( testCase.test_description, async function() {
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
