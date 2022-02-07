const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

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
		isRegisteredProxy : true,
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
		isRegisteredProxy : {
			SIGNATURE : 'isRegisteredProxy(address,address)',
			PARAMS    : [ 'tokenOwner_', 'operator_' ],
		},
	},
}

const shouldBehaveLikeITradable = ( contract_name, contract_params ) => {
	describe( 'Should behave like ITradable', () => {
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

		let proxy
		let proxy_address
		let proxy_artifact

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

			proxy_artifact = await ethers.getContractFactory( 'Mock_ProxyRegistry' )
			proxy = await proxy_artifact.deploy()
			await proxy.deployed()
			proxy_address = proxy.address
			await proxy.setProxy( token_owner_address, proxy_user_address )

			contract_artifact = await ethers.getContractFactory( contract_name )
		})

		beforeEach( async () => {
			contract = await deployContract( contract_artifact, [ proxy_address ] )
			contract_address = contract.address
		})

		describe( 'Correct input ...', () => {
			if ( TEST.USE_CASES.CORRECT_INPUT ) {
				describe( CONTRACT.METHODS.isRegisteredProxy.SIGNATURE, () => {
					if ( TEST.METHODS.isRegisteredProxy ) {
						it( proxy_user_name + ' is a registered proxy for ' + token_owner_name, async () => {
							expect( await contract.isRegisteredProxy( token_owner_address, proxy_user_address ) ).to.be.true
						})

						it( proxy_user_name + ' is not a registerd proxy for ' + contract_deployer_name, async () => {
							expect( await contract.isRegisteredProxy( contract_deployer_address, proxy_user_address ) ).to.be.false
						})
					}
				})
			}
		})

		describe( 'Invalid input ...', () => {
			if ( TEST.USE_CASES.INVALID_INPUT ) {
				beforeEach( async () => {
					defaultArgs = {}
					defaultArgs [ CONTRACT.METHODS.isRegisteredProxy.SIGNATURE ] = {
						err  : null,
						args : [
							token_owner_address,
							proxy_user_address,
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

module.exports = { shouldBehaveLikeITradable }
