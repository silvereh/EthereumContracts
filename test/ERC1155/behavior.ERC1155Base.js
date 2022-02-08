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
		TransferSingle : true,
		TransferBatch  : true,
		ApprovalForAll : true,
		URI            : true,
	},
	METHODS : {
		balanceOf             : true,
		balanceOfBatch        : true,
		isApprovedForAll      : true,
		setApprovalForAll     : true,
		safeTransferFrom      : true,
		safeBatchTransferFrom : true,
		supportsInterface     : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : false,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		TransferSingle : 'TransferSingle',
		TransferBatch  : 'TransferBatch',
		ApprovalForAll : 'ApprovalForAll',
		URI            : 'URI',
	},
	METHODS : {
		balanceOf : {
			SIGNATURE : 'balanceOf(address,uint256)',
			PARAMS    : [ 'account_', 'id_' ],
		},
		balanceOfBatch : {
			SIGNATURE : 'balanceOfBatch(address[],uint256[])',
			PARAMS    : [ 'accounts_', 'ids_' ],
		},
		isApprovedForAll : {
			SIGNATURE : 'isApprovedForAll(address,address)',
			PARAMS    : [ 'account_', 'operator_' ],
		},
		setApprovalForAll : {
			SIGNATURE : 'setApprovalForAll(address,bool)',
			PARAMS    : [ 'operator_', 'approved_' ],
		},
		safeTransferFrom : {
			SIGNATURE : 'safeTransferFrom(address,address,uint256,uint256,bytes)',
			PARAMS    : [ 'from_', 'to_', 'id_', 'amount_', 'data_' ],
		},
		safeBatchTransferFrom : {
			SIGNATURE : 'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
			PARAMS    : [ 'from_', 'to_', 'ids_', 'amounts_', 'data_' ],
		},
		supportsInterface : {
			SIGNATURE : 'supportsInterface(bytes4)',
			PARAMS    : [ 'interfaceId_' ],
		},
	},
}

// Custom Error type for testing the transfer to ERC721Receiver (copied from Open Zeppelin)
const Error = [ 'None', 'RevertWithError', 'RevertWithMessage', 'RevertWithoutMessage', 'Panic' ]
  .reduce((acc, entry, idx) => Object.assign({ [entry]: idx }, acc), {})

