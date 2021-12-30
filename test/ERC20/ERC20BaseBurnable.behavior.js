const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC20Base } = require( './ERC20Base.behavior' )
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

const shouldBehaveLikeERC20BaseBurnable = ( contract_name, contract_params ) => {
	shouldBehaveLikeERC20Base( contract_name, contract_params )

	describe( 'Should behave like ERC20BaseBurnable', () => {
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
				beforeEach( async () => {
					await contract.mint( token_owner_address, 1 )
				})

				describe( CONTRACT.METHODS.burn.SIGNATURE, () => {
					if ( TEST.METHODS.burn ) {
						it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC20_INSUFFICIENT_BALANCE, async () => {
							await expect( contract.connect( token_owner ).burn( 2 ) ).to.be.revertedWith( ERROR.IERC20_INSUFFICIENT_BALANCE )
						})

						it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning a token was transfered from ' + token_owner_name + ' to the null address', async () => {
							await expect( contract.connect( token_owner ).burn( 1 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, CST.ADDRESS_ZERO, 1 )
						})

						it( 'Burning of token should be successful', async () => {
							await contract.connect( token_owner ).burn( 1 )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.burnFrom.SIGNATURE, () => {
					if ( TEST.METHODS.burnFrom ) {
						it( 'Trying to burn from a token owner while not allowed should be reverted with ' + ERROR.IERC20_CALLER_NOT_ALLOWED, async () => {
							await expect( contract.connect( user1 ).burnFrom( token_owner_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_CALLER_NOT_ALLOWED )
						})

						it( 'Burning of token should be successful', async () => {
							await contract.connect( token_owner ).approve( user1_address, 2 )
							await contract.connect( user1 ).burnFrom( token_owner_address, 1 )
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
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

module.exports = { shouldBehaveLikeERC20BaseBurnable }
