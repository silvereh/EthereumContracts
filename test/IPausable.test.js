const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { generateFailTest, enumCases } = require( './test-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IPausable',
	CONTRACT : true,
	USE_CASES : {
		READING     : true,
		WRITING     : true,
		WRONG_INPUT : true,
	},
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
}

// For contract data
const CONTRACT = {
	NAME : 'MockIPausable',
	EVENTS : {
		SaleStateChanged : 'SaleStateChanged(uint8,uint8)',
	},
	METHODS : {
		saleState     : 'saleState()',
		setSaleState  : 'setSaleState(uint8)',
		saleIsClosed  : 'saleIsClosed()',
		presaleIsOpen : 'presaleIsOpen()',
		saleIsOpen    : 'saleIsOpen()',
	},
	PARAMS : {
	},
}

// For expected reverted errors
const ERROR = {
	IPausable_SALE_NOT_CLOSED : 'IPausable_SALE_NOT_CLOSED',
	IPausable_SALE_CLOSED     : 'IPausable_SALE_CLOSED',
	IPausable_PRESALE_CLOSED  : 'IPausable_PRESALE_CLOSED',
}

// For expected thrown errors
const THROW = {
	MISSING_ARGUMENT         : /missing argument/,
	UNEXPECTED_ARGUMENT      : /too many arguments/,
	INCORRECT_DATA_LENGTH    : /incorrect data length/,
	INVALID_ADDRESS          : /invalid address/,
	INVALID_ADDRESS_OR_ENS   : /invalid address or ENS name/,
	INVALID_ADDRESS_STR      : /resolver or addr is not configured for ENS name/,
	INVALID_BIG_NUMBER_STR   : /invalid BigNumber string/,
	INVALID_BIG_NUMBER_VALUE : /invalid BigNumber value/,
	INVALID_ARRAYIFY_VALUE   : /invalid arrayify value/,
	OVERFLOW                 : /overflow/,
	UNDERFLOW                : /underflow/,
	OUT_OF_GAS               : /out of gas/,
	STRING_ARRAY             : /str.charCodeAt is not a function/,
	VALUE_OUT_OF_BOUNDS      : /value out-of-bounds/,
}

// For common constants
const CST = {
	ETH          : ethers.constants.EtherSymbol,
	ONE_ETH      : ethers.constants.WeiPerEther,
	ADDRESS_ZERO : ethers.constants.AddressZero,
	HASH_ZERO    : ethers.constants.HashZero,
	NUMBER_ZERO  : ethers.constants.Zero,
	NUMBER_ONE   : ethers.constants.One,
	NUMBER_TWO   : ethers.constants.Two,
	MAX_UINT256  : ethers.constants.MaxUint256,
	INTERFACE_ID : {
		IERC165           : '0x01ffc9a7',
		IERC2981          : '0x2a55205a',
		IERC721           : '0x80ac58cd',
		IERC721Metadata   : '0x5b5e139f',
		IERC721Enumerable : '0x780e9d63',
		INVALID           : '0xffffffff',
		NULL              : '0x00000000',
	},
}

const SALE_STATE = {
	CLOSED      : 0,
	PRESALE     : 1,
	SALE        : 2,
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
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

			contract_artifact = await ethers.getContractFactory( CONTRACT.NAME )
		})

		beforeEach( async () => {
			contract = await contract_artifact.deploy(
				// contract constructor parameters
			)
			await contract.deployed()
			contract_address = contract.address
		})

		describe( 'Reading ...', () => {
			if ( TEST.USE_CASES.READING ) {
				describe( 'Default sale state is CLOSED', () => {
					describe( CONTRACT.METHODS.saleState, () => {
						if ( TEST.METHODS.saleState ) {
							it( 'Should be ' + SALE_STATE.CLOSED, async () => {
								expect( await contract.saleState() ).to.equal( SALE_STATE.CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsClosed, () => {
						if ( TEST.METHODS.saleIsClosed ) {
							it( 'Should be true', async () => {
								expect( await contract.saleIsClosed() ).to.be.true
							})
						}
					})

					describe( CONTRACT.METHODS.presaleIsOpen, () => {
						if ( TEST.METHODS.presaleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_PRESALE_CLOSED, async () => {
								await expect( contract.presaleIsOpen() ).to.be.revertedWith( ERROR.IPausable_PRESALE_CLOSED )
							})
						}
					})

					describe( CONTRACT.METHODS.saleIsOpen, () => {
						if ( TEST.METHODS.saleIsOpen ) {
							it( 'Should be reverted with ' + ERROR.IPausable_SALE_CLOSED, async () => {
								await expect( contract.saleIsOpen() ).to.be.revertedWith( ERROR.IPausable_SALE_CLOSED )
							})
						}
					})
				})
			}
		})

		describe( 'Writing ...', () => {
			if ( TEST.USE_CASES.WRITING ) {
				describe( CONTRACT.METHODS.setSaleState, () => {
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

		describe( 'Wrong input ...', () => {
			if ( TEST.USE_CASES.WRONG_INPUT ) {
				describe( 'Reading ...', () => {
					if ( TEST.USE_CASES.READING ) {
						describe( CONTRACT.METHODS.saleState, () => {
							if ( TEST.METHODS.saleState ) {
								it( 'Input more than 0 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									await expect( contract.saleState( 1 ) ).to.be.rejectedWith( THROW.UNEXPECTED_ARGUMENT )
								})
							}
						})

						describe( CONTRACT.METHODS.saleIsClosed, () => {
							if ( TEST.METHODS.saleIsClosed ) {
								it( 'Input more than 0 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									await expect( contract.saleIsClosed( 1 ) ).to.be.rejectedWith( THROW.UNEXPECTED_ARGUMENT )
								})
							}
						})

						describe( CONTRACT.METHODS.presaleIsOpen, () => {
							if ( TEST.METHODS.presaleIsOpen ) {
								it( 'Input more than 0 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									await expect( contract.presaleIsOpen( 1 ) ).to.be.rejectedWith( THROW.UNEXPECTED_ARGUMENT )
								})
							}
						})

						describe( CONTRACT.METHODS.saleIsOpen, () => {
							if ( TEST.METHODS.saleIsOpen ) {
								it( 'Input more than 0 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									await expect( contract.saleIsOpen( 1 ) ).to.be.rejectedWith( THROW.UNEXPECTED_ARGUMENT )
								})
							}
						})
					}
				})

				describe( 'Writing ...', () => {
					if ( TEST.USE_CASES.WRITING ) {
						describe( CONTRACT.METHODS.setSaleState, () => {
							if ( TEST.METHODS.setSaleState ) {
								const arg1Tests = enumCases( 'newOwner_' )

								it( 'Input less than 1 argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.setSaleState )
								})

								it( 'Input more than 1 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : SALE_STATE.SALE,
										arg3 : 1,
									}
									await generateFailTest( contract.setSaleState, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
										}
										await generateFailTest( contract.setSaleState, args )
									})
								})
							}
						})
					}
				})
			}
		})
	}
})
