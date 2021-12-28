const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { getTestCasesByFunction, generateFailTest, generateTestCase } = require( '../fail-test-module' )
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

const shouldBehaveLikeIOwnable = ( contract_name, contract_params ) => {
	describe( 'Should behave like IOwnable', () => {
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
				describe( CONTRACT.METHODS.owner.SIGNATURE, () => {
					if ( TEST.METHODS.owner ) {
						it( 'Contract owner should be ' + contract_deployer_name, async () => {
							expect( await contract.owner() ).to.equal( contract_deployer_address )
						})
					}
				})

				describe( CONTRACT.METHODS.transferOwnership.SIGNATURE, () => {
					if ( TEST.METHODS.transferOwnership ) {
						it( 'Regular user trying to transfer contract ownership should be reverted with ' + ERROR.IOwnable_NOT_OWNER, async () => {
							await expect( contract.connect( user1 ).transferOwnership( user1_address ) ).to.be.revertedWith( ERROR.IOwnable_NOT_OWNER )
						})

						describe( 'Contract owner trying to transfer ownership', () => {
							describe( 'To another user', () => {
								if ( TEST.EVENTS.OwnershipTransferred ) {
									it( 'Contract should emit an "' + CONTRACT.EVENTS.OwnershipTransferred + '" event mentioning that ' + user1_name + ' is now the owner of the contract', async () => {
										await expect( contract.connect( contract_deployer ).transferOwnership( user1_address ) ).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred ).withArgs( contract_deployer_address, user1_address )
									})
								}

								it( 'Contract owner should now be User1', async () => {
									await contract.connect( contract_deployer ).transferOwnership( user1_address )
									expect( await contract.owner() ).to.equal( user1_address )
								})
							})

							describe( 'To null address', () => {
								if ( TEST.EVENTS.OwnershipTransferred ) {
									it( 'Contract should emit an "' + CONTRACT.EVENTS.OwnershipTransferred + '" event mentioning that ' + CST.ADDRESS_ZERO + ' is now the owner of the contract', async () => {
										await expect( contract.connect( contract_deployer ).transferOwnership( CST.ADDRESS_ZERO ) ).to.emit( contract, CONTRACT.EVENTS.OwnershipTransferred ).withArgs( contract_deployer_address, CST.ADDRESS_ZERO )
									})
								}

								it( 'Contract owner should now be ' + CST.ADDRESS_ZERO, async () => {
									await contract.connect( contract_deployer ).transferOwnership( CST.ADDRESS_ZERO )
									expect( await contract.owner() ).to.equal( CST.ADDRESS_ZERO )
								})
							})
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
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
	shouldBehaveLikeIOwnable,
}
