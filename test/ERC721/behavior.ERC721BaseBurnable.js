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
		burn  : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	METHODS : {
		burn : {
			SIGNATURE : 'burn(uint256)',
			PARAMS    : [ 'owner_', 'tokenId_' ],
		},
	},
}

const shouldBehaveLikeERC721BaseBurnable = function( fixture, contract_params ) {
	describe( 'Should behave like ERC721BaseBurnable', function() {
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
				describe( CONTRACT.METHODS.burn.SIGNATURE, function() {
					if ( TEST.METHODS.burn ) {
						beforeEach( async function() {
							await contract.connect( token_owner ).mint()
						})

						it( 'Trying to burn a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function() {
							await expect( contract.connect( token_owner ).burn( contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})

						it( 'Trying to burn a token not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async function() {
							await expect( contract.connect( user1 ).burn( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
						})

						describe( 'Burning of token ' + contract_params.INIT_SUPPLY + ' owned', function() {
							beforeEach( async function() {
								await contract.connect( token_owner ).approve( user1_address, 0 )
								await contract.connect( user1 ).burn( contract_params.INIT_SUPPLY )
							})

							it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function() {
								await expect( contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
							})

							it( 'Balance of ' + token_owner_name + ' should now be 0', async function() {
								expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							})

							it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async function() {
								await expect( contract.getApproved( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
							})
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', function() {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async function() {
					defaultArgs = {}
					defaultArgs[ CONTRACT.METHODS.burn.SIGNATURE ] = {
						err  : null,
						args : [
							0,
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
	shouldBehaveLikeERC721BaseBurnable,
}
