const TEST_ACTIVATION = {
	// UTILS
	ERC2981Base    : true,
	IInitializable : true,
	IOwnable       : true,
	IPausable      : true,
	ITradable      : true,
	IWhitelistable : true,
	// ERC721
	ERC721A             : true,
	ERC721B             : true,
	ERC721OZ            : true,
	ERC721Arr           : true,
	ERC721Arr_000       : true,
	ERC721Arr_001       : true,
	ERC721Arr_010       : true,
	ERC721Arr_011       : true,
	ERC721Arr_100       : true,
	ERC721Arr_101       : true,
	ERC721Arr_110       : true,
	ERC721Arr_111       : true,
	ERC721Base2         : true,
	ERC721Map           : true,
	ERC721Map_000       : true,
	ERC721Map_001       : true,
	ERC721Map_010       : true,
	ERC721Map_011       : true,
	ERC721Map_100       : true,
	ERC721Map_101       : true,
	ERC721Map_110       : true,
	ERC721Map_111       : true,
	ERC721Map_Req       : true,
	// ERC721 EXTENSIONS
	ERC721ArrBurnable   : true,
	ERC721ArrEnumerable : true,
	ERC721ArrMetadata   : true,
	ERC721MapBurnable   : true,
	ERC721MapEnumerable : true,
	ERC721MapMetadata   : true,
	// ERC20
	ERC20Base         : true,
	// ERC20 EXTENSIONS
	ERC20BaseBurnable : true,
	ERC20BaseCapped   : true,
	ERC20BaseMetadata : true,
	// ERC1155
	ERC1155Base            : true,
	// ERC1155 EXTENSIONS
	ERC1155BaseMetadataURI : true,
	ERC1155BaseBurnable    : true,
	// PRICE COMPARISON
	PRICE_MINT_ERC721     : false,
	PRICE_TRANSFER_ERC721 : false,
	// GINGER BUDDIES
	GingerManager : false,
}

module.exports = {
	TEST_ACTIVATION,
}
