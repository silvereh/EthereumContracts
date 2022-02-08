const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

const deployContract = async ( artifact, ERC1967proxyArtifact, params = null ) => {
	const len = params?.length || 0
	switch ( len ) {
		case 0:
			return deployContract0( artifact, ERC1967proxyArtifact )
			break
		case 1:
			return deployContract1( artifact, ERC1967proxyArtifact, params )
			break
		case 2:
			return deployContract2( artifact, ERC1967proxyArtifact, params )
			break
		case 3:
			return deployContract3( artifact, ERC1967proxyArtifact, params )
			break
		case 4:
			return deployContract4( artifact, ERC1967proxyArtifact, params )
			break
		case 5:
			return deployContract5( artifact, ERC1967proxyArtifact, params )
			break
		case 6:
			return deployContract6( artifact, ERC1967proxyArtifact, params )
			break
		case 7:
			return deployContract7( artifact, ERC1967proxyArtifact, params )
			break
		case 8:
			return deployContract8( artifact, ERC1967proxyArtifact, params )
			break
		case 9:
			return deployContract9( artifact, ERC1967proxyArtifact, params )
			break
		case 10:
			return deployContract10( artifact, ERC1967proxyArtifact, params )
			break
		default:
			console.debug( 'inputting more than 10 arguments in the constructor usually fails')
			return
	}
}

const deployContract0 = async ( artifact, ERC1967proxyArtifact ) => {
	if ( ! ERC1967proxyArtifact ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		return contract
	}
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize()
		return contract
	}
}

const deployContract1 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
		const contract = await artifact.deploy( params[ 0 ] )
		await contract.deployed()
		return contract
	}
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize( params[ 0 ] )
		return contract
	}
}

const deployContract2 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
		const contract = await artifact.deploy(
			params[ 0 ],
			params[ 1 ]
		)
		await contract.deployed()
		return contract
	}
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ]
		)
		return contract
	}
}

const deployContract3 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
		const contract = await artifact.deploy(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ]
		)
		await contract.deployed()
		return contract
	}
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ]
		)
		return contract
	}
}

const deployContract4 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
		const contract = await artifact.deploy(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ]
		)
		await contract.deployed()
		return contract
	}
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ]
		)
		return contract
	}
}

const deployContract5 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ],
			params[ 4 ]
		)
		return contract
	}
}

const deployContract6 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ],
			params[ 4 ],
			params[ 5 ]
		)
		return contract
	}
}

const deployContract7 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ],
			params[ 4 ],
			params[ 5 ],
			params[ 6 ]
		)
		return contract
	}
}

const deployContract8 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
			params[ 0 ],
			params[ 1 ],
			params[ 2 ],
			params[ 3 ],
			params[ 4 ],
			params[ 5 ],
			params[ 6 ],
			params[ 7 ]
		)
		return contract
	}
}

const deployContract9 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
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
		return contract
	}
}

const deployContract10 = async ( artifact, ERC1967proxyArtifact, params ) => {
	if ( ! ERC1967proxyArtifact ) {
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
	else if ( ERC1967proxyArtifact === true ) {
		const contract = await artifact.deploy()
		await contract.deployed()
		await contract.initialize(
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
		return contract
	}
}

module.exports = {
	deployContract,
}
