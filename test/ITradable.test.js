const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ITradable',
	CONTRACT : true,
	USE_CASES : {
		READING     : true,
		WRITING     : true,
		WRONG_INPUT : true,
	},
	EVENTS : {
	},
	METHODS : {
		isRegisteredProxy : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'MockITradable',
	EVENTS : {
	},
	METHODS : {
		isRegisteredProxy : 'isRegisteredProxy(address,address)',
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

		let proxy
		let proxy_address
		let proxy_artifact

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

			proxy_artifact = await ethers.getContractFactory( 'MockProxyRegistry' )
			proxy = await proxy_artifact.deploy()
			await proxy.deployed()
			proxy_address = proxy.address
			await proxy.setProxy( token_owner_address, proxy_user_address )

			contract_artifact = await ethers.getContractFactory( CONTRACT.NAME )
		})

		beforeEach( async () => {
			contract = await contract_artifact.deploy(
				proxy_address
			)
			await contract.deployed()
			contract_address = contract.address
		})

		describe( 'Reading ...', () => {
			if ( TEST.USE_CASES.READING ) {
				describe( CONTRACT.METHODS.isRegisteredProxy, () => {
					if ( TEST.METHODS.isRegisteredProxy ) {
						it( proxy_user_name + ' is a registered proxy for ' + token_owner_name, async () => {
							expect( await contract.isRegisteredProxy( token_owner_address, proxy_user_address ) ).to.be.true
						})

						it( proxy_user_name + ' is not a registerd proxy for ' + contract_deployer_name, async () => {
							expect( await contract.isRegisteredProxy( contract_deployer_address, proxy_user_address ) ).to.be.false
						})
					}
				})
			}
		})

		describe( 'Writing ...', () => {
			if ( TEST.USE_CASES.WRITING ) {
				// No writing use case for this contract
			}
		})

		describe( 'Wrong input ...', () => {
			if ( TEST.USE_CASES.WRONG_INPUT ) {
				describe( 'Reading ...', () => {
					if ( TEST.USE_CASES.READING ) {
						describe( CONTRACT.METHODS.isRegisteredProxy, () => {
							if ( TEST.METHODS.isRegisteredProxy ) {
								it( 'Input less than 2 arguments should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await expect( contract.isRegisteredProxy() ).to.be.rejectedWith( THROW.MISSING_ARGUMENT )
								})

								it( 'Input more than 2 arguments should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, proxy_user_address, 1 ) ).to.be.rejectedWith( THROW.UNEXPECTED_ARGUMENT )
								})

								it( 'Input array of address instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( [ token_owner_address ], proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input interface ID instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS + '"', async () => {
									await expect( contract.isRegisteredProxy( CST.INTERFACE_ID.IERC721, proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS )
								})

								it( 'Input booldean instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( true, proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input object instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( { "tokenOwner_": token_owner_address }, proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input string instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_STR + '"', async () => {
									await expect( contract.isRegisteredProxy( 'hello', proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_STR )
								})

								it( 'Input `tokenOwner_` cast as BigNumber should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( ethers.BigNumber.from( token_owner_address ), proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input number instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( 1, proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input BigNumber instead of `tokenOwner_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( CONTRACT.PARAMS.TOKEN_PRICE, proxy_user_address ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input array of address instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, [ proxy_user_address ] ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input interface ID instead of `operator_` should throw "' + THROW.INVALID_ADDRESS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, CST.INTERFACE_ID.IERC721 ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS )
								})

								it( 'Input booldean instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, true ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input object instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, { "operator_": proxy_user_address } ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input string instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_STR + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, 'hello' ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_STR )
								})

								it( 'Input `operator_` cast as BigNumber should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, ethers.BigNumber.from( proxy_user_address ) ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input number instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, 1 ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})

								it( 'Input BigNumber instead of `operator_` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"', async () => {
									await expect( contract.isRegisteredProxy( token_owner_address, CONTRACT.PARAMS.TOKEN_PRICE ) ).to.be.rejectedWith( THROW.INVALID_ADDRESS_OR_ENS )
								})
							}
						})
					}
				})

				describe( 'Writing ...', () => {
					if ( TEST.USE_CASES.WRITING ) {
						// No writing use case for this contract
					}
				})
			}
		})
	}
})
