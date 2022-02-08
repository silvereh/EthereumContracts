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
	EVENTS : {
	},
	METHODS : {
		burn     : true,
		burnFrom : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		Transfer : 'Transfer',
	},
	METHODS : {
		burn     : {
			SIGNATURE : 'burn(uint256)',
			PARAMS    : [ 'amount_' ],
		},
		burnFrom : {
			SIGNATURE : 'burnFrom(address,uint256)',
			PARAMS    : [ 'owner_', 'amount_' ],
		},
	},
}

const shouldBehaveLikeERC20BaseBurnable = function( fixture, contract_params ) {
	describe( 'Should behave like ERC20BaseBurnable', function() {
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
				beforeEach( async function() {
					await contract.mint( token_owner_address, 1 )
				})

				describe( CONTRACT.METHODS.burn.SIGNATURE, function() {
					if ( TEST.METHODS.burn ) {
						it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC20_INSUFFICIENT_BALANCE, async function() {
							await expect( contract.connect( token_owner ).burn( 2 ) ).to.be.revertedWith( ERROR.IERC20_INSUFFICIENT_BALANCE )
						})

						it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning a token was transfered from ' + token_owner_name + ' to the null address', async function() {
							await expect( contract.connect( token_owner ).burn( 1 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, CST.ADDRESS_ZERO, 1 )
						})

						it( 'Burning of token should be successful', async function() {
							await contract.connect( token_owner ).burn( 1 )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.burnFrom.SIGNATURE, function() {
					if ( TEST.METHODS.burnFrom ) {
						it( 'Trying to burn from a token owner while not allowed should be reverted with ' + ERROR.IERC20_CALLER_NOT_ALLOWED, async function() {
							await expect( contract.connect( user1 ).burnFrom( token_owner_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_CALLER_NOT_ALLOWED )
						})

						it( 'Burning of token should be successful', async function() {
							await contract.connect( token_owner ).approve( user1_address, 2 )
							await contract.connect( user1 ).burnFrom( token_owner_address, 1 )
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', function() {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async function() {
					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.burn.SIGNATURE ] = {
						err  : null,
						args : [
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.burnFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							10,
						]
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

module.exports = { shouldBehaveLikeERC20BaseBurnable }
