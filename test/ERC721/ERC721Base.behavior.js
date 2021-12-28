const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect
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
		Transfer       : true,
		Approval       : true,
		ApprovalForAll : true,
	},
	METHODS : {
		supportsInterface : true,
		safeTransferFrom  : true,
		transferFrom      : true,
		balanceOf         : true,
		ownerOf           : true,
		approve           : true,
		getApproved       : true,
		setApprovalForAll : true,
		isApprovedForAll  : true,
		supplyMinted      : true,
		mint              : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
		INTROSPECTION : true,
	},
}

// For contract data
const CONTRACT = {
	EVENTS : {
		Transfer       : 'Transfer',
		Approval       : 'Approval',
		ApprovalForAll : 'ApprovalForAll',
	},
	METHODS : {
		supportsInterface : {
			SIGNATURE : 'supportsInterface(bytes4)',
			PARAMS    : [ 'interfaceId_' ],
		},
		safeTransferFrom : {
			SIGNATURE : 'safeTransferFrom(address,address,uint256)',
			PARAMS    : [ 'from_', 'to_', 'tokenId_' ],
		},
		safeTransferFrom_ol : {
			SIGNATURE : 'safeTransferFrom(address,address,uint256,bytes)',
			PARAMS    : [ 'from_', 'to_', 'tokenId_', 'data_' ],
		},
		transferFrom : {
			SIGNATURE : 'transferFrom(address,address,uint256)',
			PARAMS    : [ 'from_', 'to_', 'tokenId_' ],
		},
		balanceOf : {
			SIGNATURE : 'balanceOf(address)',
			PARAMS    : [ 'tokenOwner_' ],
		},
		ownerOf : {
			SIGNATURE : 'ownerOf(uint256)',
			PARAMS    : [ 'tokenId_' ],
		},
		approve : {
			SIGNATURE : 'approve(address,uint256)',
			PARAMS    : [ 'to_', 'tokenId_' ],
		},
		getApproved : {
			SIGNATURE : 'getApproved(uint256)',
			PARAMS    : [ 'tokenId_' ],
		},
		setApprovalForAll : {
			SIGNATURE : 'setApprovalForAll(address,bool)',
			PARAMS    : [ 'operator_', 'approved_' ],
		},
		isApprovedForAll : {
			SIGNATURE : 'isApprovedForAll(address,address)',
			PARAMS    : [ 'tokenOwner_', 'operator_' ],
		},
		supplyMinted : {
			SIGNATURE : 'supplyMinted()',
			PARAMS    : [],
		},
		mint : {
			SIGNATURE : 'mint(address)',
			PARAMS    : [ 'to_' ],
		},
	},
}

// Custom Error type for testing the transfer to ERC721Receiver (copied from Open Zeppelin)
const Error = [ 'None', 'RevertWithMessage', 'RevertWithoutMessage', 'Panic' ]
  .reduce((acc, entry, idx) => Object.assign({ [entry]: idx }, acc), {})

