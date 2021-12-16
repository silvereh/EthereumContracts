// SPDX-License-Identifier: MIT

/**
* Author: Lambdalf the White
*/

pragma solidity 0.8.10;

contract OwnableDelegateProxy {}

contract ProxyRegistry {
	mapping( address => OwnableDelegateProxy ) public proxies;
}

contract ITradable {
	// OpenSea proxy registry address
	address internal _proxyRegistryAddress;

	constructor( address proxyRegistryAddress_ ) {
		_proxyRegistryAddress = proxyRegistryAddress_;
	}

	/**
	* @dev Checks if `operator_` is the registered proxy for `tokenOwner_`.
	* 
	* Note: Use this function to allow whitelisting of registered proxy.
	*/
	function _isRegisteredProxy( address tokenOwner_, address operator_ ) internal view returns ( bool ) {
		ProxyRegistry _proxyRegistry_ = ProxyRegistry( _proxyRegistryAddress );
		if ( address( _proxyRegistry_.proxies( tokenOwner_ ) ) == operator_ ) {
			return true;
		}
		return false;
	}
}