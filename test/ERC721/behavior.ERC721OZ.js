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
		mint              : true,
	},
	USE_CASES : {
		CORRECT_INPUT : true,
		INVALID_INPUT : true,
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
		mint : {
			SIGNATURE : 'mint()',
			PARAMS    : [],
		},
	},
}

// Custom Error type for testing the transfer to ERC721Receiver (copied from Open Zeppelin)
const Error = [ 'None', 'RevertWithError', 'RevertWithMessage', 'RevertWithoutMessage', 'Panic' ]
  .reduce((acc, entry, idx) => Object.assign({ [entry]: idx }, acc), {})

const shouldBehaveLikeERC721OZ = function( fixture, contract_params ) {
	describe( 'Should behave like ERC721OZ', function() {
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

			holder_artifact   = await ethers.getContractFactory( 'Mock_ERC721Receiver' )
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

						it( 'Contract should support IERC721', async function() {
							expect( await contract.supportsInterface( CST.INTERFACE_ID.IERC721 ) ).to.be.true
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
						it( contract_deployer_name + ' should have ' + contract_params.INIT_SUPPLY + ' token', async function() {
							expect( await contract.balanceOf( contract_deployer_address ) ).to.equal( contract_params.INIT_SUPPLY )
						})

						it( user1_name + ' should have 0 token', async function() {
							expect( await contract.balanceOf( user1_address ) ).to.equal( 0 )
						})

						it( 'Balance of null address should be reverted with "' + ERROR.OZERC721_NULL_ADDRESS_BALANCE + '"', async function() {
							await expect( contract.balanceOf( CST.ADDRESS_ZERO ) ).to.be.revertedWith( ERROR.OZERC721_NULL_ADDRESS_BALANCE )
						})
					}
				})

				describe( CONTRACT.METHODS.getApproved.SIGNATURE, function() {
					if ( TEST.METHODS.getApproved ) {
						it( 'Approved addresses for unminted token should be reverted with "' + ERROR.OZERC721_NONEXISTANT_TOKEN + '"', async function() {
							await expect( contract.getApproved( contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
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

				describe( CONTRACT.METHODS.ownerOf.SIGNATURE, function() {
					if ( TEST.METHODS.ownerOf ) {
						it( 'Owner of unminted token should revert with ' + ERROR.OZERC721_NONEXISTANT_TOKEN, async function() {
							await expect( contract.ownerOf( contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
						})
					}
				})

				describe( CONTRACT.METHODS.mint.SIGNATURE, function() {
					if ( TEST.METHODS.mint ) {
						it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from the null address to ' + token_owner_name, async function() {
							await expect( contract.connect( token_owner ).mint() ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( CST.ADDRESS_ZERO, token_owner_address, contract_params.INIT_SUPPLY )
						})

						describe( '1 token ...', function() {
							if ( true ) {
								beforeEach( async function() {
									await contract.connect( token_owner ).mint()
								})

								it( 'Balance of ' + token_owner_name + ' should be 1', async function() {
									expect( await contract.balanceOf( token_owner_address ) ).to.equal( 1 )
								})

								it( 'Owner of token ' + contract_params.INIT_SUPPLY + ' should be ' + token_owner_address, async function() {
									expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
								})

								describe( CONTRACT.METHODS.approve.SIGNATURE, function() {
									if( TEST.METHODS.approve ) {
										it( 'Trying to approve transfer of a token not minted should be reverted with ' + ERROR.OZERC721_NONEXISTANT_TOKEN, async function() {
											await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY + 1 ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to approve transfer of a token not owned should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE, async function() {
											await expect( contract.connect( user1 ).approve( user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE )
										})

										it( 'Contract should emit an "' + CONTRACT.EVENTS.Approval + '" event mentioning ' + user1_name + ' is now approved to trade token ' + contract_params.INIT_SUPPLY + ' on behalf of ' + token_owner_name, async function() {
											await expect( contract.connect( token_owner ).approve( user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Approval ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
										})

										describe( 'Approve transfer of token owned', function() {
											beforeEach( async function() {
												await contract.connect( token_owner ).approve( user1_address, contract_params.INIT_SUPPLY )
											})

											it( user1_name + ' should be approved to transfer token ' + contract_params.INIT_SUPPLY, async function() {
												expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
											})

											describe( user1_name + ' trying to approve trading of token ' + contract_params.INIT_SUPPLY, function() {
												it( 'by ' + token_owner_name + ', should be reverted with ' + ERROR.OZERC721_APPROVE_OWNER, async function() {
													await expect( contract.connect( user1 ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_APPROVE_OWNER )
												})

												it( 'by someone else, should be reverted with "' + ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE + '"', async function() {
													await expect( contract.connect( user1 ).approve( user2_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE )
													// expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( user2_address )
												})
											})

											describe( user1_name + ' should be able to transfer token ' + contract_params.INIT_SUPPLY, function() {
												it( 'To ' + token_owner_name, async function() {
													await contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
												})

												it( 'To themselves', async function() {
													await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'To someone else', async function() {
													await contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user2_address )
												})

												it( 'Approved users for transfer of token ' + contract_params.INIT_SUPPLY + ' should be reset to ' + CST.ADDRESS_ZERO, async function() {
													await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})
											})

											describe( user1_name + ' should be able to safe transfer token ' + contract_params.INIT_SUPPLY, function() {
												it( 'To ' + token_owner_name, async function() {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( token_owner_address )
												})

												it( 'To themselves', async function() {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'To someone else', async function() {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user2_address )
												})

												it( 'Approved users for transfer of token ' + contract_params.INIT_SUPPLY + ' should be reset to ' + CST.ADDRESS_ZERO, async function() {
													await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})
											})
										})
									}
								})

								describe( CONTRACT.METHODS.safeTransferFrom.SIGNATURE, function() {
									if( TEST.METHODS.safeTransferFrom ) {
										it( 'Trying to safe transfer a token not minted should be reverted with ' + ERROR.OZERC721_NONEXISTANT_TOKEN, async function() {
											await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user2_address, contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to safe transfer a token not owned should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
											await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( contract_deployer_address, user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
										})

										describe( 'Safe transfer of token ' + contract_params.INIT_SUPPLY + ' owned', function() {
											it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
												await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
											})

											describe( 'To the null address', function() {
												it( 'Should be reverted with ' + ERROR.OZERC721_NULL_ADDRESS_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NULL_ADDRESS_TRANSFER )
												})
											})

											describe( 'To other user', function() {
												beforeEach( async function() {
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ' + user1_name, async function() {
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'Balance of ' + token_owner_name + ' should now be 0', async function() {
													expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												})

												it( 'Balance of ' + user1_name + ' should now be 1', async function() {
													expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												})

												it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should still be the null address', async function() {
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})

												it( token_owner_name + ' trying to transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).transferFrom( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to safe transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to approve transfer of token ' + contract_params.INIT_SUPPLY + ' to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE, async function() {
													await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE )
												})
											})

											describe( 'To non ERC721Receiver contract', function() {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, contract_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a valid ERC721Receiver contract', function() {
												it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ERC721Receiver contract', async function() {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, holder.address, 0 ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, holder.address, 0 )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ERC721Receiver contract', async function() {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, holder.address, 0 )
													expect( await contract.ownerOf( 0 ) ).to.equal( holder.address )
													expect( await contract.balanceOf( holder.address ) ).to.equal( 1 )
												})
											})

											describe( 'To a receiver contract returning unexpected value', function () {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a receiver contract that reverts with error', function () {
												it( 'Should be reverted with ' + ERROR.ERC721Receiver_ERROR, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithError )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.ERC721Receiver_ERROR )
												})
											})

											describe( 'To a receiver contract that reverts with message', function () {
												it( 'Should be reverted with ' + ERROR.ERC721Receiver_MESSAGE, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.ERC721Receiver_MESSAGE )
												})
											})

											describe( 'To a receiver contract that reverts without message', function () {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithoutMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
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

								describe( CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE, function() {
									if( TEST.METHODS.safeTransferFrom ) {
										it( 'Trying to safe transfer a token not minted should be reverted with ' + ERROR.OZERC721_NONEXISTANT_TOKEN, async function() {
											await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, user2_address, contract_params.INIT_SUPPLY +  1, '0x' ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to safe transfer a token not owned should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
											await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( contract_deployer_address, user1_address, contract_params.INIT_SUPPLY, '0x' ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
										})

										describe( 'Safe transfer of token ' + contract_params.INIT_SUPPLY + ' owned', function() {
											it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
												await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY, '0x' ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
											})

											describe( 'To the null address', function() {
												it( 'Should be reverted with ' + ERROR.OZERC721_NULL_ADDRESS_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.OZERC721_NULL_ADDRESS_TRANSFER )
												})
											})

											describe( 'To other user', function() {
												beforeEach( async function() {
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY, '0x' )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ' + user1_name, async function() {
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'Balance of ' + token_owner_name + ' should now be 0', async function() {
													expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												})

												it( 'Balance of ' + user1_name + ' should now be 1', async function() {
													expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												})

												it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should still be the null address', async function() {
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})

												it( token_owner_name + ' trying to transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).transferFrom( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to safe transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( user1_address, token_owner_address, contract_params.INIT_SUPPLY, '0x' ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to approve transfer of token ' + contract_params.INIT_SUPPLY + ' to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE, async function() {
													await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE )
												})
											})

											describe( 'To non ERC721Receiver contract', function() {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, contract_address, contract_params.INIT_SUPPLY, '0x' ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a valid ERC721Receiver contract', function() {
												it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ERC721Receiver contract', async function() {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, holder.address, 0, '0x' ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, holder.address, 0 )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ERC721Receiver contract', async function() {
													const holder = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.None )
													await contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, holder.address, 0, '0x' )
													expect( await contract.ownerOf( 0 ) ).to.equal( holder.address )
													expect( await contract.balanceOf( holder.address ) ).to.equal( 1 )
												})
											})

											describe( 'To a receiver contract returning unexpected value', function () {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC165, Error.None )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a receiver contract that reverts with error', function () {
												it( 'Should be reverted with ' + ERROR.ERC721Receiver_ERROR, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithError )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.ERC721Receiver_ERROR )
												})
											})

											describe( 'To a receiver contract that reverts with message', function () {
												it( 'Should be reverted with ' + ERROR.ERC721Receiver_MESSAGE, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.ERC721Receiver_MESSAGE )
												})
											})

											describe( 'To a receiver contract that reverts without message', function () {
												it( 'Should be reverted with ' + ERROR.OZERC721_NON_ERC721_RECEIVER, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.RevertWithoutMessage )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.OZERC721_NON_ERC721_RECEIVER )
												})
											})

											describe( 'To a receiver contract that panics', function () {
												it( 'Should be reverted with ' + ERROR.PANIC, async function () {
													const invalidReceiver = await holder_artifact.deploy( CST.INTERFACE_ID.IERC721Receiver, Error.Panic )
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom_ol.SIGNATURE ]( token_owner_address, invalidReceiver.address, contract_params.INIT_SUPPLY, '0x'  ) ).to.be.revertedWith( ERROR.PANIC )
												})
											})
										})
									}
								})

								describe( CONTRACT.METHODS.setApprovalForAll.SIGNATURE, function() {
									if( TEST.METHODS.setApprovalForAll ) {
										beforeEach( async function() {
											await contract.connect( token_owner ).mint()
										})

										it( 'Contract should emit a "' + CONTRACT.EVENTS.ApprovalForAll + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
											await expect( contract.connect( token_owner ).setApprovalForAll( user1_address, true ) ).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll ).withArgs( token_owner_address, user1_address, true )
										})

										describe( 'Allowing another user to trade owned tokens', function() {
											beforeEach( async function() {
												await contract.connect( token_owner ).setApprovalForAll( user1_address, true )
											})

											it( user1_name + ' should now be allowed to trade tokens owned by ' + token_owner_name, async function() {
												expect( await contract.isApprovedForAll( token_owner_address, user1_address ) ).to.be.true
											})

											describe( user1_name + ' transfering token ' + contract_params.INIT_SUPPLY + ' owned by ' + token_owner_name, async function() {
												describe( 'To ' + token_owner_name, async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + token_owner_name, async function() {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).transferFrom( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( token_owner_address )
													})
												})

												describe( 'To themselves', async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})

												describe( 'To other user', async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user2_name, async function() {
														await expect( contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user2_address, 0 )
													})

													it( user2_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).transferFrom( token_owner_address, user2_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user2_address )
													})
												})
											})

											describe( user1_name + ' safe transfering token ' + contract_params.INIT_SUPPLY + ' owned by ' + token_owner_name, async function() {
												describe( 'To ' + token_owner_name, async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, token_owner_address, 0 )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, token_owner_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( token_owner_address )
													})
												})

												describe( 'To themselves', async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to User2', async function() {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})

												describe( 'To other user', async function() {
													it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to User2', async function() {
														await expect( contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
													})

													it( user1_name + ' should now own token ' + contract_params.INIT_SUPPLY, async function() {
														await contract.connect( user1 ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
														expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).equal( user1_address )
													})
												})
											})

											describe( 'Removing approval for other user to trade owned tokens', function() {
												it( 'Contract should emit an "' + CONTRACT.EVENTS.ApprovalForAll + '" event mentioning ' + user1_name + ' is now not allowed to trade tokens owned by ' + token_owner_name, async function() {
													await expect( contract.connect( token_owner ).setApprovalForAll( user1_address, false ) ).to.emit( contract, CONTRACT.EVENTS.ApprovalForAll ).withArgs( token_owner_address, user1_address, false )
												})

												it( user1_name + ' should not be allowed to trade tokens owned by ' + token_owner_name + ' anymore', async function() {
													await contract.connect( token_owner ).setApprovalForAll( user1_address, false )
													expect( await contract.isApprovedForAll( token_owner_address, user1_address ) ).to.be.false
												})
											})
										})

										it( 'Trying to allow self should be reverted with ' + ERROR.OZERC721_APPROVE_CALLER, async function() {
											await expect( contract.connect( user1 ).setApprovalForAll( user1_address, true ) ).to.be.revertedWith( ERROR.OZERC721_APPROVE_CALLER )
										})
									}
								})

								describe( CONTRACT.METHODS.transferFrom.SIGNATURE, function() {
									if( TEST.METHODS.transferFrom ) {
										it( 'Trying to transfer a token not minted should be reverted with ' + ERROR.OZERC721_NONEXISTANT_TOKEN, async function() {
											await expect( contract.connect( token_owner ).transferFrom( user1_address, user2_address, contract_params.INIT_SUPPLY + 1  ) ).to.be.revertedWith( ERROR.OZERC721_NONEXISTANT_TOKEN )
										})

										it( 'Trying to transfer a token not owned should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
											await expect( contract.connect( user1 ).transferFrom( contract_deployer_address, user1_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
										})

										describe( 'Transfer of token ' + contract_params.INIT_SUPPLY + ' owned', function() {
											it( 'Contract should emit a "' + CONTRACT.EVENTS.Transfer + '" event mentioning token ' + contract_params.INIT_SUPPLY + ' was transfered from ' + token_owner_name + ' to ' + user1_name, async function() {
												await expect( contract.connect( token_owner ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY ) ).to.emit( contract, CONTRACT.EVENTS.Transfer ).withArgs( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
											})

											describe( 'To other user', function() {
												beforeEach( async function() {
													await contract.connect( token_owner ).transferFrom( token_owner_address, user1_address, contract_params.INIT_SUPPLY )
												})

												it( 'Token ' + contract_params.INIT_SUPPLY + ' owner should now be ' + user1_name, async function() {
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( user1_address )
												})

												it( 'Balance of ' + token_owner_name + ' should now be 0', async function() {
													expect( await contract.balanceOf( token_owner_address ) ).to.equal( 0 )
												})

												it( 'Balance of ' + user1_name + ' should now be 1', async function() {
													expect( await contract.balanceOf( user1_address ) ).to.equal( 1 )
												})

												it( 'Approved addresses for token ' + contract_params.INIT_SUPPLY + ' should still be the null address', async function() {
													expect( await contract.getApproved( contract_params.INIT_SUPPLY ) ).to.equal( CST.ADDRESS_ZERO )
												})

												it( token_owner_name + ' trying to transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).transferFrom( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to safe transfer token ' + contract_params.INIT_SUPPLY + ' back to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).functions[ CONTRACT.METHODS.safeTransferFrom.SIGNATURE ]( user1_address, token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_TRANSFER )
												})

												it( token_owner_name + ' trying to approve transfer of token ' + contract_params.INIT_SUPPLY + ' to them should be reverted with ' + ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE, async function() {
													await expect( contract.connect( token_owner ).approve( token_owner_address, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_CALLER_NOT_APPROVED_APPROVE )
												})
											})

											describe( 'To the null address', function() {
												it( 'Should be reverted with ' + ERROR.OZERC721_NULL_ADDRESS_TRANSFER, async function() {
													await expect( contract.connect( token_owner ).transferFrom( token_owner_address, CST.ADDRESS_ZERO, contract_params.INIT_SUPPLY ) ).to.be.revertedWith( ERROR.OZERC721_NULL_ADDRESS_TRANSFER )
												})
											})

											describe( 'To non ERC721Receiver contract', function() {
												it( 'Should not be reverted', async function() {
													await contract.connect( token_owner ).transferFrom( token_owner_address, contract_address, contract_params.INIT_SUPPLY )
													expect( await contract.ownerOf( contract_params.INIT_SUPPLY ) ).to.equal( contract_address )
												})
											})
										})
									}
								})
							}
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', function() {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async function() {
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
					defaultArgs[ CONTRACT.METHODS.mint.SIGNATURE ] = {
						err  : null,
						args : [
							user1_address,
						],
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

module.exports = {
	shouldBehaveLikeERC721OZ,
}
