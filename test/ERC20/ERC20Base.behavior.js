const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

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
		allowance    : true,
		approve      : true,
		balanceOf    : true,
		totalSupply  : true,
		transfer     : true,
		transferFrom : true,
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
		Transfer : 'Transfer',
		Approval : 'Approval',
	},
	METHODS : {
		allowance    : {
			SIGNATURE : 'allowance(address,address)',
			PARAMS    : [ 'owner_', 'spender_' ],
		},
		approve      : {
			SIGNATURE : 'approve(address,uint256)',
			PARAMS    : [ 'spender_', 'amount_' ],
		},
		balanceOf    : {
			SIGNATURE : 'balanceOf(address)',
			PARAMS    : [ 'account_' ],
		},
		totalSupply  : {
			SIGNATURE : 'totalSupply()',
			PARAMS    : [],
		},
		transfer     : {
			SIGNATURE : 'transfer(address,uint256)',
			PARAMS    : [ 'recipient_', 'amount_' ],
		},
		transferFrom : {
			SIGNATURE : 'transferFrom(address,address,uint256)',
			PARAMS    : [ 'owner_', 'recipient_', 'amount_' ],
		},
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

const shouldBehaveLikeERC20Base = ( contract_name, contract_params ) => {
	describe( 'Should behave like ERC20Base', () => {
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
				describe( CONTRACT.METHODS.totalSupply.SIGNATURE, () => {
					if ( TEST.METHODS.totalSupply ) {
						it( 'Total supply should be ' + contract_params.INIT_SUPPLY, async () => {
							expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.balanceOf.SIGNATURE, () => {
					if ( TEST.METHODS.balanceOf ) {
						it( 'Balance of ' + contract_deployer_name + ' should be ' + contract_params.INIT_SUPPLY, async () => {
							expect( await contract.balanceOf( contract_deployer_address ) ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.allowance.SIGNATURE, () => {
					if ( TEST.METHODS.allowance ) {
						it( 'Allowance when no tokens exist should be 0', async () => {
							expect( await contract.allowance( contract_deployer_address, user1_address ) ).to.equal( 0 )
						})

						it( 'Trying to get allowance of tokens owned by the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_OWNER, async () => {
							await expect( contract.allowance( CST.ADDRESS_ZERO, user1_address ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_OWNER )
						})
					}
				})

				describe( CONTRACT.METHODS.transfer.SIGNATURE, () => {
					if ( TEST.METHODS.transfer ) {
						it( 'Trying to transfer tokens when balance is zero should be reverted with ' + ERROR.IERC20_INSUFFICIENT_BALANCE, async () => {
							await expect( contract.connect( user1 ).transfer( user2_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_INSUFFICIENT_BALANCE )
						})
					}
				})

				describe( CONTRACT.METHODS.mint.SIGNATURE, () => {
					if ( TEST.METHODS.mint ) {
						beforeEach( async () => {
							await contract.mint( token_owner_address, 1 )
						})

						describe( CONTRACT.METHODS.totalSupply.SIGNATURE, () => {
							if ( TEST.METHODS.totalSupply ) {
								it( 'Total supply should be ' + ( contract_params.INIT_SUPPLY + 1 ).toString(), async () => {
									expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY + 1 )
								})
							}
						})

						describe( CONTRACT.METHODS.balanceOf.SIGNATURE, () => {
							if ( TEST.METHODS.balanceOf ) {
								it( 'Balance of ' + contract_deployer_name + ' should be ' + contract_params.INIT_SUPPLY, async () => {
									expect( await contract.balanceOf( contract_deployer_address ) ).to.equal( contract_params.INIT_SUPPLY )
								})

								it( 'Balance of ' + token_owner_name + ' should be 1', async () => {
									expect( await contract.balanceOf( token_owner_address ) ).to.equal( 1 )
								})
							}
						})

						describe( CONTRACT.METHODS.allowance.SIGNATURE, () => {
							if ( TEST.METHODS.allowance ) {
								it( 'Allowance of ' + token_owner_name + ' should not be required, expect 0', async () => {
									expect( await contract.allowance( token_owner_address, token_owner_address ) ).to.equal( 0 )
								})

								it( 'Allowance of non owner should be 0', async () => {
									expect( await contract.allowance( token_owner_address, user1_address ) ).to.equal( 0 )
								})
							}
						})

						describe( CONTRACT.METHODS.transfer.SIGNATURE, () => {
							if ( TEST.METHODS.transfer ) {
								it( 'Transfering tokens to null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_TRANSFER, async () => {
									await expect( contract.connect( token_owner ).transfer( CST.ADDRESS_ZERO, 1 ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_TRANSFER )
								})

								it( 'Trying to transfer more tokens than owned should be reverted with ' + ERROR.IERC20_INSUFFICIENT_BALANCE, async () => {
									await expect( contract.connect( token_owner ).transfer( user1_address, 2 ) ).to.be.revertedWith( ERROR.IERC20_INSUFFICIENT_BALANCE )
								})

								it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning a token was transfered from TokenOwner to User1', async () => {
									await expect( contract.connect( token_owner ).transfer( user1_address, 1 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, 1 )
								})

								it( 'Transfer of token to User1 should be successful', async () => {
									await contract.connect( token_owner ).transfer( user1_address, 1 )
									expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
									expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
									expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY + 1 )
								})
							}
						})

						describe( CONTRACT.METHODS.approve.SIGNATURE, () => {
							if ( TEST.METHODS.approve ) {
								it( 'Trying to approve self should be reverted with ' + ERROR.IERC20_APPROVE_OWNER, async () => {
									await expect( contract.connect( token_owner ).approve( token_owner_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_APPROVE_OWNER )
								})

								it( 'Contract should emit an ' + CONTRACT.EVENTS.Approval + ' event mentioning User1 is now allowed to spend 2 token in behalf of TokenOwner', async () => {
									await expect( contract.connect( token_owner ).approve( user1_address, 1 ) ).to.emit( contract, CONTRACT.EVENTS.Approval ).withArgs( token_owner_address, user1_address, 1 )
								})

								describe( 'TokenOwner approves User1 to spend 2 tokens in their behalf', async () => {
									beforeEach( async () => {
										await contract.connect( token_owner ).approve( user1_address, 2 )
									})

									describe( CONTRACT.METHODS.allowance.SIGNATURE, () => {
										if ( TEST.METHODS.allowance ) {
											it( 'User1 should be allowed to spend 2 token in behalf of TokenOwner', async () => {
												const allowance = await contract.allowance( token_owner_address, user1_address )
												expect( allowance ).to.equal( 2 )
											})
										}
									})

									describe( CONTRACT.METHODS.transferFrom.SIGNATURE, () => {
										it( 'Contract should emit a ' + CONTRACT.EVENTS.Transfer + ' event mentioning a token was transfered from TokenOwner to User1', async () => {
											await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, 1 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, 1 )
										})

										if ( TEST.METHODS.transferFrom ) {
											it( 'User1 should be able to transfer a token owned by TokenOwner', async () => {
												await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, 1 )
												expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												expect( await contract.totalSupply() ).to.equal( contract_params.INIT_SUPPLY + 1 )
											})

											it( 'Trying to transfer tokens from the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_OWNER, async () => {
												await expect( contract.connect( user1 ).transferFrom( CST.ADDRESS_ZERO, user1_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_OWNER )
											})

											it( 'Trying to transfer tokens to the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_TRANSFER, async () => {
												await expect( contract.connect( user1 ).transferFrom( token_owner_address, CST.ADDRESS_ZERO, 1 ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_TRANSFER )
											})

											it( 'User1 trying to transfer more tokens than TokenOwner owns should be reverted with ' + ERROR.IERC20_INSUFFICIENT_BALANCE, async () => {
												await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, 2 ) ).to.be.revertedWith( ERROR.IERC20_INSUFFICIENT_BALANCE )
											})

											it( 'User1 trying to transfer more tokens than allowed should be reverted with ' + ERROR.IERC20_CALLER_NOT_ALLOWED, async () => {
												await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, 10 ) ).to.be.revertedWith( ERROR.IERC20_CALLER_NOT_ALLOWED )
											})
										}
									})
								})
							}
						})

						describe( CONTRACT.METHODS.transferFrom.SIGNATURE, () => {
							if ( TEST.METHODS.transferFrom ) {
								it( 'Trying to transfer from a token owner while not allowed should be reverted with ' + ERROR.IERC20_CALLER_NOT_ALLOWED, async () => {
									await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, 1 ) ).to.be.revertedWith( ERROR.IERC20_CALLER_NOT_ALLOWED )
								})
							}
						})
					}
				})

				describe( CONTRACT.METHODS.mintBatch.SIGNATURE, () => {
					if ( TEST.METHODS.mintBatch ) {
						it( 'Airdropping 10 tokens to multiple users', async () => {
							let recipients = [ token_owner_address, user1_address ]
							await contract.functions[ CONTRACT.METHODS.mintBatch.SIGNATURE ]( recipients, 10 )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 10 )
							expect( await contract.balanceOf( user1_address ) ).to.equal( 10 )
							expect( await contract.totalSupply() ).to.equal( 20 )
						})
					}
				})

				describe( CONTRACT.METHODS.mintBatch_ol.SIGNATURE, () => {
					if ( TEST.METHODS.mintBatch_ol ) {
						it( 'Airdropping different number of tokens to multiple users', async () => {
							let recipients = [ token_owner_address, user1_address ]
							let amounts = [ 10, 1 ]
							await contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( recipients, amounts )
							expect( await contract.balanceOf( token_owner_address ) ).to.equal( 10 )
							expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
							expect( await contract.totalSupply() ).to.equal( 11 )
						})

						it( 'Trying to airdrop tokens to the null address should be reverted with ' + ERROR.IERC20_NULL_ADDRESS_MINT, async () => {
							let recipients = [ token_owner_address, CST.ADDRESS_ZERO ]
							let amounts = [ 1, 2 ]
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( recipients, amounts ) ).to.be.revertedWith( ERROR.IERC20_NULL_ADDRESS_MINT )
						})

						it( 'Input arrays with different numbers of parameters should be reverted with ' + ERROR.IERC20_ARRAY_LENGTH_MISMATCH, async () => {
							await expect( contract.functions[ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ]( [user1_address, user2_address], [1] ) ).to.be.revertedWith( ERROR.IERC20_ARRAY_LENGTH_MISMATCH )
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.allowance.SIGNATURE ] = {
						err  : null,
						args : [
							contract_deployer_address,
							user1_address,
						]
					}
					defaultArgs [ CONTRACT.METHODS.approve.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
						]
					}
					defaultArgs [ CONTRACT.METHODS.totalSupply.SIGNATURE ] = {
						err  : null,
						args : []
					}
					defaultArgs [ CONTRACT.METHODS.transfer.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.transferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							contract_deployer_address,
							user1_address,
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.mint.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.mintBatch.SIGNATURE ] = {
						err  : null,
						args : [
							[ token_owner_address ],
							10,
						]
					}
					defaultArgs [ CONTRACT.METHODS.mintBatch_ol.SIGNATURE ] = {
						err  : null,
						args : [
							[ token_owner_address ],
							[ 10 ],
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

module.exports = { shouldBehaveLikeERC20Base }
