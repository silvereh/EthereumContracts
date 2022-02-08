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

const shouldBehaveLikeIPausable = ( fixture, contract_name ) => {
	describe( 'Should behave like IPausable', function() {
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
				describe( 'Default sale state is CLOSED', function() {
					describe( CONTRACT.METHODS.saleState.SIGNATURE, function() {
						if ( TEST.METHODS.saleState ) {
							it( 'Should be ' + SALE_STATE.CLOSED, async function() {
								expect( await contract.saleState() ).to.equal( SALE_STATE.CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsClosed.SIGNATURE, function() {
						if ( TEST.METHODS.saleIsClosed ) {
							it( 'Should be true', async function() {
								expect( await contract.saleIsClosed() ).to.be.true
							})
						}
					})

					describe( CONTRACT.METHODS.presaleIsOpen.SIGNATURE, function() {
						if ( TEST.METHODS.presaleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_PRESALE_CLOSED, async function() {
								await expect( contract.presaleIsOpen() ).to.be.revertedWith( ERROR.IPausable_PRESALE_CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsOpen.SIGNATURE, function() {
						if ( TEST.METHODS.saleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_SALE_CLOSED, async function() {
								await expect( contract.saleIsOpen() ).to.be.revertedWith( ERROR.IPausable_SALE_CLOSED )
							})
						}
					})
				})

				describe( CONTRACT.METHODS.setSaleState.SIGNATURE, function() {
					describe( CONTRACT.EVENTS.SaleStateChanged, function() {
						if ( TEST.EVENTS.SaleStateChanged ) {
							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is CLOSED and the new state is PRESALE', async function() {
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.CLOSED, SALE_STATE.PRESALE )
							})

							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is CLOSED and the new state is SALE', async function() {
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.CLOSED, SALE_STATE.SALE )
							})

							it( 'Contract should emit a "' + CONTRACT.EVENTS.SaleStateChanged + '" event mentioning the old statse is PRESALE and the new state is SALE', async function() {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE )
								await expect( contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE ) ).to.emit( contract, CONTRACT.EVENTS.SaleStateChanged ).withArgs( SALE_STATE.PRESALE, SALE_STATE.SALE )
							})
						}
					})

					if ( TEST.METHODS.setSaleState ) {
						describe( 'Setting the sale state to PRESALE', function() {
							beforeEach( async function() {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.PRESALE )
							})

							it( 'Should be ' + SALE_STATE.PRESALE, async function() {
								expect( await contract.saleState() ).to.equal( SALE_STATE.PRESALE )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function() {
								await expect( contract.saleIsClosed() ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_CLOSED )
							})

							it( 'Should be true', async function() {
								expect( await contract.presaleIsOpen() ).to.be.true
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_CLOSED, async function() {
								await expect( contract.saleIsOpen() ).to.be.revertedWith( ERROR.IPausable_SALE_CLOSED )
							})
						})

						describe( 'Setting the sale state to SALE', function() {
							beforeEach( async function() {
								await contract.connect( contract_deployer ).setSaleState( SALE_STATE.SALE )
							})

							it( 'Should be ' + SALE_STATE.SALE, async function() {
								expect( await contract.saleState() ).to.equal( SALE_STATE.SALE )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_SALE_NOT_CLOSED, async function() {
								await expect( contract.saleIsClosed() ).to.be.revertedWith( ERROR.IPausable_SALE_NOT_CLOSED )
							})

							it( 'Should be reverted with ' + ERROR.IPausable_PRESALE_CLOSED, async function() {
								await expect( contract.presaleIsOpen() ).to.be.revertedWith( ERROR.IPausable_PRESALE_CLOSED )
							})

							it( 'Should be true', async function() {
								expect( await contract.saleIsOpen() ).to.be.true
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

module.exports = { shouldBehaveLikeIPausable }
