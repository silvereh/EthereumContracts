const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC721Base } = require( './behavior.ERC721Base' )
const { getTestCasesByFunction, generateTestCase } = require( '../fail-test-module' )
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
	METHODS : {
		totalSupply         : true,
		tokenOfOwnerByIndex : true,
		tokenByIndex        : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
		INTROSPECTION : true,
		ERC721_BASE   : true,
	},
}

// For contract data
const CONTRACT = {
	METHODS : {
		totalSupply : {
			SIGNATURE : 'totalSupply()',
			PARAMS    : [],
		},
		tokenOfOwnerByIndex : {
			SIGNATURE : 'tokenOfOwnerByIndex(address,uint256)',
			PARAMS    : [ 'tokenOwner_', 'index_' ],
		},
		tokenByIndex : {
			SIGNATURE : 'tokenByIndex(uint256)',
			PARAMS    : [ 'index_' ],
		},
	},
}

const shouldBehaveLikeERC721BaseEnumerable = ( contract_name, contract_params ) => {
	if ( TEST.USE_CASES.ERC721_BASE ) {
		shouldBehaveLikeERC721Base( contract_name, contract_params )
	}

	describe( 'Should behave like ERC721BaseEnumerable', () => {
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
				it( 'Contract should support IERC721Enumerable', async () => {
					expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC721Enumerable ) ).to.be.true
				})

				describe( CONTRACT.METHODS.totalSupply.SIGNATURE, () => {
					if ( TEST.METHODS.totalSupply ) {
						it( 'Total supply should be ' + contract_params.INIT_SUPPLY, async () => {
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})

						it( 'After minting a token, total supply should be ' + ( contract_params.INIT_SUPPLY + 1 ).toString(), async () => {
							await contract.connect( token_owner ).mint()
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY + 1 )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenByIndex.SIGNATURE, () => {
					if ( TEST.METHODS.tokenByIndex ) {
						it( 'Trying to get unminted token index should be reverted with ' + ERROR.IERC721Enumerable_INDEX_OUT_OF_BOUNDS, async () => {
							await expect( contract.tokenByIndex( contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721Enumerable_INDEX_OUT_OF_BOUNDS )
						})

						it( 'After minting a token, token at index ' + contract_params.INIT_SUPPLY + ' should be token ' + contract_params.INIT_SUPPLY, async () => {
							await contract.connect( token_owner ).mint()
							expect( await contract.tokenByIndex( contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.tokenOfOwnerByIndex.SIGNATURE, () => {
					if ( TEST.METHODS.tokenOfOwnerByIndex ) {
						it( 'Trying to get unminted token index should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async () => {
							await expect( contract.tokenOfOwnerByIndex( token_owner_address, contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
						})

						describe( 'After minting a token into ' + token_owner_name + '\'s wallet', () => {
							beforeEach( async () => {
								await contract.connect( token_owner ).mint()
							})

							it( 'Trying to get token of the null address should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async () => {
								await expect( contract.tokenOfOwnerByIndex( CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
							})

							it( 'Token of ' + token_owner_name + ' at index ' + contract_params.INIT_SUPPLY + ' should be token ' + contract_params.INIT_SUPPLY, async () => {
								expect( await contract.tokenOfOwnerByIndex( token_owner_address, contract_params.INIT_SUPPLY ) ).to.equal( contract_params.INIT_SUPPLY )
							})

							it( 'Token of non token holder at index 0 should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async () => {
								await expect( contract.tokenOfOwnerByIndex( user2_address, 0 ) ).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
							})

							describe( 'After minting another token into ' + token_owner_name + '\'s wallet', () => {
								beforeEach( async () => {
									await contract.connect( token_owner ).mint()
								})

								it( 'Token of ' + token_owner_name + ' at index ' + ( contract_params.INIT_SUPPLY + 1 ).toString() + ' should be token ' + ( contract_params.INIT_SUPPLY + 1 ).toString() + '', async () => {
									expect( await contract.tokenOfOwnerByIndex( token_owner_address, contract_params.INIT_SUPPLY + 1 ) ).to.equal( contract_params.INIT_SUPPLY + 1 )
								})

								describe( 'After minting a token into ' + user1_name + '\'s wallet', () => {
									beforeEach( async () => {
										await contract.connect( user1 ).mint()
									})

									it( 'Trying to get token of ' + token_owner_name + ' at index ' + ( contract_params.INIT_SUPPLY + 2 ).toString() + ' should be reverted with ' + ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS, async () => {
										// const res = await contract.tokenOfOwnerByIndex( token_owner_address, contract_params.INIT_SUPPLY + 2 )
										// console.debug( res )
										await expect( contract.tokenOfOwnerByIndex( token_owner_address, contract_params.INIT_SUPPLY + 2 ) ).to.be.revertedWith( ERROR.IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS )
									})

									it( 'Token of ' + user1_name + ' at index 0 should be token ' + ( contract_params.INIT_SUPPLY + 2 ).toString(), async () => {
										expect( await contract.tokenOfOwnerByIndex( user1_address, 0 ) ).to.equal( contract_params.INIT_SUPPLY + 2 )
									})
								})
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
					defaultArgs[ CONTRACT.METHODS.totalSupply.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.tokenOfOwnerByIndex.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.tokenByIndex.SIGNATURE ] = {
						err  : null,
						args : [
							0,
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

module.exports = {
	shouldBehaveLikeERC721BaseEnumerable,
}
