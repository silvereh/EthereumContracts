// For expected reverted errors
const ERROR = {
	// GENERAL
		PANIC : 'panic code',
	// IERC2981
		IERC2981_INVALID_ROYALTIES : 'IERC2981_INVALID_ROYALTIES',
	// IInitializable
		IInitializable_ALREADY_INITIALIZED : 'IInitializable_ALREADY_INITIALIZED',
	// IOwnable
		IOwnable_NOT_OWNER : 'IOwnable_NOT_OWNER',
	// IPausable
		IPausable_SALE_NOT_CLOSED : 'IPausable_SALE_NOT_CLOSED',
		IPausable_SALE_CLOSED     : 'IPausable_SALE_CLOSED',
		IPausable_PRESALE_CLOSED  : 'IPausable_PRESALE_CLOSED',
	// IWhitelistable
		IWhitelistable_NOT_SET      : 'IWhitelistable_NOT_SET',
		IWhitelistable_CONSUMED     : 'IWhitelistable_CONSUMED',
		IWhitelistable_FORBIDDEN    : 'IWhitelistable_FORBIDDEN',
		IWhitelistable_NO_ALLOWANCE : 'IWhitelistable_NO_ALLOWANCE',
	// IERC721
		IERC721_APPROVE_OWNER         : 'IERC721_APPROVE_OWNER',
		IERC721_APPROVE_CALLER        : 'IERC721_APPROVE_CALLER',
		IERC721_CALLER_NOT_APPROVED   : 'IERC721_CALLER_NOT_APPROVED',
		IERC721_NONEXISTANT_TOKEN     : 'IERC721_NONEXISTANT_TOKEN',
		IERC721_NULL_ADDRESS_BALANCE  : 'IERC721_NULL_ADDRESS_BALANCE',
		IERC721_NULL_ADDRESS_TRANSFER : 'IERC721_NULL_ADDRESS_TRANSFER',
		IERC721_TOKEN_NOT_OWNED       : 'IERC721_TOKEN_NOT_OWNED',
		IERC721_NON_ERC721_RECEIVER   : 'IERC721_NON_ERC721_RECEIVER',
	// IERC721Enumerable
		IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS : 'IERC721Enumerable_OWNER_INDEX_OUT_OF_BOUNDS',
		IERC721Enumerable_INDEX_OUT_OF_BOUNDS       : 'IERC721Enumerable_INDEX_OUT_OF_BOUNDS',
	// ERC20Base
		IERC20_NULL_ADDRESS_TRANSFER : 'IERC20_NULL_ADDRESS_TRANSFER',
		IERC20_NULL_ADDRESS_OWNER    : 'IERC20_NULL_ADDRESS_OWNER',
		IERC20_NULL_ADDRESS_MINT     : 'IERC20_NULL_ADDRESS_MINT',
		IERC20_INSUFFICIENT_BALANCE  : 'IERC20_INSUFFICIENT_BALANCE',
		IERC20_CALLER_NOT_ALLOWED    : 'IERC20_CALLER_NOT_ALLOWED',
		IERC20_ARRAY_LENGTH_MISMATCH : 'IERC20_ARRAY_LENGTH_MISMATCH',
		IERC20_APPROVE_OWNER         : 'IERC20_APPROVE_OWNER',
	// ERC20BaseCapped
		ERC20BaseCapped_INVALID_MAX_SUPPLY  : 'ERC20BaseCapped_INVALID_MAX_SUPPLY',
		ERC20BaseCapped_MAX_SUPPLY_EXCEEDED : 'ERC20BaseCapped_MAX_SUPPLY_EXCEEDED',
	// IERC1155
		IERC1155_APPROVE_CALLER        : 'IERC1155_APPROVE_CALLER',
		IERC1155_CALLER_NOT_APPROVED   : 'IERC1155_CALLER_NOT_APPROVED',
		IERC1155_NULL_ADDRESS_BALANCE  : 'IERC1155_NULL_ADDRESS_BALANCE',
		IERC1155_NULL_ADDRESS_TRANSFER : 'IERC1155_NULL_ADDRESS_TRANSFER',
		IERC1155_NON_ERC1155_RECEIVER  : 'IERC1155_NON_ERC1155_RECEIVER',
		IERC1155_ARRAY_LENGTH_MISMATCH : 'IERC1155_ARRAY_LENGTH_MISMATCH',
		IERC1155_INSUFFICIENT_BALANCE  : 'IERC1155_INSUFFICIENT_BALANCE',
	// OZERC721
		OZERC721_APPROVE_CALLER               : 'approve to caller',
		OZERC721_APPROVE_OWNER                : 'approval to current owner',
		OZERC721_CALLER_NOT_APPROVED_APPROVE  : 'approve caller is not owner nor approved for all',
		OZERC721_CALLER_NOT_APPROVED_TRANSFER : 'transfer caller is not owner nor approved',
		OZERC721_MINT_EXISTING_TOKEN          : 'token already minted',
		OZERC721_NONEXISTANT_TOKEN            : 'query for nonexistent token',
		OZERC721_NON_ERC721_RECEIVER          : 'transfer to non ERC721Receiver implementer',
		OZERC721_NULL_ADDRESS_BALANCE         : 'balance query for the zero address',
		OZERC721_NULL_ADDRESS_MINT            : 'mint to the zero address',
		OZERC721_NULL_ADDRESS_TRANSFER        : 'transfer to the zero address',
		OZERC721_TRANSFER_TOKEN_NOT_OWNED     : 'transfer of token that is not own',
	// MOCK ERC721Receiver
		ERC721Receiver_ERROR   : 'custom error',
		ERC721Receiver_MESSAGE : 'Mock_ERC721Receiver: reverting',
}

