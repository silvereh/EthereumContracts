const chai = require( 'chai' )
const chaiAsPromised = require( 'chai-as-promised' )

chai.use( chaiAsPromised )

const expect = chai.expect ;
const { ethers } = require( 'hardhat' )

// For expected thrown errors
const THROW = {
	MISSING_ARGUMENT         : /missing argument/,
	UNEXPECTED_ARGUMENT      : /too many arguments/,
	INCORRECT_DATA_LENGTH    : /incorrect data length/,
	INVALID_ADDRESS          : /invalid address/,
	INVALID_ADDRESS_OR_ENS   : /invalid address or ENS name/,
	INVALID_ADDRESS_STR      : /resolver or addr is not configured for ENS name/,
	INVALID_BIG_NUMBER_STR   : /invalid BigNumber string/,
	INVALID_BIG_NUMBER_VALUE : /invalid BigNumber value/,
	INVALID_ARRAYIFY_VALUE   : /invalid arrayify value/,
	OVERFLOW                 : /overflow/,
	UNDERFLOW                : /underflow/,
	OUT_OF_GAS               : /out of gas/,
	STRING_ARRAY             : /charCodeAt is not a function/,
	VALUE_OUT_OF_BOUNDS      : /value out-of-bounds/,
}

// For constant test variables
const TEST_VAR = {
	ADDRESS      : '0x6A740a382dAd40a4713651B7B76b08C1Acc32b5e',
	BYTES4       : ethers.BigNumber.from( '0x01ffc9a7' ).toHexString(),
	BYTES32      : ethers.BigNumber.from( ethers.utils.keccak256( '0x6A740a382dAd40a4713651B7B76b08C1Acc32b5e' ) ).toHexString(),
	BYTES_ARRAY  : ethers.utils.randomBytes( 16 ),
	BOOLEAN      : true,
	STRING       : 'hello',
	EMPTY_STRING : '',
	NUMBER_ZERO  : 0,
	NUMBER_ONE   : 1,
	BIG_NUMBER   : ethers.BigNumber.from( '0x01ffc9a7' ),
}

