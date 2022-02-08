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
			PARAMS    : [ 'recipient_', 'royaltyRate_' ],
		},
		supportsInterface : {
			SIGNATURE : 'supportsInterface(bytes4)',
			PARAMS    : [ 'interfaceId_' ],
		},
	},
}

const shouldBehaveLikeERC2981 = async function( fixture, contract_params ) {
	describe( 'Should behave like ERC2981', function() {
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
				describe( CONTRACT.METHODS.supportsInterface.SIGNATURE, function() {
					if ( TEST.METHODS.supportsInterface ) {
						it( 'Contract should support IERC165', async function() {
							const supportsIERC165 = await contract.supportsInterface( CST.INTERFACE_ID.IERC165 )
							expect( supportsIERC165 ).to.be.true
						})

						it( 'Contract should support IERC2981', async function() {
							const supportsIERC2981 = await contract.supportsInterface( CST.INTERFACE_ID.IERC2981 )
							expect( supportsIERC2981 ).to.be.true
						})

						it( 'Contract should not support invalid interface ID', async function() {
							const supportsINVALID = await contract.supportsInterface( CST.INTERFACE_ID.INVALID )
							expect( supportsINVALID ).to.be.false
						})

						it( 'Contract should not support null interface ID', async function() {
							const supportsINVALID = await contract.supportsInterface( CST.INTERFACE_ID.NULL )
							expect( supportsINVALID ).to.be.false
						})
					}
				})

				describe( CONTRACT.METHODS.royaltyInfo.SIGNATURE, function() {
					if ( TEST.METHODS.royaltyInfo ) {
						it( 'Royalty info for sale price 1 ETH should be ' + contract_deployer_name + ' and royalties amount ' + CST.ONE_ETH.mul( contract_params.CONSTRUCT.royaltyRate_ ).div( contract_params.ROYALTY_BASE ), async function() {
							const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.CONSTRUCT.royaltyRate_ ).div( contract_params.ROYALTY_BASE ) )
						})

						it( 'Royalty info for sale price 0 should be ' + contract_deployer_name + ' and royalties amount 0', async function() {
							const royaltyInfo = await contract.royaltyInfo( 0, 0 )
							expect( royaltyInfo ).to.exist
							expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
							expect( royaltyInfo[ 1 ] ).to.equal( 0 )
						})
					}
				})

				describe( CONTRACT.METHODS.setRoyaltyInfo.SIGNATURE, function() {
					if ( TEST.METHODS.setRoyaltyInfo ) {
						describe( 'Setting royalty rate to ' + ( contract_params.CONSTRUCT.royaltyRate_ / 2 ).toString(), function() {
							it( 'Royalty info for price 1 ETH should be ' + user1_name + ' and ' + CST.ONE_ETH.mul( contract_params.CONSTRUCT.royaltyRate_ / 2 ).div( 1000 ), async function() {
								await contract.setRoyaltyInfo( user1_address, contract_params.CONSTRUCT.royaltyRate_ / 2 )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( user1_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.CONSTRUCT.royaltyRate_ / 2 ).div( contract_params.ROYALTY_BASE ) )
							})
						})

						describe( 'Setting royalty rate to more than 100%', function() {
							it( 'Should be reverted with ' + ERROR.IERC2981_INVALID_ROYALTIES, async function() {
								await expect( contract.setRoyaltyInfo( user1_address, contract_params.ROYALTY_BASE + 1 ) ).to.be.revertedWith( ERROR.IERC2981_INVALID_ROYALTIES )
								const royaltyInfo = await contract.royaltyInfo( 0, CST.ONE_ETH )
								expect( royaltyInfo ).to.exist
								expect( royaltyInfo[ 0 ] ).to.equal( contract_deployer_address )
								expect( royaltyInfo[ 1 ] ).to.equal( CST.ONE_ETH.mul( contract_params.CONSTRUCT.royaltyRate_ ).div( contract_params.ROYALTY_BASE ) )
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
							contract_params.CONSTRUCT.royaltyRate_,
						],
					}
					defaultArgs [ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
						err  : null,
						args : [
							CST.INTERFACE_ID.IERC165,
						],
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

module.exports = { shouldBehaveLikeERC2981 }