// For expected thrown errors
const THROW = {
	MISSING_ARGUMENT         : /missing argument/,
	UNEXPECTED_ARGUMENT      : /too many arguments/,
	INCORRECT_DATA_LENGTH    : /incorrect data length/,
	INCORRECT_PARAMETERS     : /incorrect parameters/,
	INVALID_ADDRESS          : /invalid address/,
	INVALID_ADDRESS_OR_ENS   : /invalid address or ENS name/,
	INVALID_ADDRESS_STR      : /resolver or addr is not configured for ENS name/,
	INVALID_BIG_NUMBER_STR   : /invalid BigNumber string/,
	INVALID_BIG_NUMBER_VALUE : /invalid BigNumber value/,
	INVALID_ARRAYIFY_VALUE   : /invalid arrayify value/,
	INVALID_VALUE_FOR_ARRAY  : /invalid value for array/,
	OVERFLOW                 : /overflow/,
	UNDERFLOW                : /underflow/,
	OUT_OF_GAS               : /out of gas/,
	STRING_ARRAY             : /charCodeAt is not a function/,
	VALUE_OUT_OF_BOUNDS      : /value out-of-bounds/,
}

// For common constants
const CST = {
	ETH          : ethers.constants.EtherSymbol,
	ONE_ETH      : ethers.constants.WeiPerEther,
	ADDRESS_ZERO : ethers.constants.AddressZero,
	HASH_ZERO    : ethers.constants.HashZero,
	NUMBER_ZERO  : ethers.constants.Zero,
	NUMBER_ONE   : ethers.constants.One,
	NUMBER_TWO   : ethers.constants.Two,
	MAX_UINT256  : ethers.constants.MaxUint256,
	INTERFACE_ID : {
		IERC1155               : '0xd9b67a26',
		IERC1155MetadataURI    : '0x0e89341c',
		IERC1155SingleReceiver : '0xf23a6e61',
		IERC1155BatchReceiver  : '0xbc197c81',
		IERC165                : '0x01ffc9a7',
		IERC2981               : '0x2a55205a',
		IERC721                : '0x80ac58cd',
		IERC721Metadata        : '0x5b5e139f',
		IERC721Enumerable      : '0x780e9d63',
		IERC721Receiver        : '0x150b7a02',
		INVALID                : '0xffffffff',
		NULL                   : '0x00000000',
	},
}

const contract_deployer_name = 'ContractDeployer'
const token_owner_name = 'TokenOwner'
const proxy_user_name = 'ProxyUser'
const wl_user1_name = 'WlUser1'
const wl_user2_name = 'WlUser2'
const user1_name = 'User1'
const user2_name = 'User2'

module.exports = {
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
}
