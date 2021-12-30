const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC721Base } = require( './ERC721Base.behavior' )
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
		burn      : true,
		burnFrom  : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
		ERC721_BASE   : true,
	},
}

// For contract data
const CONTRACT = {
	METHODS : {
		burn : {
			SIGNATURE : 'burn(uint256)',
			PARAMS    : [ 'tokenId_' ],
		},
		burnFrom : {
			SIGNATURE : 'burnFrom(address,uint256)',
			PARAMS    : [ 'owner_', 'tokenId_' ],
		},
	},
}

const shouldBehaveLikeERC721BaseBurnable = ( contract_name, contract_params ) => {
	describe( 'Should behave like ERC721BaseBurnable', () => {
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
		let holder_artifact

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

		if ( TEST.USE_CASES.ERC721_BASE ) {
			shouldBehaveLikeERC721Base( contract_name, contract_params )
		}

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				describe( CONTRACT.METHODS.burn.SIGNATURE, () => {
					if ( TEST.METHODS.burn ) {
						beforeEach( async () => {
							await contract.mint( token_owner_address )
						})

						it( 'Trying to burn a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
							await expect( contract.connect( token_owner ).burn( contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})

						it( 'Trying to burn a token not owned should be reverted with ' + ERROR.IERC721_TOKEN_NOT_OWNED, async () => {
							await expect( contract.connect( user1 ).burn( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_TOKEN_NOT_OWNED )
						})

						describe( 'Burning of token ' + contract_params.INIT_SUPPLY + ' owned', () => {
							beforeEach( async () => {
								await contract.connect( token_owner ).burn( contract_params.INIT_SUPPLY )
							})

							it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
								await expect( contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
							})

							it( 'Balance of ' + token_owner_name + ' should now be 0', async () => {
								expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							})

							it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
								await expect( contract.getApproved( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
							})
						})
					}
				})

				describe( CONTRACT.METHODS.burnFrom.SIGNATURE, () => {
					if ( TEST.METHODS.burnFrom ) {
						beforeEach( async () => {
							await contract.mint( token_owner_address )
						})

						it( 'Trying to burn a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
							await expect( contract.connect( token_owner ).burnFrom( user1_address, contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})

						it( 'Trying to burn a token not owned should be reverted with ' + ERROR.ERC721Burnable_CALLER_NOT_APPROVED, async () => {
							await expect( contract.connect( user1 ).burnFrom( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.ERC721Burnable_CALLER_NOT_APPROVED )
						})

						describe( 'Burning of token ' + contract_params.INIT_SUPPLY + ' owned', () => {
							beforeEach( async () => {
								await contract.connect( token_owner ).approve( user1_address, 0 )
								await contract.connect( user1 ).burnFrom( token_owner_address, contract_params.INIT_SUPPLY )
							})

							it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
								await expect( contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
							})

							it( 'Balance of ' + token_owner_name + ' should now be 0', async () => {
								expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							})

							it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should now be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
								await expect( contract.getApproved( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
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
					defaultArgs[ CONTRACT.METHODS.burn.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.burnFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
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
	shouldBehaveLikeERC721BaseBurnable,
}
