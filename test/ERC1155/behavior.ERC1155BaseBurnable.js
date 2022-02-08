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
		burnFrom      : true,
		batchBurnFrom : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		TransferSingle : 'TransferSingle',
		TransferBatch  : 'TransferBatch',
	},
	METHODS : {
		burnFrom : {
			SIGNATURE : 'burnFrom(address,uint256,uint256)',
			PARAMS    : [ 'account_', 'id_', 'amount_' ],
		},
		batchBurnFrom : {
			SIGNATURE : 'batchBurnFrom(address,uint256[],uint256[])',
			PARAMS    : [ 'account_', 'ids_', 'amounts_' ],
		}
	},
}

const shouldBehaveLikeERC1155BaseBurnable = function( fixture, contract_params ) {
	describe( 'Should behave like ERC1155BaseBurnable', function() {
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
				describe( CONTRACT.METHODS.burnFrom.SIGNATURE, function() {
					if ( TEST.METHODS.burnFrom ) {
						it( 'Trying to burn a token from a series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
							await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})

						describe( 'When a series has been minted', function() {
							beforeEach( async function() {
								await contract.connect( token_owner ).mint( contract_params.INIT_SERIES, 1 )
							})

							it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
								await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 2 ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
							})

							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferSingle + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + token_owner_name + ' to the null address by ' + token_owner_name, async function() {
								await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 ) ).to.emit( contract, CONTRACT.EVENTS.TransferSingle ).withArgs( token_owner_address, token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SERIES, 1 )
							})

							it( 'Balance of ' + token_owner_name + ' for series ' + contract_params.INIT_SERIES + ' should be 0', async function() {
								await contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 )
								expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
							})
						})
					}
				})

				describe( CONTRACT.METHODS.batchBurnFrom.SIGNATURE, function() {
					if ( TEST.METHODS.batchBurnFrom ) {
						it( 'Inputting different array legths should be reverted with ' + ERROR.IERC1155_ARRAY_LENGTH_MISMATCH, async function() {
							await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1, 2 ] ) ).to.be.revertedWith( ERROR.IERC1155_ARRAY_LENGTH_MISMATCH )
						})

						it( 'Trying to burn tokens from series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
							await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})

						describe( 'When series have been minted', function() {
							beforeEach( async function() {
								await contract.connect( token_owner ).batchMint( [ contract_params.INIT_SERIES ], [ 1 ] )
							})

							it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
								await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 2 ] ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
							})

							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferBatch + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + token_owner_name + ' to the null address by ' + token_owner_name, async function() {
								await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] ) ).to.emit( contract, CONTRACT.EVENTS.TransferBatch ).withArgs( token_owner_address, token_owner_address, CST.ADDRESS_ZERO, [ contract_params.INIT_SERIES ], [ 1 ] )
							})

							it( 'Balance of ' + token_owner_name + ' for series ' + contract_params.INIT_SERIES + ' should be 0', async function() {
								await contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] )
								expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
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
					defaultArgs [ CONTRACT.METHODS.burnFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							contract_params.INIT_SERIES,
							1,
						]
					}
					defaultArgs [ CONTRACT.METHODS.batchBurnFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							[ contract_params.INIT_SERIES ],
							[ 1 ],
						]
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

module.exports = { shouldBehaveLikeERC1155BaseBurnable }