const shouldBehaveLikeERC721Base = ( contract_name, contract_params ) => {
	describe( 'Should behave like ERC721Base', () => {
		let contract_deployer_address
		let token_owner_address
		let proxy_user_address
		let wl_user1_address
		let wl_user2_address
		let user1_address
		let user2_address

		let contract_artifact
		let contract_address
		let contract
		let holder_artifact

		let addrs

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
			holder_artifact   = await ethers.getContractFactory( 'MockERC721Receiver' )
		})

		beforeEach( async () => {
			contract = await deployContract( contract_artifact, contract_params.CONSTRUCT )
			contract_address = contract.address
		})

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				describe( CONTRACT.METHODS.supportsInterface.SIGNATURE, () => {
					if ( TEST.METHODS.supportsInterface ) {
						it( 'Contract should support IERC165', async () => {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC165 ) ).to.be.true
						})

						it( 'Contract should support IERC721', async () => {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC721 ) ).to.be.true
						})

						it( 'Contract should not support invalid interface ID', async () => {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.INVALID ) ).to.be.false
						})

						it( 'Contract should not support zero interface ID', async () => {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.NULL ) ).to.be.false
						})
					}
				})

				describe( CONTRACT.METHODS.balanceOf.SIGNATURE, () => {
					if ( TEST.METHODS.balanceOf ) {
						it( contract_deployer_name + ' should have ' + contract_params.INIT_SUPPLY + ' token', async () => {
							expect( await contract.balanceOf( contract_deployer_address ) ).to.equal( contract_params.INIT_SUPPLY )
						})

						it( user1_name + ' should have 0 token', async () => {
							expect( await contract.balanceOf( user1_address ) ).to.equal( 0 )
						})

						it( 'Trying to get the balance of null address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_BALANCE, async () => {
							await expect( contract.balanceOf( CST.ADDRESS_ZERO ) ).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_BALANCE )
						})
					}
				})

				describe( CONTRACT.METHODS.getApproved.SIGNATURE, () => {
					if ( TEST.METHODS.getApproved ) {
						it( 'Approved addresses for unminted token should be reverted with "' + ERROR.IERC721_NONEXISTANT_TOKEN + '"', async () => {
							await expect( contract.getApproved( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})
					}
				})

				describe( CONTRACT.METHODS.isApprovedForAll.SIGNATURE, () => {
					if ( TEST.METHODS.isApprovedForAll ) {
						it( token_owner_name + ' does not need approval to handle their tokens, expect false', async () => {
							const hasPermissions = await contract.isApprovedForAll(
								contract_deployer_address,
								contract_deployer_address
							)
							expect( hasPermissions ).to.be.false
						})

						it( user1_name + ' requires ' + token_owner_name + '\'s approval to handle the tokens, expect false', async () => {
							const hasPermissions = await contract.isApprovedForAll(
								contract_deployer_address,
								user1_address
							)
							expect( hasPermissions ).to.be.false
						})
					}
				})

				describe( CONTRACT.METHODS.ownerOf.SIGNATURE, () => {
					if ( TEST.METHODS.ownerOf ) {
						it( 'Owner of unminted token should revert with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
							await expect( contract.ownerOf( contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
						})
					}
				})

				describe( CONTRACT.METHODS.supplyMinted.SIGNATURE, () => {
					if ( TEST.METHODS.supplyMinted ) {
						it( 'Supply minted should be ' + contract_params.INIT_SUPPLY, async () => {
							expect( await contract.supplyMinted() ).to.equal( contract_params.INIT_SUPPLY )
						})
					}
				})

				describe( CONTRACT.METHODS.mint.SIGNATURE, () => {
					if ( TEST.METHODS.mint ) {
						it( 'To non ERC721Receiver contract should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async () => {
							await expect( contract.mint( contract_address ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
						})

						it( 'To the null address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async () => {
							await expect( contract.mint( CST.ADDRESS_ZERO ) ).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
						})

						it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from the null address to ' + token_owner_name, async () => {
							await expect( contract.mint( token_owner_address ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( CST.ADDRESS_ZERO, token_owner_address, contract_params.INIT_SUPPLY )
						})

						describe( '1 token ...', () => {
							if ( true ) {
								beforeEach( async () => {
									await contract.mint( token_owner_address )
								})

								it( 'Balance of ' + token_owner_name + ' should be 1', async () => {
									expect( await contract.balanceOf( token_owner_address ) ).to.equal( 1 )
								})

								it( 'Owner of token ' + contract_params.INIT_SUPPLY + ' should be ' + token_owner_address, async () => {
									expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
								})

								it( 'Supply minted should be ' + ( contract_params.INIT_SUPPLY + 1 ).toString(), async () => {
									expect( await contract.supplyMinted() ).to.equal( contract_params.INIT_SUPPLY + 1 )
								})

								describe( CONTRACT.METHODS.approve.SIGNATURE, () => {
									if( TEST.METHODS.approve ) {
										it( 'Trying to approve transfer of a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
											await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to approve transfer of a token not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
											await expect( contract.connect( user1 ).approve( user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
										})

										it( 'Contract should emit an "' + CONTRACT.EVENTS.Approval + '" event mentioning ' + user1_name + ' is now approved to trade token ' + contract_params.INIT_SUPPLY + ' on behalf of ' + token_owner_name, async () => {
											await expect( contract.connect( token_owner ).approve( user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Approval ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
										})

										describe( 'Approve transfer of token owned', () => {
											beforeEach( async () => {
												await contract.connect( token_owner ).approve( user1_address, contract_params.INIT_SUPPLY )
											})

											it( user1_name + ' should be approved to transfer token ' + contract_params.INIT_SUPPLY, async () => {
												expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
											})

											describe( user1_name + ' trying to approve trading of token ' + contract_params.INIT_SUPPLY, () => {
												it( 'by ' + token_owner_name + ', should be reverted with ' + ERROR.IERC721_APPROVE_OWNER, async () => {
													await expect( contract.connect( user1 ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_APPROVE_OWNER )
												})

												it( 'by someone else, should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( user1 ).approve( user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})
											})

											describe( user1_name + ' should be able to transfer token ' + contract_params.INIT_SUPPLY, () => {
												it( 'To ' + token_owner_name, async () => {
													await contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
												})

												it( 'To themselves', async () => {
													await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'To someone else', async () => {
													await contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user2_address )
												})

												it( 'Approved users for transfer of token ' + contract_params.INIT_SUPPLY + ' should be reset to ' + CST.ADDRESS_ZERO, async () => {
													await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})
											})

											describe( user1_name + ' should be able to safe transfer token ' + contract_params.INIT_SUPPLY, () => {
												it( 'To ' + token_owner_name, async () => {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
												})

												it( 'To themselves', async () => {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'To someone else', async () => {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user2_address )
												})

												it( 'Approved users for transfer of token ' + contract_params.INIT_SUPPLY + ' should be reset to ' + CST.ADDRESS_ZERO, async () => {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})
											})
										})
									}
								})

								describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, () => {
									if( TEST.METHODS.safeTransferFrom ) {
										it( 'Trying to safe transfer a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
											await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user2_address, contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to safe transfer a token not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
											await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( contract_deployer_address, user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
										})

										it( 'Trying to safe transfer a token not owned from owned wallet should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
											await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
										})

										it( 'Trying to safe transfer a token owned from not owned wallet should be reverted with ' + ERROR.IERC721_TOKEN_NOT_OWNED, async () => {
											await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_TOKEN_NOT_OWNED )
										})

										it( 'Trying to safe transfer a token to the null address should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async () => {
											await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
										})

										describe( 'Safe transfer of token ' + contract_params.INIT_SUPPLY + ' owned', () => {
											it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async () => {
												await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
											})

											describe( 'To the null address', () => {
												it( 'Should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async () => {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
												})
											})

											describe( 'To other user', () => {
												beforeEach( async () => {
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ' + user1_name, async () => {
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'Supply minted should still be ' + contract_params.INIT_SUPPLY + '1', async () => {
													expect( await contract.supplyMinted() ).to.equal( contract_params.INIT_SUPPLY + 1 )
												})

												it( 'Balance of ' + token_owner_name + ' should now be 0', async () => {
													expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												})

												it( 'Balance of ' + user1_name + ' should now be 1', async () => {
													expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												})

												it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should still be the null address', async () => {
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})

												it( token_owner_name + ' trying to transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).transferFrom( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})

												it( token_owner_name + ' trying to safe transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})

												it( token_owner_name + ' trying to approve transfer of token ' + contract_params.INIT_SUPPLY + ' to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})
											})

											describe( 'To non ERC721Receiver contract', () => {
												it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async () => {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, contract_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a valid ERC721Receiver contract', () => {
												it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ERC721Receiver contract', async () => {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, holder.address, 0 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, holder.address, 0 )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ERC721Receiver contract', async () => {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, holder.address, 0 )
													expect( await contract.ownerOf( 0 ) ).to.equal( holder.address )
													expect( await contract.balanceOf( holder.address ) ).to.equal( 1 )
												})
											})

											describe( 'To a receiver contract returning unexpected value', function () {
												it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a receiver contract that reverts with message', function () {
												it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( 'ERC721ReceiverMock: reverting' )
												})
											})

											describe( 'To a receiver contract that reverts without message', function () {
												it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithoutMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a receiver contract that panics', function () {
												it( 'Should be reverted with ' + ERROR.PANIC, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.Panic )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.PANIC )
												})
											})
										})
									}
								})

								describe( CONTRACT.METHODS.setApprovalForAll.SIGNATURE, () => {
									if( TEST.METHODS.setApprovalForAll ) {
										beforeEach( async () => {
											await contract.mint( token_owner_address )
										})

										it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async () => {
											await expect( contract.connect( token_owner ).setApprovalForAll( user1_address, true ) ).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll ).withArgs( token_owner_address, user1_address, true )
										})

										describe( 'Allowing another user to trade owned tokens', () => {
											beforeEach( async () => {
												await contract.connect( token_owner ).setApprovalForAll( user1_address, true )
											})

											it( user1_name + ' should now be allowed to trade tokens owned by ' + token_owner_name, async () => {
												expect( await contract.isApprovedForAll( token_owner_address, user1_address ) ).to.be.true
											})

											describe( user1_name + ' transfering token ' + contract_params.INIT_SUPPLY + ' owned by ' + token_owner_name, async () => {
												describe( 'To ' + token_owner_name, async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + token_owner_name, async () => {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( token_owner_address )
													})
												})

												describe( 'To themselves', async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async () => {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})

												describe( 'To other user', async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user2_name, async () => {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user2_address, 0 )
													})

													it( user2_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user2_address )
													})
												})
											})

											describe( user1_name + ' safe transfering token ' + contract_params.INIT_SUPPLY + ' owned by ' + token_owner_name, async () => {
												describe( 'To ' + token_owner_name, async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async () => {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, token_owner_address, 0 )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( token_owner_address )
													})
												})

												describe( 'To themselves', async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to User2', async () => {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})

												describe( 'To other user', async () => {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to User2', async () => {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async () => {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})
											})

											describe( 'Removing approval for other user to trade owned tokens', () => {
												it( 'Contract should emit an "' + CONTRACT.EVENTS.ApprovalForAll + '" event mentioning ' + user1_name + ' is now not allowed to trade tokens owned by ' + token_owner_name, async () => {
													await expect( contract.connect( token_owner ).setApprovalForAll( user1_address, false ) ).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll ).withArgs( token_owner_address, user1_address, false )
												})

												it( user1_name + ' should not be allowed to trade tokens owned by ' + token_owner_name + ' anymore', async () => {
													await contract.connect( token_owner ).setApprovalForAll( user1_address, false )
													expect( await contract.isApprovedForAll( token_owner_address, user1_address ) ).to.be.false
												})
											})
										})

										it( 'Trying to allow self should be reverted with ' + ERROR.IERC721_APPROVE_CALLER, async () => {
											await expect( contract.connect( user1 ).setApprovalForAll( user1_address, true ) ).to.be.revertedWith( ERROR.IERC721_APPROVE_CALLER )
										})
									}
								})

								describe( CONTRACT.METHODS.transferFrom.SIGNATURE, () => {
									if( TEST.METHODS.transferFrom ) {
										it( 'Trying to transfer a token not minted should be reverted with ' + ERROR.IERC721_NONEXISTANT_TOKEN, async () => {
											await expect( contract.connect( token_owner ).transferFrom( user1_address, user2_address, contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.IERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to transfer a token not owned should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
											await expect( contract.connect( user1 ).transferFrom( contract_deployer_address, user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
										})

										it( 'Trying to transfer a token not owned from owned wallet should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
											await expect( contract.connect( user1 ).transferFrom( user1_address, user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
										})

										it( 'Trying to transfer a token owned from not owned wallet should be reverted with ' + ERROR.IERC721_TOKEN_NOT_OWNED, async () => {
											await expect( contract.connect( token_owner ).transferFrom( user1_address, user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_TOKEN_NOT_OWNED )
										})

										describe( 'Transfer of token ' + contract_params.INIT_SUPPLY + ' owned', () => {
											it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async () => {
												await expect( contract.connect( token_owner ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
											})

											describe( 'To other user', () => {
												beforeEach( async () => {
													await contract.connect( token_owner ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ' + user1_name, async () => {
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'Supply minted should still be ' + ( contract_params.INIT_SUPPLY + 1 ).toString(), async () => {
													expect( await contract.supplyMinted() ).to.equal( contract_params.INIT_SUPPLY + 1 )
												})

												it( 'Balance of ' + token_owner_name + ' should now be 0', async () => {
													expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												})

												it( 'Balance of ' + user1_name + ' should now be 1', async () => {
													expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												})

												it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should still be the null address', async () => {
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})

												it( token_owner_name + ' trying to transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).transferFrom( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})

												it( token_owner_name + ' trying to safe transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})

												it( token_owner_name + ' trying to approve transfer of token ' + contract_params.INIT_SUPPLY + ' to them should be reverted with ' + ERROR.IERC721_CALLER_NOT_APPROVED, async () => {
													await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_CALLER_NOT_APPROVED )
												})
											})

											describe( 'To the null address', () => {
												it( 'Should be reverted with ' + ERROR.IERC721_NULL_ADDRESS_TRANSFER, async () => {
													await expect( contract.connect( token_owner ).transferFrom( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.IERC721_NULL_ADDRESS_TRANSFER )
												})
											})

											describe( 'To non ERC721Receiver contract', () => {
												it( 'Should not be reverted', async () => {
													await contract.connect( token_owner ).transferFrom( token_owner_address, contract_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( contract_address )
												})
											})
										})
									}
								})
							}
						})

						describe( 'To non ERC721Receiver contract', () => {
							it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async () => {
								await expect( contract.mint( contract_address ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})
						})

						describe( 'To a valid ERC721Receiver contract', () => {
							it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + CST.ADDRESS_ZERO + ' to ERC721Receiver contract', async () => {
								const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
								await expect( contract.mint( holder.address ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( CST.ADDRESS_ZERO, holder.address, 0 )
							})

							it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ERC721Receiver contract', async () => {
								const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
								await contract.mint( holder.address )
								expect( await contract.ownerOf( 0 ) ).to.equal( holder.address )
								expect( await contract.balanceOf( holder.address ) ).to.equal( 1 )
							})
						})

						describe( 'To a receiver contract returning unexpected value', function () {
							it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
								await expect( contract.mint( invalidReceiver.address ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})
						})

						describe( 'To a receiver contract that reverts with message', function () {
							it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithMessage )
								await expect( contract.mint( invalidReceiver.address ) ).to.be.revertedWith( 'ERC721ReceiverMock: reverting' )
							})
						})

						describe( 'To a receiver contract that reverts without message', function () {
							it( 'Should be reverted with ' + ERROR.IERC721_NON_ERC721_RECEIVER, async function () {
								const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithoutMessage )
								await expect( contract.mint( invalidReceiver.address ) ).to.be.revertedWith( ERROR.IERC721_NON_ERC721_RECEIVER )
							})
						})

						describe( 'To a receiver contract that panics', function () {
							it( 'Should be reverted with ' + ERROR.PANIC, async function () {
								const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.Panic )
								await expect( contract.mint( invalidReceiver.address ) ).to.be.revertedWith( ERROR.PANIC )
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
					defaultArgs[ CONTRACT.METHODS.supportsInterface.SIGNATURE ] = {
						err  : null,
						args : [
							CST.INTERFACE_ID.IERC165,
						]
					}
					defaultArgs[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
							0,
							ethers.utils.randomBytes( 4 ),
						],
					}
					defaultArgs[ CONTRACT.METHODS.transferFrom.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.balanceOf.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
						],
					}
					defaultArgs[ CONTRACT.METHODS.ownerOf.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.approve.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.getApproved.SIGNATURE ] = {
						err  : null,
						args : [
							0,
						],
					}
					defaultArgs[ CONTRACT.METHODS.setApprovalForAll.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							true,
						],
					}
					defaultArgs[ CONTRACT.METHODS.isApprovedForAll.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							user1_address,
						],
					}
					defaultArgs[ CONTRACT.METHODS.supplyMinted.SIGNATURE ] = {
						err  : null,
						args : [],
					}
					defaultArgs[ CONTRACT.METHODS.mint.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
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
	shouldBehaveLikeERC721Base,
}
