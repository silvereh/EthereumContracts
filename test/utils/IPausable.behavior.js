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
		SaleStateChanged : true,
	},
	METHODS : {
		saleState     : true,
		setSaleState  : true,
		saleIsClosed  : true,
		presaleIsOpen : true,
		saleIsOpen    : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		SaleStateChanged : 'SaleStateChanged(uint8,uint8)',
	},
	METHODS : {
		saleState     : {
			SIGNATURE : 'saleState()',
			PARAMS    : [],
		},
		setSaleState  : {
			SIGNATURE : 'setSaleState(uint8)',
			PARAMS    : [ 'newState_' ],
		},
		saleIsClosed  : {
			SIGNATURE : 'saleIsClosed()',
			PARAMS    : [],
		},
		presaleIsOpen : {
			SIGNATURE : 'presaleIsOpen()',
			PARAMS    : [],
		},
		saleIsOpen    : {
			SIGNATURE : 'saleIsOpen()',
			PARAMS    : [],
		},
	},
}

const SALE_STATE = {
	CLOSED      : 0,
	PRESALE     : 1,
	SALE        : 2,
}

const shouldBehaveLikeIPausable = ( contract_name, contract_params ) => {
	describe( 'Should behave like IPausable', () => {
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
				describe( 'Default sale state is CLOSED', () => {
					describe( CONTRACT.METHODS.saleState.SIGNATURE, () => {
						if ( TEST.METHODS.saleState ) {
							it( 'Should be ' + SALE_STATE.CLOSED, async () => {
								expect( await contract.saleState() ).to.equal( SALE_STATE.CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsClosed.SIGNATURE, () => {
						if ( TEST.METHODS.saleIsClosed ) {
							it( 'Should be true', async () => {
								expect( await contract.saleIsClosed() ).to.be.true
							})
						}
					})

					describe( CONTRACT.METHODS.presaleIsOpen.SIGNATURE, () => {
						if ( TEST.METHODS.presaleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_PRESALE_CLOSED, async () => {
								await expect( contract.presaleIsOpen() ).to.be.revertedWith( ERROR.IPausable_PRESALE_CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsOpen.SIGNATURE, () => {
						if ( TEST.METHODS.saleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_SALE_CLOSED, async () => {
								await expect( contract.saleIsOpen() ).to.be.revertedWith( ERROR.IPausable_SALE_CLOSED )
							})
						}
					})
				})

				describe( CONTRACT.METHODS.setSaleState.SIGNATURE, () => {
					describe( CONTRACT.EVENTS.SaleStateChanged, () => {
						if ( TEST.EVENTS.SaleStateChanged ) {
							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is CLOSED and the new state is PRESALE', async () => {
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.CLOSED, SALE_STATE.PRESALE )
							})

							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is CLOSED and the new state is SALE', async () => {
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.CLOSED, SALE_STATE.SALE )
							})

							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is PRESALE and the new state is SALE', async () => {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE )
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.PRESALE, SALE_STATE.SALE )
							})
						}
					})

					if ( TEST.METHODS.setSaleState ) {
						describe( 'Setting the sale state to PRESALE', () => {
							beforeEach( async () => {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE )
							})

							it( 'Should be ' + SALE_STATE.PRESALE, async () => {
								expect( await contract.saleState() ).to.equal( SALE_STATE.PRESALE )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async () => {
								await expect( contract.saleIsClosed() ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_CLOSED )
							})

							it( 'Should be true', async () => {
								expect( await contract.presaleIsOpen() ).to.be.true
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_CLOSED, async () => {
								await expect( contract.saleIsOpen() ).to.be.revertedWith( ERROR.IPausable_SALE_CLOSED )
							})
						})

						describe( 'Setting the sale state to SALE', () => {
							beforeEach( async () => {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE )
							})

							it( 'Should be ' + SALE_STATE.SALE, async () => {
								expect( await contract.saleState() ).to.equal( SALE_STATE.SALE )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async () => {
								await expect( contract.saleIsClosed() ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_CLOSED )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_PRESALE_CLOSED, async () => {
								await expect( contract.presaleIsOpen() ).to.be.revertedWith( ERROR.IPausable_PRESALE_CLOSED )
							})

							it( 'Should be true', async () => {
								expect( await contract.saleIsOpen() ).to.be.true
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
					defaultArgs [ CONTRACT.METHODS.saleState.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs [ CONTRACT.METHODS.setSaleState.SIGNATURE ] = {
						err  : null,
						args : [
							SALE_STATE.SALE,
						],
					}
					defaultArgs [ CONTRACT.METHODS.saleIsClosed.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs [ CONTRACT.METHODS.presaleIsOpen.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs [ CONTRACT.METHODS.saleIsOpen.SIGNATURE ] = {
						err  : null,
						args : [],
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

module.exports = { shouldBehaveLikeIPausable }
