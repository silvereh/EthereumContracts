const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC1155Base } = require( './ERC1155Base.behavior' )
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
		uri               : true,
		setUri            : true,
		supportsInterface : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
		ERC1155_BASE  : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
	},
	METHODS : {
		uri : {
			SIGNATURE : 'uri(uint256)',
			PARAMS    : [ 'id_' ],
		},
		setUri : {
			SIGNATURE : 'setUri(string)',
			PARAMS    : [ 'baseURI_' ],
		}
	},
}

const shouldBehaveLikeERC1155BaseMetadataURI = ( contract_name, contract_params ) => {
	if ( TEST.USE_CASES.ERC1155_BASE ) {
		shouldBehaveLikeERC1155Base( contract_name, contract_params )
	}

	describe( 'Should behave like ERC1155BaseMetadataURI', () => {
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
				it( 'Contract should support IERC1155MetadataURI', async () => {
					expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC1155MetadataURI ) ).to.be.true
				})

				describe( CONTRACT.METHODS.uri.SIGNATURE, () => {
					if ( TEST.METHODS.uri ) {
						it( 'token URI should be an empty string', async () => {
							expect( await contract.uri( contract_params.INIT_SERIES ) ).to.equal( '' )
						})
					}
				})

				describe( CONTRACT.METHODS.setUri.SIGNATURE, () => {
					if ( TEST.METHODS.setUri ) {
						it( 'tokenURI should now be ' + contract_params.BASE_URI, async () => {
							await contract.setUri( contract_params.BASE_URI )
							expect( await contract.uri( contract_params.INIT_SERIES ) ).to.equal( contract_params.BASE_URI )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.uri.SIGNATURE ] = {
						err  : null,
						args : [
							contract_params.INIT_SERIES,
						]
					}
					defaultArgs [ CONTRACT.METHODS.setUri.SIGNATURE ] = {
						err  : null,
						args : [
							contract_params.BASE_URI,
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

module.exports = { shouldBehaveLikeERC1155BaseMetadataURI }
