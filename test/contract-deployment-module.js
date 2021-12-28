const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const deployContract = async ( artifact, params = null ) => {
	const len = params?.length || 0
	switch ( len ) {
		case 0:
			return deployContract0( artifact )
			break
		case 1:
			return deployContract1( artifact, params )
			break
		case 2:
			return deployContract2( artifact, params )
			break
		case 3:
			return deployContract3( artifact, params )
			break
		case 4:
			return deployContract4( artifact, params )
			break
		case 5:
			return deployContract5( artifact, params )
			break
		case 6:
			return deployContract6( artifact, params )
			break
		case 7:
			return deployContract7( artifact, params )
			break
		case 8:
			return deployContract8( artifact, params )
			break
		case 9:
			return deployContract9( artifact, params )
			break
		case 10:
			return deployContract10( artifact, params )
			break
		default:
			console.debug( 'inputting more than 10 arguments in the constructor usually fails')
			return
	}
}

const deployContract0 = async artifact => {
	const contract = await artifact.deploy()
	await contract.deployed()
	return contract
}

const deployContract1 = async ( artifact, params ) => {
	const contract = await artifact.deploy( params[ 0 ] )
	await contract.deployed()
	return contract
}

const deployContract2 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ]
	)
	await contract.deployed()
	return contract
}

const deployContract3 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ]
	)
	await contract.deployed()
	return contract
}

const deployContract4 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ]
	)
	await contract.deployed()
	return contract
}

const deployContract5 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ]
	)
	await contract.deployed()
	return contract
}

const deployContract6 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ],
		params[ 5 ]
	)
	await contract.deployed()
	return contract
}

const deployContract7 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ],
		params[ 5 ],
		params[ 6 ]
	)
	await contract.deployed()
	return contract
}

const deployContract8 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ],
		params[ 5 ],
		params[ 6 ],
		params[ 7 ]
	)
	await contract.deployed()
	return contract
}

const deployContract9 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ],
		params[ 5 ],
		params[ 6 ],
		params[ 7 ],
		params[ 8 ]
	)
	await contract.deployed()
	return contract
}

const deployContract10 = async ( artifact, params ) => {
	const contract = await artifact.deploy(
		params[ 0 ],
		params[ 1 ],
		params[ 2 ],
		params[ 3 ],
		params[ 4 ],
		params[ 5 ],
		params[ 6 ],
		params[ 7 ],
		params[ 8 ],
		params[ 9 ]
	)
	await contract.deployed()
	return contract
}

module.exports = {
	deployContract,
}