const shouldBehaveLikeERC1155Base = function( fixture, contract_params ) {
	describe( 'Should behave like ERC1155Base', function() {
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
		let holder_artifact

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
			holder_artifact   = await ethers.getContractFactory( 'Mock_ERC1155Receiver' )
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
							expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC165 ) ).to.be.true
						})

						it( 'Contract should support IERC1155', async function() {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC1155 ) ).to.be.true
						})

						it( 'Contract should not support invalid interface ID', async function() {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.INVALID ) ).to.be.false
						})

						it( 'Contract should not support zero interface ID', async function() {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.NULL ) ).to.be.false
						})
					}
				})

				describe( CONTRACT.METHODS.balanceOf.SIGNATURE, function() {
					if ( TEST.METHODS.balanceOf ) {
						it( 'Balance of the null address should be reverted with ' + ERROR.IERC1155_NULL_ADDRESS_BALANCE, async function() {
							await expect( contract.balanceOf( CST.ADDRESS_ZERO, contract_params.INIT_SERIES ) ).to.be.revertedWith( ERROR.IERC1155_NULL_ADDRESS_BALANCE )
						})

						it( 'Balance of ' + token_owner_name + ' when no tokens have been minted should be ' + contract_params.INIT_SUPPLY, async function() {
							expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.balanceOfBatch.SIGNATURE, function() {
					if ( TEST.METHODS.balanceOfBatch ) {
						it( 'Balance of batch with unequal arrays should be reverted with ' + ERROR.IERC1155_ARRAY_LENGTH_MISMATCH, async function() {
							await expect( contract.balanceOfBatch( [ token_owner_address, user1_address ], [ 1 ] ) ).to.be.revertedWith( ERROR.IERC1155_ARRAY_LENGTH_MISMATCH )
						})

						it( 'Balance of batch containing the null address should be reverted with ' + ERROR.IERC1155_NULL_ADDRESS_BALANCE, async function() {
							await expect( contract.balanceOfBatch( [ CST.ADDRESS_ZERO ], [ contract_params.INIT_SERIES ] ) ).to.be.revertedWith( ERROR.IERC1155_NULL_ADDRESS_BALANCE )
						})

						it( 'Balance of batch when no tokens have been minted should be ' + contract_params.INIT_SUPPLY, async function() {
							const balances = await contract.balanceOfBatch( [ token_owner_address, user1_address ], [ ( contract_params.INIT_SERIES ), ( contract_params.INIT_SERIES ) ] )
							balances.forEach( bal => {
								expect( bal ).to.equal( contract_params.INIT_SUPPLY )
							})
						})
					}
				})

				describe( CONTRACT.METHODS.isApprovedForAll.SIGNATURE, function() {
					if ( TEST.METHODS.isApprovedForAll ) {
						it( token_owner_name + ' does not need approval to handle their tokens, expect false', async function() {
							const hasPermissions = await contract.isApprovedForAll(
								contract_deployer_address,
								contract_deployer_address
							)
							expect( hasPermissions ).to.be.false
						})

						it( user1_name + ' requires ' + token_owner_name + '\'s approval to handle the tokens, expect false', async function() {
							const hasPermissions = await contract.isApprovedForAll(
								contract_deployer_address,
								user1_address
							)
							expect( hasPermissions ).to.be.false
						})
					}
				})

				describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, function() {
					if ( TEST.METHODS.safeTransferFrom ) {
						it( 'Trying to transfer tokens from a series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
							await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})
					}
				})

				describe( 'After minting a token', function() {
					describe( CONTRACT.EVENTS.TransferSingle, function() {
						if ( TEST.EVENTS.TransferSingle ) {
							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferSingle + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + CST.ADDRESS_ZERO + ' to ' + token_owner_name + ' by ' + token_owner_name, async function() {
								await expect( contract.connect( token_owner ).mint( contract_params.INIT_SERIES, 1 ) ).to.emit( contract, CONTRACT.EVENTS.TransferSingle ).withArgs( token_owner_address, CST.ADDRESS_ZERO, token_owner_address, contract_params.INIT_SERIES, 1 )
							})
						}
					})

					describe( 'Mint a token from series ' + contract_params.INIT_SERIES, function() {
						beforeEach( async function() {
							await contract.connect( token_owner ).mint( contract_params.INIT_SERIES, 1 )
						})

						it( 'Balance of ' + token_owner_name + ' for series ' + contract_params.INIT_SERIES + ' should be 1', async function() {
							expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 1 )
						})

						describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, function() {
							if ( TEST.METHODS.safeTransferFrom ) {
								it( 'Trying to transfer more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
									await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 2, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
								})

								it( 'Trying to transfer tokens not owned should be reverted with ' + ERROR.IERC1155_CALLER_NOT_APPROVED, async function() {
									await expect( contract.connect( user1 ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_CALLER_NOT_APPROVED )
								})

								describe( 'Transfer of a token owned', function() {
									it( 'To the null address, should be reverted with ' + ERROR.IERC1155_NULL_ADDRESS_TRANSFER, async function() {
										await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NULL_ADDRESS_TRANSFER )
									})

									it( 'To non ERC1155Receiver contract, should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function() {
										await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, contract_address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
									})

									it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferSingle + ' event mentioning a token of the ' + contract_params.INIT_SERIES + ' series was transfered from ' + token_owner_name + ' to ' + user1_name + ' by ' + token_owner_name, async function() {
										await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 1, '0x' ) ).to.emit( contract, CONTRACT.EVENTS.TransferSingle ).withArgs( token_owner_address, token_owner_address, user1_address, contract_params.INIT_SERIES, 1 )
									})

									it( 'To other user', async function() {
										await contract.connect( token_owner ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 1, '0x' )
										expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
										expect( await contract.balanceOf( user1_address, contract_params.INIT_SERIES ) ).to.equal( 1 )
									})

									it( 'To a valid receiver contract', async function() {
										const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155SingleReceiver, Error.None )
										await contract.connect( token_owner ).safeTransferFrom( token_owner_address, holder.address, contract_params.INIT_SERIES, 1, '0x' )
										expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
										expect( await contract.balanceOf( holder.address, contract_params.INIT_SERIES ) ).to.equal( 1 )
									})

									describe( 'To a receiver contract returning unexpected value', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
											await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, invalidReceiver.address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
										})
									})

									describe( 'To a receiver contract that reverts with error', function () {
										it( 'Should be reverted with custom error', async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155SingleReceiver, Error.RevertWithError )
											await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, invalidReceiver.address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( 'custom error' )
										})
									})

									describe( 'To a receiver contract that reverts with message', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155SingleReceiver, Error.RevertWithMessage )
											await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, invalidReceiver.address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( 'Mock_ERC1155Receiver: reverting' )
										})
									})

									describe( 'To a receiver contract that reverts without message', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155SingleReceiver, Error.RevertWithoutMessage )
											await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, invalidReceiver.address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
										})
									})

									describe( 'To a receiver contract that panics', function () {
										it( 'Should be reverted with ' + ERROR.PANIC, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155SingleReceiver, Error.Panic )
											await expect( contract.connect( token_owner ).safeTransferFrom( token_owner_address, invalidReceiver.address, contract_params.INIT_SERIES, 1, '0x' ) ).to.be.revertedWith( ERROR.PANIC )
										})
									})
								})
							}
						})

						describe( CONTRACT.METHODS.setApprovalForAll.SIGNATURE, function() {
							if ( TEST.METHODS.setApprovalForAll ) {
								describe( CONTRACT.EVENTS.ApprovalForAll, function() {
									if ( TEST.EVENTS.ApprovalForAll ) {
										it( 'Contract should emit a "' + CONTRACT.EVENTS.ApprovalForAll + '" event mentioning that ' + user1_name + ' is now allowed to transfer tokens on behalf of ' + token_owner_name, async function() {
											await expect( contract.connect( token_owner ).setApprovalForAll( user1_address, true ) ).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll ).withArgs( token_owner_address, user1_address, true )
										})
									}
								})

								it( 'Trying to approve oneself should be reverted with ' + ERROR.IERC1155_APPROVE_CALLER, async function() {
									await expect( contract.connect( token_owner ).setApprovalForAll( token_owner_address, true ) ).to.be.revertedWith( ERROR.IERC1155_APPROVE_CALLER )
								})

								describe( 'Allowing another user to trade owned tokens', function() {
									beforeEach( async function() {
										await contract.connect( token_owner ).setApprovalForAll( user1_address, true )
									})

									it( user1_name + ' should now be allowed to trade tokens owned by ' + token_owner_name, async function() {
										expect( await contract.isApprovedForAll( token_owner_address, user1_address ) ).to.be.true
									})

									it( user1_name + ' can now transfer a token on behalf of ' + token_owner_name, async function() {
										await contract.connect( user1 ).safeTransferFrom( token_owner_address, user1_address, contract_params.INIT_SERIES, 1, '0x' )
										expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 0 )
										expect( await contract.balanceOf( user1_address, contract_params.INIT_SERIES ) ).to.equal( 1 )
									})
								})
							}
						})
					})
				})

				describe( CONTRACT.METHODS.safeBatchTransferFrom.SIGNATURE, function() {
					if ( TEST.METHODS.safeBatchTransferFrom ) {
						it( 'Trying to batch transfer tokens from series not minted should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
							await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
						})
					}
				})

				describe( 'After minting a batch', function() {
					describe( CONTRACT.EVENTS.TransferBatch, function() {
						if ( TEST.EVENTS.TransferBatch ) {
							it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferBatch + ' event mentioning a token from the series ' + contract_params.INIT_SERIES + ' was transfered from ' + CST.ADDRESS_ZERO + ' to ' + token_owner_name + ' by ' + token_owner_name, async function() {
								await expect( contract.connect( token_owner ).batchMint( [ contract_params.INIT_SERIES ], [ 1 ] ) ).to.emit( contract, CONTRACT.EVENTS.TransferBatch ).withArgs( token_owner_address, CST.ADDRESS_ZERO, token_owner_address, [ contract_params.INIT_SERIES ], [ 1 ] )
							})
						}
					})

					describe( 'Batch mint tokens from a couple of series', function() {
						beforeEach( async function() {
							await contract.connect( token_owner ).batchMint( [ contract_params.INIT_SERIES, contract_params.INIT_SERIES + 1 ], [ 1, 2 ] )
						})

						it( 'Balance of batch should be [ 1, 2 ]', async function() {
							const balances = await contract.balanceOfBatch( [ token_owner_address, token_owner_address ], [ contract_params.INIT_SERIES, contract_params.INIT_SERIES + 1 ] )
							expect( balances[ 0 ] ).to.equal( 1 )
							expect( balances[ 1 ] ).to.equal( 2 )
							expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES ) ).to.equal( 1 )
							expect( await contract.balanceOf( token_owner_address, contract_params.INIT_SERIES + 1 ) ).to.equal( 2 )
						})

						describe( CONTRACT.METHODS.safeBatchTransferFrom.SIGNATURE, function() {
							if ( TEST.METHODS.safeBatchTransferFrom ) {
								it( 'Inputting different array legths should be reverted with ' + ERROR.IERC1155_ARRAY_LENGTH_MISMATCH, async function() {
									await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1, 2 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_ARRAY_LENGTH_MISMATCH )
								})

								it( 'Trying to transfer more tokens than owned should be reverted with ' + ERROR.IERC1155_INSUFFICIENT_BALANCE, async function() {
									await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 2 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_INSUFFICIENT_BALANCE )
								})

								it( 'Trying to transfer tokens not owned should be reverted with ' + ERROR.IERC1155_CALLER_NOT_APPROVED, async function() {
									await expect( contract.connect( user1 ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_CALLER_NOT_APPROVED )
								})

								describe( 'Transfer of a token owned', function() {
									it( 'To the null address, should be reverted with ' + ERROR.IERC1155_NULL_ADDRESS_TRANSFER, async function() {
										await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, CST.ADDRESS_ZERO, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NULL_ADDRESS_TRANSFER )
									})

									it( 'To non ERC1155Receiver contract, should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function() {
										await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, contract_address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
									})

									it( 'Contract should emit a ' + CONTRACT.EVENTS.TransferBatch + ' event mentioning a token of the ' + [ contract_params.INIT_SERIES ] + ' series was transfered from ' + token_owner_name + ' to ' + user1_name + ' by ' + token_owner_name, async function() {
										await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.emit( contract, CONTRACT.EVENTS.TransferBatch ).withArgs( token_owner_address, token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1 ] )
									})

									it( 'To other user', async function() {
										await contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, user1_address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' )
										expect( await contract.balanceOf( token_owner_address, [ contract_params.INIT_SERIES ] ) ).to.equal( 0 )
										expect( await contract.balanceOf( user1_address, [ contract_params.INIT_SERIES ] ) ).to.equal( 1 )
									})

									describe( 'To a receiver contract returning unexpected value', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
											await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, invalidReceiver.address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
										})
									})

									describe( 'To a receiver contract that reverts with error', function () {
										it( 'Should be reverted with custom error', async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155BatchReceiver, Error.RevertWithError )
											await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, invalidReceiver.address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( 'custom error' )
										})
									})

									describe( 'To a receiver contract that reverts with message', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155BatchReceiver, Error.RevertWithMessage )
											await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, invalidReceiver.address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( 'Mock_ERC1155Receiver: reverting' )
										})
									})

									describe( 'To a receiver contract that reverts without message', function () {
										it( 'Should be reverted with ' + ERROR.IERC1155_NON_ERC1155_RECEIVER, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155BatchReceiver, Error.RevertWithoutMessage )
											await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, invalidReceiver.address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.IERC1155_NON_ERC1155_RECEIVER )
										})
									})

									describe( 'To a receiver contract that panics', function () {
										it( 'Should be reverted with ' + ERROR.PANIC, async function () {
											const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC1155BatchReceiver, Error.Panic )
											await expect( contract.connect( token_owner ).safeBatchTransferFrom( token_owner_address, invalidReceiver.address, [ contract_params.INIT_SERIES ], [ 1 ], '0x' ) ).to.be.revertedWith( ERROR.PANIC )
										})
									})
								})
							}
						})
					})
				})
			}
		})

		describe( 'Invalid input ...', function() {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async function() {
					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							contract_params.INIT_SERIES,
						]
					}
					defaultArgs [ CONTRACT.METHODS.balanceOfBatch.SIGNATURE ] = {
						err  : null,
						args : [
							[ token_owner_address ],
							[ contract_params.INIT_SERIES ],
						]
					}
					defaultArgs [ CONTRACT.METHODS.isApprovedForAll.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
						]
					}
					defaultArgs [ CONTRACT.METHODS.setApprovalForAll.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
							true,
						]
					}
					defaultArgs [ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
							contract_params.INIT_SERIES,
							1,
							ethers.utils.randomBytes( 4 ),
						]
					}
					defaultArgs [ CONTRACT.METHODS.safeBatchTransferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
							[ contract_params.INIT_SERIES ],
							[ 1 ],
							ethers.utils.randomBytes( 4 ),
						]
					}
					defaultArgs [ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
						err  : null,
						args : [
							CST.INTERFACE_ID.IERC165,
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

module.exports = { shouldBehaveLikeERC1155Base }
