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

const shouldBehaveLikeERC20BaseCapped = function( fixture, contract_params ) {
	describe( 'Should behave like ERC20BaseCapped', function() {
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
				describe( CONTRACT.METHODS.mint.SIGNATURE, function() {
					if ( TEST.METHODS.mint ) {
						it( 'Trying to mint more tokens than the max supply should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async function() {
							await expect( contract.mint( token_owner_address, contract_params.CONSTRUCT.maxSupply_ + 1 ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
						})
					}
				})

				describe( CONTRACT.METHODS.mintBatch.SIGNATURE, function() {
					if ( TEST.METHODS.mintBatch ) {
						it( 'Trying to mint more tokens than the max supply to multiple users should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async function() {
							let recipients = [ token_owner_address, user1_address ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch.SIGNATURE ]( recipients, contract_params.CONSTRUCT.maxSupply_ + 1 ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( 0 )
						})

						it( 'Trying to mint 1 token to more than the max supply number of users should throw "' + THROW.EXCEEDS_GAS_LIMIT + '" or be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async function() {
							let recipients = [ token_owner_address, user1_address ]
							for ( i = 0; i <= contract_params.CONSTRUCT.maxSupply_ + 1; i ++ ) {
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

				describe( CONTRACT.METHODS.mintBatch_ol.SIGNATURE, function() {
					if ( TEST.METHODS.mintBatch_ol ) {
						it( 'Trying to airdrop more tokens than the max supply should be reverted with ' + ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED, async function() {
							let recipients = [ token_owner_address, user1_address ]
							let amounts = [ 1, contract_params.CONSTRUCT.maxSupply_ + 1 ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( recipients, amounts ) ).to.be.revertedWith( ERROR.ERC20BaseCapped_MAX_SUPPLY_EXCEEDED )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
							expect( await contract.totalSupply() ).to.equal( 0 )
						})

						it( 'Trying to airdrop tokens to the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_MINT, async function() {
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
