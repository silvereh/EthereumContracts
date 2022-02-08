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
		setWhitelist            : true,
		checkWhitelistAllowance : true,
		consumeWhitelist        : true,
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
		setWhitelist            : {
			SIGNATURE : 'setWhitelist(bytes32,uint256)',
			PARAMS    : [ 'root_', 'passMax_' ],
		},
		checkWhitelistAllowance : {
			SIGNATURE : 'checkWhitelistAllowance(address,bytes32,bool)',
			PARAMS    : [ 'account_', 'proof_', 'flag_' ],
		},
		consumeWhitelist        : {
			SIGNATURE : 'consumeWhitelist(address,bytes32,bool,uint256)',
			PARAMS    : [ 'account_', 'proof_', 'flag_', 'qty_' ],
		},
	},
}

const generatePass = function ( address, root ) {
	const addr = ethers.BigNumber.from( ethers.utils.keccak256( address ) )
	const temp = ethers.BigNumber.from( ethers.BigNumber.from( root ).sub( addr ) )
	const flag = temp.gt( CST.NUMBER_ZERO ) ? false : true
	const pass = temp.gt( CST.NUMBER_ZERO ) ? temp : ethers.BigNumber.from( addr.sub( root ) )

	return { pass: pass, flag: flag }
}

const shouldBehaveLikeIWhitelistable = function( fixture, contract_params ) {
	describe( 'Should behave like IWhitelistable', function() {
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

		let wl_user1_pass
		let wl_user1_flag

		let user1_pass
		let user1_flag

		let wl_user2_pass
		let wl_user2_flag

		let user2_pass
		let user2_flag

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

			let newPass = generatePass( wl_user1_address, contract_params.PASS_ROOT )
			wl_user1_pass = newPass.pass
			wl_user1_flag = newPass.flag

			newPass = generatePass( wl_user2_address, contract_params.PASS_ROOT )
			wl_user2_pass = newPass.pass
			wl_user2_flag = newPass.flag

			newPass = generatePass( user1_address, contract_params.PASS_ROOT )
			user1_pass = newPass.pass
			user1_flag = newPass.flag

			newPass = generatePass( user2_address, contract_params.PASS_ROOT )
			user2_pass = newPass.pass
			user2_flag = newPass.flag
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
				describe( CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE, function() {
					if ( TEST.METHODS.checkWhitelistAllowance ) {
						it( 'Checking whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelistable_NOT_SET, async function() {
							await expect( contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelistable_NOT_SET )
						})
					}
				})

				describe( CONTRACT.METHODS.consumeWhitelist.SIGNATURE, function() {
					if ( TEST.METHODS.consumeWhitelist ) {
						it( 'Trying to consume whitelist while whitelist is not set should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function() {
							await expect( contract.consumeWhitelist( wl_user1_address, wl_user1_pass, wl_user1_flag, 1 ) ).to.be.revertedWith( ERROR.IWhitelistable_FORBIDDEN )
						})
					}
				})

				describe( CONTRACT.METHODS.setWhitelist.SIGNATURE, function() {
					if ( TEST.METHODS.setWhitelist ) {
						it( 'Trying to set a whitelist with no allowance should be reverted with ' + ERROR.IWhitelistable_NO_ALLOWANCE, async function() {
							await expect( contract.setWhitelist( contract_params.PASS_ROOT, 0 ) ).to.be.revertedWith( ERROR.IWhitelistable_NO_ALLOWANCE )
						})

						describe( 'Setting up the whitelist', function() {
							beforeEach( async function() {
								await contract.setWhitelist( contract_params.PASS_ROOT.toHexString(), contract_params.PASS_MAX )
							})

							describe( CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE, function() {
								if ( TEST.METHODS.checkWhitelistAllowance ) {
									it( 'Checking whitelist with correct password should return ' + contract_params.PASS_MAX, async function() {
										expect( await contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.equal( contract_params.PASS_MAX )
									})

									it( 'Checking whitelist with incorrect password should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function() {
										await expect( contract.checkWhitelistAllowance( wl_user1_address, user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelistable_FORBIDDEN )
									})
								}
							})

							describe( CONTRACT.METHODS.consumeWhitelist.SIGNATURE, function() {
								if ( TEST.METHODS.consumeWhitelist ) {
									describe( 'Consuming 1 whitelist spot', function() {
										beforeEach( async function() {
											await contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, wl_user1_pass, wl_user1_flag, 1 )
										})

										it( 'Whitelist check should return ' + ( contract_params.PASS_MAX - 1 ).toString(), async function() {
											expect( await contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.equal( contract_params.PASS_MAX - 1 )
										})

										it( 'Trying to consume an additional ' + contract_params.PASS_MAX + ' whitelist spots should be reverted with ' + ERROR.IWhitelistable_FORBIDDEN, async function() {
											await expect( contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, wl_user1_pass, wl_user1_flag, contract_params.PASS_MAX ) ).to.be.revertedWith( ERROR.IWhitelistable_FORBIDDEN )
										})
									})

									describe( 'Consuming ' + contract_params.PASS_MAX + ' whitelist spots', function() {
										beforeEach( async function() {
											await contract.connect( wl_user1 ).consumeWhitelist( wl_user1_address, wl_user1_pass, wl_user1_flag, contract_params.PASS_MAX )
										})

										it( 'Whitelist check should be reverted with ' + ERROR.IWhitelistable_CONSUMED, async function() {
											await expect( contract.checkWhitelistAllowance( wl_user1_address, wl_user1_pass, wl_user1_flag ) ).to.be.revertedWith( ERROR.IWhitelistable_CONSUMED )
										})
									})
								}
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
					defaultArgs [ CONTRACT.METHODS.setWhitelist.SIGNATURE ] = {
						err  : null,
						args : [
							contract_params.PASS_ROOT,
							contract_params.PASS_MAX,
						],
					}
					defaultArgs [ CONTRACT.METHODS.checkWhitelistAllowance.SIGNATURE ] = {
						err  : null,
						args : [
							wl_user1_address,
							wl_user1_pass,
							wl_user1_flag,
						],
					}
					defaultArgs [ CONTRACT.METHODS.consumeWhitelist.SIGNATURE ] = {
						err  : null,
						args : [
							wl_user1_address,
							wl_user1_pass,
							wl_user1_flag,
							1,
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

module.exports = { shouldBehaveLikeIWhitelistable }
