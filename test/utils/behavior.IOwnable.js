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
		OwnershipTransferred : true,
	},
	METHODS : {
		owner             : true,
		transferOwnership : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		OwnershipTransferred : 'OwnershipTransferred',
	},
	METHODS : {
		owner : {
			SIGNATURE : 'owner()',
			PARAMS    : [],
		},
		transferOwnership : {
			SIGNATURE : 'transferOwnership(address)',
			PARAMS    : [ 'newOwner_' ],
		},
	},
}

const shouldBehaveLikeIOwnable = ( fixture, contract_name ) => {
	describe( 'Should behave like IOwnable', function() {
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
				describe( CONTRACT.METHODS.owner.SIGNATURE, function() {
					if ( TEST.METHODS.owner ) {
						it( 'Contract owner should be ' + contract_deployer_name, async function() {
							expect( await contract.owner() ).to.equal( contract_deployer_address )
						})
					}
				})

				describe( CONTRACT.METHODS.transferOwnership.SIGNATURE, function() {
					if ( TEST.METHODS.transferOwnership ) {
						it( 'Regular user trying to transfer contract ownership should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async function() {
							await expect( contract.connect( user1 ).transferOwnership( user1_address ) ).to.be.revertedWith( ERROR.IOwnable_NOT_OWNER )
						})

						describe( 'Contract owner trying to transfer ownership', function() {
							describe( 'To another user', function() {
								if ( TEST.EVENTS.OwnershipTransferred ) {
									it( 'Contract should emit an "' + CONTRACT.EVENTS.OwnershipTransferred + '" event mentioning that ' + user1_name + ' is now the owner of the contract', async function() {
										await expect( contract.connect( contract_deployer ).transferOwnership( user1_address ) ).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred ).withArgs( contract_deployer_address, user1_address )
									})
								}

								it( 'Contract owner should now be User1', async function() {
									await contract.connect( contract_deployer ).transferOwnership( user1_address )
									expect( await contract.owner() ).to.equal( user1_address )
								})
							})

							describe( 'To null address', function() {
								if ( TEST.EVENTS.OwnershipTransferred ) {
									it( 'Contract should emit an "' + CONTRACT.EVENTS.OwnershipTransferred + '" event mentioning that ' + CST.ADDRESS_ZERO + ' is now the owner of the contract', async function() {
										await expect( contract.connect( contract_deployer ).transferOwnership( CST.ADDRESS_ZERO ) ).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred ).withArgs( contract_deployer_address, CST.ADDRESS_ZERO )
									})
								}

								it( 'Contract owner should now be ' + CST.ADDRESS_ZERO, async function() {
									await contract.connect( contract_deployer ).transferOwnership( CST.ADDRESS_ZERO )
									expect( await contract.owner() ).to.equal( CST.ADDRESS_ZERO )
								})
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
					defaultArgs [ CONTRACT.METHODS.owner.SIGNATURE ] = {
						err  : null,
						args : []
					}
					defaultArgs [ CONTRACT.METHODS.transferOwnership.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
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

module.exports = {
	shouldBehaveLikeIOwnable,
}
