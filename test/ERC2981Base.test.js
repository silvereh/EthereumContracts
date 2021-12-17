const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { generateFailTest, addressCases, uintCases, bytes4Cases } = require( './test-module' )

// For activating or de-activating test cases
const TEST = {
	NAME : 'ERC2981Base',
	CONTRACT : true,
	USE_CASE : {
		READING     : true,
		WRITING     : true,
		WRONG_INPUT : true,
	},
	EVENTS : {
	},
	METHODS : {
		royaltyInfo       : true,
		setRoyaltyInfo    : true,
		supportsInterface : true,
	},
}

// For contract data
const CONTRACT = {
	NAME : 'MockERC2981Base',
	EVENTS : {
	},
	METHODS : {
		royaltyInfo       : 'royaltyInfo(uint256,uint256)',
		setRoyaltyInfo    : 'setRoyaltyInfo(address,uint256)',
		supportsInterface : 'supportsInterface(bytes4)',
	},
	PARAMS : {
		ROYALTY_RATE : 1000,
		ROYALTY_BASE : 10000,
	},
}

// For expected reverted errors
const ERROR = {
	IERC2981_INVALID_ROYALTIES : 'IERC2981_INVALID_ROYALTIES',
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
				contract_deployer_address,
				CONTRACT.PARAMS.ROYALTY_RATE
			)
			await contract.deployed()
			contract_address = contract.address
		})

		describe( 'Reading ...', () => {
			if ( TEST.USE_CASE.READING ) {
				describe( CONTRACT.METHODS.royaltyInfo, () => {
					if ( TEST.METHODS.royaltyInfo ) {
						it( 'Royalty info for sale price 1 ETH should be ' + contract_deployer_name + ' and royalties amount ' + CST.ONE_ETH.mul( CONTRACT.PARAMS.ROYALTY_RATE ).div( CONTRACT.PARAMS.ROYALTY_BASE ), async () => {
							const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( CONTRACT.PARAMS.ROYALTY_RATE ).div( CONTRACT.PARAMS.ROYALTY_BASE ) )
						})

						it( 'Royalty info for sale price 0 should be ' + contract_deployer_name + ' and royalties amount 0', async () => {
							const royaltyInfo = await contract.royaltyInfo( 0, 0 )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( 0 )
						})
					}
				})

				describe( CONTRACT.METHODS.supportsInterface, () => {
					if ( TEST.METHODS.supportsInterface ) {
						it( 'Contract should support IERC165', async () => {
							const supportsIERC165 = await contract.supportsInterface( CST.INTERFACE_ID.IERC165 )
							expect( supportsIERC165 ).to.be.true
						})

						it( 'Contract should not support IERC721', async () => {
							const supportsIERC721 = await contract.supportsInterface( CST.INTERFACE_ID.IERC721 )
							expect( supportsIERC721 ).to.be.false
						})

						it( 'Contract should not support IERC721Metadata', async () => {
							const supportsIERC721Metadata = await contract.supportsInterface( CST.INTERFACE_ID.IERC721Metadata )
							expect( supportsIERC721Metadata ).to.be.false
						})

						it( 'Contract should not support IERC721Enumerable', async () => {
							const supportsIERC721Enumerable = await contract.supportsInterface( CST.INTERFACE_ID.IERC721Enumerable )
							expect( supportsIERC721Enumerable ).to.be.false
						})

						it( 'Contract should support IERC2981', async () => {
							const supportsIERC2981 = await contract.supportsInterface( CST.INTERFACE_ID.IERC2981 )
							expect( supportsIERC2981 ).to.be.true
						})

						it( 'Contract should not support invalid interface ID', async () => {
							const supportsINVALID = await contract.supportsInterface( CST.INTERFACE_ID.INVALID )
							expect( supportsINVALID ).to.be.false
						})

						it( 'Contract should not support null interface ID', async () => {
							const supportsINVALID = await contract.supportsInterface( CST.INTERFACE_ID.NULL )
							expect( supportsINVALID ).to.be.false
						})
					}
				})
			}
		})

		describe( 'Writing ...', () => {
			if ( TEST.USE_CASE.WRITING ) {
				describe( CONTRACT.METHODS.setRoyaltyInfo, () => {
					if ( TEST.METHODS.setRoyaltyInfo ) {
						describe( 'Setting royalty rate to ' + ( CONTRACT.PARAMS.ROYALTY_RATE / 2 ).toString(), () => {
							it( 'Royalty info for price 1 ETH should be ' + user1_name + ' and ' + CST.ONE_ETH.mul( CONTRACT.PARAMS.ROYALTY_RATE / 2 ).div( 1000 ), async () => {
								await contract.setRoyaltyInfo( user1_address, CONTRACT.PARAMS.ROYALTY_RATE / 2 )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( user1_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( CONTRACT.PARAMS.ROYALTY_RATE / 2 ).div( CONTRACT.PARAMS.ROYALTY_BASE ) )
							})
						})

						describe( 'Setting royalty rate to more than 100%', () => {
							it( 'Should be reverted with ' + ERROR.IERC2981_INVALID_ROYALTIES, async () => {
								await expect( contract.setRoyaltyInfo( user1_address, CONTRACT.PARAMS.ROYALTY_BASE + 1 ) ).to.be.revertedWith( ERROR.IERC2981_INVALID_ROYALTIES )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( CONTRACT.PARAMS.ROYALTY_RATE ).div( CONTRACT.PARAMS.ROYALTY_BASE ) )
							})
						})
					}
				})
			}
		})

		describe( 'Wrong input ...', () => {
			if ( TEST.USE_CASE.WRONG_INPUT ) {
				describe( 'Reading ...', () => {
					if ( TEST.USE_CASE.READING ) {
						describe( CONTRACT.METHODS.royaltyInfo, () => {
							if ( TEST.METHODS.royaltyInfo ) {
								const arg1Tests = uintCases( 'tokenId_' )
								const arg2Tests = uintCases( 'salePrice_' )

								it( 'Input less than 2 argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.royaltyInfo )
								})

								it( 'Input more than 2 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : 0,
										arg2 : CST.ONE_ETH,
										arg3 : 1,
									}
									await generateFailTest( contract.royaltyInfo, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : CST.ONE_ETH,
										}
										await generateFailTest( contract.royaltyInfo, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : 0,
											arg2 : testVar,
										}
										await generateFailTest( contract.royaltyInfo, args )
									})
								})
							}
						})

						describe( CONTRACT.METHODS.supportsInterface, () => {
							if ( TEST.METHODS.supportsInterface ) {
								const arg1Tests = bytes4Cases( 'interfaceId_' )

								it( 'Input less than 1 argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.supportsInterface )
								})

								it( 'Input more than 1 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : CST.INTERFACE_ID.IERC165,
										arg2 : 1,
									}
									await generateFailTest( contract.supportsInterface, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
										}
										await generateFailTest( contract.supportsInterface, args )
									})
								})
							}
						})
					}
				})

				describe( 'Writing ...', () => {
					if ( TEST.USE_CASE.WRITING ) {
						describe( CONTRACT.METHODS.setRoyaltyInfo, () => {
							if ( TEST.METHODS.setRoyaltyInfo ) {
								const arg1Tests = addressCases( 'recipient_' )
								const arg2Tests = uintCases( 'rate_' )

								it( 'Input less than 2 argument should throw "' + THROW.MISSING_ARGUMENT + '"', async () => {
									await generateFailTest( contract.royaltyInfo )
								})

								it( 'Input more than 2 argument should throw "' + THROW.UNEXPECTED_ARGUMENT + '"', async () => {
									const args = {
										err  : THROW.UNEXPECTED_ARGUMENT,
										arg1 : contract_deployer_address,
										arg2 : CONTRACT.PARAMS.ROYALTY_RATE,
										arg3 : 1,
									}
									await generateFailTest( contract.royaltyInfo, args )
								})

								arg1Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : testVar,
											arg2 : CONTRACT.PARAMS.ROYALTY_RATE,
										}
										await generateFailTest( contract.royaltyInfo, args )
									})
								})

								arg2Tests.forEach( ( { testError, testName, testVar } ) => {
									it( testName, async () => {
										const args = {
											err  : testError,
											arg1 : contract_deployer_address,
											arg2 : testVar,
										}
										await generateFailTest( contract.royaltyInfo, args )
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
