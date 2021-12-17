const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const methodName = (
	addressVar,
	bytes4Var,
	bytes32Var,
	bytesArrayVar,
	booleanVar,
	stringVar,
	uintVar,
	enumVar
) => {}

const {
	addressCases,
	bytes4Cases,
	bytes32Cases,
	bytesArrayCases,
	booleanCases,
	stringCases,
	uintCases,
	enumCases,
	generateFailTest,
} = require( './test-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ContractName',
	CONTRACT : false,
	USE_CASES : {
		READING     : true,
		WRITING     : true,
		WRONG_INPUT : true,
	},
	EVENTS : {
	},
	METHODS : {
		methodName : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'ContractName',
	EVENTS : {
	},
	METHODS : {
		methodName : 'methodName(address,uint256)',
	},
	PARAMS : {
	},
}

// For expected reverted errors
const ERROR = {
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
			}
		})

		describe( 'Writing ...', () => {
			if ( TEST.USE_CASES.WRITING ) {
			}
		})

		describe( 'Wrong input ...', () => {
			if ( TEST.USE_CASES.WRONG_INPUT ) {
				describe( 'Reading ...', () => {
					if ( TEST.USE_CASES.READING ) {
						describe( CONTRACT.METHODS.methodName, () => {
							if ( TEST.METHODS.methodName ) {
								const arg1Tests = addressCases( 'addressVar' )
								const arg2Tests = bytes4Cases( 'bytes4Var' )
								const arg3Tests = bytes32Cases( 'bytes32Var' )
								const arg4Tests = bytesArrayCases( 'bytesArrayVar' )
								const arg5Tests = booleanCases( 'booleanVar' )
								const arg6Tests = stringCases( 'stringVar' )
								const arg7Tests = uintCases( 'uintVar' )
								const arg8Tests = enumCases( 'enumVar' )

								it( 'Input less than X argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( methodName )
								})

								it( 'Input more than X argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : contract_deployer_address,
										arg2 : CST.INTERFACE_ID.IERC165,
										arg3 : ethers.utils.randomBytes( 32 ),
										arg4 : ethers.utils.randomBytes( 64 ),
										arg5 : true,
										arg6 : 'hello',
										arg7 : CST.ONE_ETH,
										arg8 : 0,
										arg9 : 1,
									}
									await generateFailTest( contract.transferOwnership, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : testVar,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg3Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : testVar,
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg4Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : testVar,
											arg5 : true,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg5Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : testVar,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg6Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : testVar,
											arg7 : CST.ONE_ETH,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg7Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : 'hello',
											arg7 : testVar,
											arg8 : 0,
										}
										await generateFailTest( methodName, args )
									})
								})

								arg8Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : CST.INTERFACE_ID.IERC165,
											arg3 : ethers.utils.randomBytes( 32 ),
											arg4 : ethers.utils.randomBytes( 64 ),
											arg5 : true,
											arg6 : 'hello',
											arg7 : CST.ONE_ETH,
											arg8 : testVar,
										}
										await generateFailTest( methodName, args )
									})
								})
							}
						})
					}
				})

				describe( 'Writing ...', () => {
					if ( TEST.USE_CASES.WRITING ) {
					}
				})
			}
		})
	}
})
