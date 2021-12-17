const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const {
	generateFailTest,
	addressCases,
	bytes32Cases,
	booleanCases,
	uintCases
} = require( '../test-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'IWhitelisted',
	CONTRACT : true,
	USE_CASES : {
		READING     : true,
		WRITING     : true,
		WRONG_INPUT : true,
	},
	EVENTS : {
	},
	METHODS : {
		setWhitelist            : true,
		checkWhitelistAllowance : true,
		consumeWhitelist        : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'MockIWhitelisted',
	EVENTS : {
	},
	METHODS : {
		setWhitelist            : 'setWhitelist(bytes32,uint256)',
		checkWhitelistAllowance : 'checkWhitelistAllowance(address,bytes32,bool)',
		consumeWhitelist        : 'consumeWhitelist(address,uint256,bytes32,bool)',
	},
	PARAMS : {
		PASS_ROOT : ethers.BigNumber.from( '0xcf5ce81531095391e96302b4ec6ec1f49c1928610a7726678f84245d26dc4803' ),
		PASS_MAX  : 3,
	},
}

// For expected reverted errors
const ERROR = {
	IWhitelisted_NOT_SET      : 'IWhitelisted_NOT_SET',
	IWhitelisted_CONSUMED     : 'IWhitelisted_CONSUMED',
	IWhitelisted_FORBIDDEN    : 'IWhitelisted_FORBIDDEN',
	IWhitelisted_NO_ALLOWANCE : 'IWhitelisted_NO_ALLOWANCE',
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

const generatePass = ( address, root ) => {
	const addr = ethers.BigNumber.from( ethers.utils.keccak256( address ) )
	const temp = ethers.BigNumber.from( ethers.BigNumber.from( root ).sub( addr ) )
	const flag = temp.gt( CST.NUMBER_ZERO ) ? false : true
	const pass = temp.gt( CST.NUMBER_ZERO ) ? temp : ethers.BigNumber.from( addr.sub( root ) )

	return { pass: pass, flag: flag }
}

describe( TEST.NAME, () => {
	if ( TEST.CONTRACT ) {
		let contract_deployer_name = 'ContractDeployer'
		let token_owner_name = 'TokenOwner'
		let proxy_user_name = 'ProxyUser'
		let wl_user1_name = 'WhitelistedUser1'
		let wl_user2_name = 'WhitelistedUser2'
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

		let wl_user1_pass
		let wl_user2_pass
		let user1_pass
		let user2_pass

		let wl_user1_flag
		let wl_user2_flag
		let user1_flag
		let user2_flag

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

			let newPass = generatePass( wl_user1_address, CONTRACT.PARAMS.PASS_ROOT )
			wl_user1_pass = newPass.pass
			wl_user1_flag = newPass.flag

			newPass = generatePass( wl_user2_address, CONTRACT.PARAMS.PASS_ROOT )
			wl_user2_pass = newPass.pass
			wl_user2_flag = newPass.flag

			newPass = generatePass( user1_address, CONTRACT.PARAMS.PASS_ROOT )
			user1_pass = newPass.pass
			user1_flag = newPass.flag

			newPass = generatePass( user2_address, CONTRACT.PARAMS.PASS_ROOT )
			user2_pass = newPass.pass
			user2_flag = newPass.flag

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
				describe( CONTRACT.METHODS.checkWhitelistAllowance, () => {
					if ( TEST.METHODS.checkWhitelistAllowance ) {
						it( 'Checking whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelisted_NOT_SET, async () => {
							await expect( contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelisted_NOT_SET )
						})
					}
				})
			}
		})

		describe( 'Writing ...', () => {
			if ( TEST.USE_CASES.WRITING ) {
				describe( CONTRACT.METHODS.consumeWhitelist, () => {
					if ( TEST.METHODS.consumeWhitelist ) {
						it( 'Trying to consume whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelisted_FORBIDDEN, async () => {
							await expect( contract.consumeWhitelist( wl_user1_address, 1, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelisted_FORBIDDEN )
						})
					}
				})

				describe( CONTRACT.METHODS.setWhitelist, () => {
					if ( TEST.METHODS.setWhitelist ) {
						it( 'Trying to set a whitelist with no allowance should be reverted with ' + ERROR.IWhitelisted_NO_ALLOWANCE, async () => {
							await expect( contract.setWhitelist( CONTRACT.PARAMS.PASS_ROOT, 0 ) ).to.be.revertedWith( ERROR.IWhitelisted_NO_ALLOWANCE )
						})

						describe( 'Setting up the whitelist', () => {
							beforeEach( async () => {
								await contract.setWhitelist( CONTRACT.PARAMS.PASS_ROOT.toHexString(), CONTRACT.PARAMS.PASS_MAX )
							})

							describe( CONTRACT.METHODS.checkWhitelistAllowance, () => {
								if ( TEST.METHODS.checkWhitelistAllowance ) {
									it( 'Checking whitelist with correct password should return ' + CONTRACT.PARAMS.PASS_MAX, async() => {
										expect( await contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.equal( CONTRACT.PARAMS.PASS_MAX )
									})

									it( 'Checking whitelist with incorrect password should be reverted with ' + ERROR.IWhitelisted_FORBIDDEN, async () => {
										await expect( contract.checkWhitelistAllowance( wl_user1_address, user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelisted_FORBIDDEN )
									})
								}
							})

							describe( CONTRACT.METHODS.consumeWhitelist, () => {
								if ( TEST.METHODS.consumeWhitelist ) {
									describe( 'Consuming 1 whitelist spot', () => {
										beforeEach( async () => {
											await contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, 1, wl_user1_pass, wl_user1_flag )
										})

										it( 'Whitelist check should return ' + ( CONTRACT.PARAMS.PASS_MAX - 1 ).toString(), async () => {
											expect( await contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.equal( CONTRACT.PARAMS.PASS_MAX - 1 )
										})

										it( 'Trying to consume an additional ' + CONTRACT.PARAMS.PASS_MAX + ' whitelist spots should be reverted with ' + ERROR.IWhitelisted_FORBIDDEN, async () => {
											await expect( contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, CONTRACT.PARAMS.PASS_MAX, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelisted_FORBIDDEN )
										})
									})

									describe( 'Consuming ' + CONTRACT.PARAMS.PASS_MAX + ' whitelist spots', () => {
										beforeEach( async () => {
											await contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, CONTRACT.PARAMS.PASS_MAX, wl_user1_pass, wl_user1_flag )
										})

										it( 'Whitelist check should be reverted with ' + ERROR.IWhitelisted_CONSUMED, async () => {
											await expect( contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelisted_CONSUMED )
										})
									})
								}
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
						beforeEach( async () => {
							await contract.setWhitelist( CONTRACT.PARAMS.PASS_ROOT.toHexString(), CONTRACT.PARAMS.PASS_MAX )
						})

						describe( CONTRACT.METHODS.checkWhitelistAllowance, () => {
							if ( TEST.METHODS.checkWhitelistAllowance ) {
								const arg1Tests = addressCases( 'account_' )
								const arg2Tests = bytes32Cases( 'proof_' )
								const arg3Tests = booleanCases( 'flag_' )

								it( 'Input less than 3 arguments should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.checkWhitelistAllowance )
								})

								it( 'Input more than 3 arguments should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : wl_user1_address,
										arg2 : wl_user1_pass,
										arg3 : wl_user1_flag,
										arg4 : 1,
									}
									await generateFailTest( contract.checkWhitelistAllowance, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : wl_user1_pass,
											arg3 : wl_user1_flag,
										}
										await generateFailTest( contract.checkWhitelistAllowance, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : wl_user1_address,
											arg2 : testVar,
											arg3 : wl_user1_flag,
										}
										await generateFailTest( contract.checkWhitelistAllowance, args )
									})
								})

								arg3Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : wl_user1_address,
											arg2 : wl_user1_pass,
											arg3 : testVar,
										}
										await generateFailTest( contract.checkWhitelistAllowance, args )
									})
								})
							}
						})
					}
				})

				describe( 'Writing ...', () => {
					if ( TEST.USE_CASES.WRITING ) {
						describe( CONTRACT.METHODS.setWhitelist, () => {
							if ( TEST.METHODS.setWhitelist ) {
								const arg1Tests = bytes32Cases( 'root_' )
								const arg2Tests = uintCases( 'passMax_' )

								it( 'Input less than 2 arguments should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.MISSING_ARGUMENT,
									}
									await generateFailTest( contract.setWhitelist, args )
								})

								it( 'Input more than 2 arguments should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : CONTRACT.PARAMS.PASS_ROOT,
										arg2 : CONTRACT.PARAMS.PASS_MAX,
										arg3 : 1,
									}
									await generateFailTest( contract.setWhitelist, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : CONTRACT.PARAMS.PASS_MAX,
										}
										await generateFailTest( contract.setWhitelist, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : CONTRACT.PARAMS.PASS_ROOT,
											arg2 : testVar,
										}
										await generateFailTest( contract.setWhitelist, args )
									})
								})
							}
						})

						describe( CONTRACT.METHODS.consumeWhitelist, () => {
							if ( TEST.METHODS.consumeWhitelist ) {
								const arg1Tests = addressCases( 'account_' )
								const arg2Tests = uintCases( 'qty_' )
								const arg3Tests = bytes32Cases( 'proof_' )
								const arg4Tests = booleanCases( 'flag_' )

								it( 'Input less than 4 argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.consumeWhitelist )
								})

								it( 'Input more than 4 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : wl_user1_address,
										arg2 : 1,
										arg3 : wl_user1_pass,
										arg4 : wl_user1_flag,
										arg5 : 1,
									}
									await generateFailTest( contract.consumeWhitelist, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : 1,
											arg3 : wl_user1_pass,
											arg4 : wl_user1_flag,
										}
										await generateFailTest( contract.consumeWhitelist, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : wl_user1_address,
											arg2 : testVar,
											arg3 : wl_user1_pass,
											arg4 : wl_user1_flag,
										}
										await generateFailTest( contract.consumeWhitelist, args )
									})
								})

								arg3Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : wl_user1_address,
											arg2 : 1,
											arg3 : testVar,
											arg4 : wl_user1_flag,
										}
										await generateFailTest( contract.consumeWhitelist, args )
									})
								})

								arg4Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : wl_user1_address,
											arg2 : 1,
											arg3 : wl_user1_pass,
											arg4 : testVar,
										}
										await generateFailTest( contract.consumeWhitelist, args )
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
