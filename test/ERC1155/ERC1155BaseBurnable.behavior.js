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
		burnFrom      : true,
		batchBurnFrom : true,
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

const shouldBehaveLikeERC1155BaseBurnable = ( contract_name, contract_params ) => {
	if ( TEST.USE_CASES.ERC1155_BASE ) {
		shouldBehaveLikeERC1155Base( contract_name, contract_params )
	}

	describe( 'Should behave like ERC1155BaseBurnable', () => {
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
				describe( CONTRACT.METHODS.burnFrom.SIGNATURE, () => {
					if ( TEST.METHODS.burnFrom ) {
						it( 'Trying to burn a token from a series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async () => {
							await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})

						describe( 'When a series has been minted', () => {
							beforeEach( async () => {
								await contract.connect( token_owner ).mint( token_owner_address, contract_params.INIT_SERIES, 1 )
							})

							it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async () => {
								await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 2 ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
							})

							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferSingle + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + token_owner_name + ' to the null address by ' + token_owner_name, async () => {
								await expect( contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 ) ).to.emit( contract, CONTRACT.EVENTS.TransferSingle ).withArgs( token_owner_address, token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SERIES, 1 )
							})

							it( 'Balance of ' + token_owner_name + ' for series ' + contract_params.INIT_SERIES + ' should be 0', async () => {
								await contract.connect( token_owner ).burnFrom( token_owner_address, contract_params.INIT_SERIES, 1 )
								expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
							})
						})
					}
				})

				describe( CONTRACT.METHODS.batchBurnFrom.SIGNATURE, () => {
					if ( TEST.METHODS.batchBurnFrom ) {
						it( 'Inputting different array legths should be reverted with ' + ERROR.IERC1155_ARRAY_LENGTH_MISMATCH, async () => {
							await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1, 2 ] ) ).to.be.revertedWith( ERROR.IERC1155_ARRAY_LENGTH_MISMATCH )
						})

						it( 'Trying to burn tokens from series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async () => {
							await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})

						describe( 'When series have been minted', () => {
							beforeEach( async () => {
								await contract.connect( token_owner ).batchMint( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] )
							})

							it( 'Trying to burn more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async () => {
								await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 2 ] ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
							})

							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferBatch + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + token_owner_name + ' to the null address by ' + token_owner_name, async () => {
								await expect( contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] ) ).to.emit( contract, CONTRACT.EVENTS.TransferBatch ).withArgs( token_owner_address, token_owner_address, CST.ADDRESS_ZERO, [ contract_params.INIT_SERIES ], [ 1 ] )
							})

							it( 'Balance of ' + token_owner_name + ' for series ' + contract_params.INIT_SERIES + ' should be 0', async () => {
								await contract.connect( token_owner ).batchBurnFrom( token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] )
								expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
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

module.exports = { shouldBehaveLikeERC1155BaseBurnable }
