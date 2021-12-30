const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const { shouldBehaveLikeERC20Base } = require( './ERC20Base.behavior' )
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
	EVENTS : {
	},
	METHODS : {
		mint         : true,
		mintBatch    : true,
		mintBatch_ol : true,
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
		mint : {
			SIGNATURE : 'mint(address,uint256)',
			PARAMS    : [ 'recipient_', 'amount_' ],
		},
		mintBatch : {
			SIGNATURE : 'mintBatch(address[],uint256)',
			PARAMS    : [ 'recipients_', 'amount_' ],
		},
		mintBatch_ol : {
			SIGNATURE : 'mintBatch(address[],uint256[])',
			PARAMS    : [ 'recipients_', 'amounts_' ],
		},
	},
}

const shouldBehaveLikeERC20BaseCapped = ( contract_name, contract_params ) => {
	shouldBehaveLikeERC20Base( contract_name, contract_params )

	describe( 'Should behave like ERC20BaseCapped', () => {
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

		it( 'Inputting an incorrect max supply should be reverted with ' + ERROR.ERC20BaseCapped_INVALID_MAX_SUPPLY, async () => {
			await expect( contract_artifact.deploy( 0 ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_INVALID_MAX_SUPPLY )
		})

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				beforeEach( async () => {
					contract = await deployContract( contract_artifact, contract_params.CONSTRUCT )
					contract_address = contract.address
				})

				describe( CONTRACT.METHODS.mint.SIGNATURE, () => {
					if ( TEST.METHODS.mint ) {
						it( 'Trying to mint more tokens than the max supply should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async () => {
							await expect( contract.mint( token_owner_address, contract_params.CONSTRUCT[0] + 1 ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
						})
					}
				})

				describe( CONTRACT.METHODS.mintBatch.SIGNATURE, () => {
					if ( TEST.METHODS.mintBatch ) {
						it( 'Trying to mint more tokens than the max supply to multiple users should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async () => {
							let recipients = [ token_owner_address, user1_address ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch.SIGNATURE ]( recipients, contract_params.CONSTRUCT[0] + 1 ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( 0 )
						})

						it( 'Trying to mint 1 token to more than the max supply number of users should throw "' + THROW.EXCEEDS_GAS_LIMIT + '" or be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async () => {
							let recipients = [ token_owner_address, user1_address ]
							for ( i = 0; i <= contract_params.CONSTRUCT[0] + 1; i ++ ) {
								recipients.push( user1_address )
							}
							try {
								await contract.functions[ CONTRACT.METHODS.mintBatch.SIGNATURE ]( recipients, 1 )
							}
							catch ( error ) {
								expect( error.message ).to.match(/(exceeds block gas limit|ERC20BaseCapped_MAX_SUPPLY_EXCEEDED)/)
							}
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.balanceOf( user1_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( 0 )
						})
					}
				})

				describe( CONTRACT.METHODS.mintBatch_ol.SIGNATURE, () => {
					if ( TEST.METHODS.mintBatch_ol ) {
						it( 'Trying to airdrop more tokens than the max supply should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async () => {
							let recipients = [ token_owner_address, user1_address ]
							let amounts = [ 1, contract_params.CONSTRUCT[0] + 1 ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( recipients, amounts ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( 0 )
						})

						it( 'Trying to airdrop tokens to the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_MINT, async () => {
							let recipients = [ token_owner_address, CST.ADDRESS_ZERO ]
							let amounts = [ 1, 2 ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( recipients, amounts ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_MINT )
						})
					}
				})
			}
		})
	})
}

module.exports = { shouldBehaveLikeERC20BaseCapped }
