pragma solidity >=0.4.21 <0.7.0;


contract NamingService {
    mapping( uint256 => address[] ) chainIDToAccount;
    mapping( uint256 => string[] ) chainIDToIP;
    address admin;
    event findChain(uint8 id, string ip);
    constructor() public {
        admin = msg.sender;
    }
    function register(address account, uint256 chainID, string memory ip) public {
        chainIDToAccount[chainID].push(account);
        chainIDToIP[chainID].push(ip);
    }
    function findIpByChainID(uint256 chainID) public view returns (string memory ip) {
        return chainIDToIP[chainID][0];
    }

}