const addressCases = varName => {
	return [
		{
			testError : THROW.INVALID_ADDRESS_OR_ENS,
			testName  : 'Input array of address instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"',
			testVar   : [ TEST_VAR.ADDRESS ],
		},
		{
			testError : THROW.INVALID_ADDRESS,
			testName  : 'Input bytes4 instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS + '"',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : THROW.INVALID_ADDRESS,
			testName  : 'Input bytes32 instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS + '"',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : THROW.INVALID_ADDRESS_OR_ENS,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_ADDRESS_OR_ENS,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : THROW.INVALID_ADDRESS_OR_ENS,
			testName  : 'Input number instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : THROW.INVALID_ADDRESS_OR_ENS,
			testName  : 'Input BigNumber instead of `' + varName + '` should throw "' + THROW.INVALID_ADDRESS_OR_ENS + '"',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const bytes4Cases = varName => {
	return [
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input address instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input array of bytes4 instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : [ TEST_VAR.BYTES4 ],
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input bytes32 instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input number instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input BigNumber instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const bytes32Cases = varName => {
	return [
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input address instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input bytes4 instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input array of bytes32 instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : [ TEST_VAR.BYTES32 ],
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input number instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : THROW.INCORRECT_DATA_LENGTH,
			testName  : 'Input BigNumber instead of `' + varName + '` should throw "' + THROW.INCORRECT_DATA_LENGTH + '"',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const bytesArrayCases = varName => {
	return [
		{
			testError : null,
			testName  : 'Input address instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : null,
			testName  : 'Input bytes4 instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : null,
			testName  : 'Input bytes32 instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input array of bytes[] instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : [ TEST_VAR.BYTES_ARRAY ],
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_ARRAYIFY_VALUE,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_ARRAYIFY_VALUE + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : null,
			testName  : 'Input number instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : null,
			testName  : 'Input BigNumber instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const booleanCases = varName => {
	return [
		{
			testError : null,
			testName  : 'Input address instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : null,
			testName  : 'Input bytes4 instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : null,
			testName  : 'Input bytes32 instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : null,
			testName  : 'Input bytes[] instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.BYTES_ARRAY,
		},
		{
			testError : null,
			testName  : 'Input array of booldean instead of `' + varName + '` should be converted to `true`',
			testVar   : [ TEST_VAR.BOOLEAN ],
		},
		{
			testError : null,
			testName  : 'Input string instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : null,
			testName  : 'Input empty string instead of `' + varName + '` should be converted to `false`',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : null,
			testName  : 'Input number instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : null,
			testName  : 'Input number zero instead of `' + varName + '` should be converted to `false`',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : null,
			testName  : 'Input BigNumber instead of `' + varName + '` should be converted to `true`',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const stringCases = varName => {
	return [
		{
			testError : null,
			testName  : 'Input address instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : null,
			testName  : 'Input bytes4 instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : null,
			testName  : 'Input bytes32 instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : null,
			testName  : 'Input bytes[] instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BYTES_ARRAY,
		},
		{
			testError : null,
			testName  : 'Input booldean instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : null,
			testName  : 'Input array of string instead of `' + varName + '` should not throw',
			testVar   : [ TEST_VAR.STRING ],
		},
		{
			testError : null,
			testName  : 'Input empty string instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : null,
			testName  : 'Input number instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : null,
			testName  : 'Input number zero instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.NUMBER,
		},
		{
			testError : null,
			testName  : 'Input BigNumber instead of `' + varName + '` should not throw',
			testVar   : TEST_VAR.BIG_NUMBER,
		},
	]
}

const uintCases = varName => {
	return [
		{
			testError : null,
			testName  : 'Input address instead of `' + varName + '` should be converted to a number',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : null,
			testName  : 'Input bytes4 instead of `' + varName + '` should be converted to a number',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : null,
			testName  : 'Input bytes32 instead of `' + varName + '` should be converted to a number',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : THROW.INVALID_BIG_NUMBER_VALUE,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_BIG_NUMBER_VALUE + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_BIG_NUMBER_STR,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_BIG_NUMBER_STR + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : null,
			testName  : 'Input array of number instead of `' + varName + '` should resolve to the last number in the array',
			testVar   : [ TEST_VAR.NUMBER ],
		},
		{
			testError : null,
			testName  : 'Input array of BigNumber instead of `' + varName + '` should resolve to the last BigNumber in the array',
			testVar   : [ TEST_VAR.BIG_NUMBER ],
		},
	]
}

const enumCases = varName => {
	return [
		{
			testError : THROW.VALUE_OUT_OF_BOUNDS,
			testName  : 'Input address instead of `' + varName + '` should throw "' + THROW.VALUE_OUT_OF_BOUNDS + '"',
			testVar   : TEST_VAR.ADDRESS,
		},
		{
			testError : THROW.VALUE_OUT_OF_BOUNDS,
			testName  : 'Input bytes4 instead of `' + varName + '` should throw "' + THROW.VALUE_OUT_OF_BOUNDS + '"',
			testVar   : TEST_VAR.BYTES4,
		},
		{
			testError : THROW.VALUE_OUT_OF_BOUNDS,
			testName  : 'Input bytes32 instead of `' + varName + '` should throw "' + THROW.VALUE_OUT_OF_BOUNDS + '"',
			testVar   : TEST_VAR.BYTES32,
		},
		{
			testError : THROW.INVALID_BIG_NUMBER_VALUE,
			testName  : 'Input booldean instead of `' + varName + '` should throw "' + THROW.INVALID_BIG_NUMBER_VALUE + '"',
			testVar   : TEST_VAR.BOOLEAN,
		},
		{
			testError : THROW.INVALID_BIG_NUMBER_STR,
			testName  : 'Input string instead of `' + varName + '` should throw "' + THROW.INVALID_BIG_NUMBER_STR + '"',
			testVar   : TEST_VAR.STRING,
		},
		{
			testError : THROW.INVALID_BIG_NUMBER_VALUE,
			testName  : 'Input array of number instead of `' + varName + '` should throw "' + THROW.INVALID_BIG_NUMBER_VALUE + '"',
			testVar   : [ TEST_VAR.NUMBER ],
		},
		{
			testError : THROW.VALUE_OUT_OF_BOUNDS,
			testName  : 'Input BigNumber instead of `' + varName + '` should throw "' + THROW.VALUE_OUT_OF_BOUNDS + '"',
			testVar   : [ TEST_VAR.BIG_NUMBER ],
		},
	]
}

const generateFailTest = async ( testedFunc, args = null ) => {
	const numArgs = args?.length || 0

	switch ( numArgs ) {
		case 0:
			await generateFailTest0( testedFunc )
			break;
		case 1:
			await generateFailTest0( testedFunc, args )
			break;
		case 2:
			await generateFailTest1( testedFunc, args )
			break;
		case 3:
			await generateFailTest2( testedFunc, args )
			break;
		case 4:
			await generateFailTest3( testedFunc, args )
			break;
		case 5:
			await generateFailTest4( testedFunc, args )
			break;
		case 6:
			await generateFailTest5( testedFunc, args )
			break;
		case 7:
			await generateFailTest6( testedFunc, args )
			break;
		case 8:
			await generateFailTest7( testedFunc, args )
			break;
		default:
			return;
	}
}

const generateFailTest0 = async ( testedFunc, args = null ) => {
	if ( args?.err ) {
		await expect( testedFunc() )?.to.be.rejectedWith( args.err )
	}
	else {
		await expect( testedFunc() )?.to.be.rejectedWith( THROW.MISSING_ARGUMENT )
	}
}

const generateFailTest1 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1 ) )?.not.to.throw
	}
}

const generateFailTest2 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2 ) )?.not.to.throw
	}
}

const generateFailTest3 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2, args.arg3 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2, args.arg3 ) )?.not.to.throw
	}
}

const generateFailTest4 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2, args.arg3, args.arg4 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2, args.arg3, args.arg4 ) )?.not.to.throw
	}
}

const generateFailTest5 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5 ) )?.not.to.throw
	}
}

const generateFailTest6 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5, args.arg6 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5, args.arg6 ) )?.not.to.throw
	}
}

const generateFailTest7 = async ( testedFunc, args ) => {
	if ( args?.err ) {
		await expect( testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5, args.arg6, args.arg7 ) )?.to.be.rejectedWith( args.err )
	}
	else {
		expect( await testedFunc( args.arg1, args.arg2, args.arg3, args.arg4, args.arg5, args.arg6, args.arg7 ) )?.not.to.throw
	}
}

module.exports = {
	addressCases,
	bytes4Cases,
	bytes32Cases,
	bytesArrayCases,
	booleanCases,
	stringCases,
	uintCases,
	enumCases,
	generateFailTest,
}
