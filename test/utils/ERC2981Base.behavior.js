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
	},
	METHODS : {
		royaltyInfo       : true,
		setRoyaltyInfo    : true,
		supportsInterface : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
	},
	METHODS : {
		royaltyInfo : {
			SIGNATURE : 'royaltyInfo(uint256,uint256)',
			PARAMS    : [ 'tokenId_', 'salePrice_' ],
		},
		setRoyaltyInfo : {
			SIGNATURE : 'setRoyaltyInfo(address,uint256)',
			PARAMS    : [ 'recipient_', 'rate_' ],
		},
		supportsInterface : {
			SIGNATURE : 'supportsInterface(bytes4)',
			PARAMS    : [ 'interfaceId_' ],
		},
	},
}

const shouldBehaveLikeERC2981 = ( contract_name, contract_params ) => {
	describe( 'sHOULD BEHAVE LIKE erc2981', () => {
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
			const params = [
				contract_deployer_address,
				contract_params.ROYALTY_RATE
			]
			contract = await deployContract( contract_artifact, params )
			contract_address = contract.address
		})

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				describe( CONTRACT.METHODS.supportsInterface.SIGNATURE, () => {
					if ( TEST.METHODS.supportsInterface ) {
						it( 'Contract should support IERC165', async () => {
							const supportsIERC165 = await contract.supportsInterface( CST.INTERFACE_ID.IERC165 )
							expect( supportsIERC165 ).to.be.true
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

				describe( CONTRACT.METHODS.royaltyInfo.SIGNATURE, () => {
					if ( TEST.METHODS.royaltyInfo ) {
						it( 'Royalty info for sale price 1 ETH should be ' + contract_deployer_name + ' and royalties amount ' + CST.ONE_ETH.mul( contract_params.ROYALTY_RATE ).div( contract_params.ROYALTY_BASE ), async () => {
							const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.ROYALTY_RATE ).div( contract_params.ROYALTY_BASE ) )
						})

						it( 'Royalty info for sale price 0 should be ' + contract_deployer_name + ' and royalties amount 0', async () => {
							const royaltyInfo = await contract.royaltyInfo( 0, 0 )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( 0 )
						})
					}
				})

				describe( CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE, () => {
					if ( TEST.METHODS.setRoyaltyInfo ) {
						describe( 'Setting royalty rate to ' + ( contract_params.ROYALTY_RATE / 2 ).toString(), () => {
							it( 'Royalty info for price 1 ETH should be ' + user1_name + ' and ' + CST.ONE_ETH.mul( contract_params.ROYALTY_RATE / 2 ).div( 1000 ), async () => {
								await contract.setRoyaltyInfo( user1_address, contract_params.ROYALTY_RATE / 2 )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( user1_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.ROYALTY_RATE / 2 ).div( contract_params.ROYALTY_BASE ) )
							})
						})

						describe( 'Setting royalty rate to more than 100%', () => {
							it( 'Should be reverted with ' + ERROR.IERC2981_INVALID_ROYALTIES, async () => {
								await expect( contract.setRoyaltyInfo( user1_address, contract_params.ROYALTY_BASE + 1 ) ).to.be.revertedWith( ERROR.IERC2981_INVALID_ROYALTIES )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.ROYALTY_RATE ).div( contract_params.ROYALTY_BASE ) )
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
					defaultArgs [ CONTRACT.METHODS.royaltyInfo.SIGNATURE ] = {
						err  : null,
						args : [
							0,
							CST.ONE_ETH,
						],
					}
					defaultArgs [ CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE ] = {
						err  : null,
						args : [
							contract_deployer_address,
							contract_params.ROYALTY_RATE,
						],
					}
					defaultArgs [ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
						err  : null,
						args : [
							CST.INTERFACE_ID.IERC165,
						],
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

module.exports = { shouldBehaveLikeERC2981 }
