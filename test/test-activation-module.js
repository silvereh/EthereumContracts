const TEST_ACTIVATION = {
	// UTILS
	ERC2981Base  : true,
	IOwnable     : true,
	IPausable    : true,
	ITradable    : true,
	IWhitelisted : true,
	// ERC721
	ERC721Base           : true,
	ERC721BaseBurnable   : true,
	ERC721BaseEnumerable : true,
	ERC721BaseMetadata   : true,
	// ERC20
	ERC20Base         : true,
	ERC20BaseBurnable : true,
	ERC20BaseCapped   : true,
	ERC20BaseMetadata : true,
	// ERC1155
	ERC1155Base            : true,
	ERC1155BaseMetadataURI : true,
	ERC1155BaseBurnable    : true,
}

module.exports = {
	TEST_ACTIVATION,
}
