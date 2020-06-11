pragma solidity >=0.4.21 <0.7.0;

contract CrossChainTransaction {

    enum State {
        PRE_PREPARE,        // 0
        PREPARE,            // 1
        PRE_COMMIT,         // 2
        COMMIT,             // 3
        REVOKE              // 4
    }

    bytes constant prefix = "\x19Ethereum Signed Message:\n";
    address private deployer;

    mapping( bytes32 => uint8 ) txStates; // Use to save tx state
    mapping( bytes32 => uint256 ) txTimestamp; // Use to save tx active time
    mapping( bytes32 => bytes32 ) initTxInfo; // Use to save tx init tx for getting init data

    event sendCrossTransaction(uint256 fromChainID, uint256 toChainID, string methods, uint256 timestamp, string data);
    event onChangeTxState(bytes32 dataHash, uint8 state);
    event onSetTxInfo(bytes32 dataHash, bytes32 txHash);

    constructor() public{
        deployer = msg.sender;
    }

    /*
    Change from, to data type to uint256
    It is used to be a public key of an account or a node in child chain, but we decide to change it
    to a chain ID in order to make the assumption more reasonable.
    We just know the chain ID then in relay chain we can find corresponding child chain node ip by naming service.
    I remove the check the signature because we check the valid user to invoke this contract by checking the msg.sender.
    Through the blockchain mechanism we can ensure that only the deployer can invoke the smart contract.
    ( or we can regist the node's pubkey by deployer, and we can just check the msg.sender if it is in the list. )
    */
    function sendCrossChainTransaction(uint256 fromChainID, uint256 toChainID, string memory methods,
                                                        string memory data, uint256 timestamp) public {
        require(msg.sender == deployer, "The account is not approved to invoke this function");
        bytes32 dataHash = keccak256(abi.encodePacked(fromChainID, toChainID, methods, data));
        txStates[dataHash] = uint8(State.PRE_PREPARE);
        txTimestamp[dataHash] = timestamp;
        emit sendCrossTransaction(fromChainID, toChainID, methods, timestamp, data);
    }

    function setTxInfo(bytes32 dataHash, bytes32 txHash) public {
        require(msg.sender == deployer, "The account is not approved to invoke this function");
        initTxInfo[dataHash] = txHash;
        emit onSetTxInfo(dataHash, txHash);
    }

    function changeTxState(bytes32 dataHash, uint8 state, uint256 timestamp) public {
        require(msg.sender == deployer, "The account is not approved to invoke this function");
        txStates[dataHash] = state;
        txTimestamp[dataHash] = timestamp;
        emit onChangeTxState(dataHash, state);
    }

    function getTxInitInfo(bytes32 dataHash) public view returns ( bytes32 txHash ) {
        return initTxInfo[dataHash];
    }

    function getTxInsertTime(bytes32 dataHash) public view returns ( uint256 time ) {
        return txTimestamp[dataHash];
    }

    function getTxRecentState(bytes32 dataHash) public view returns (uint8 state) {
        return txStates[dataHash];
    }

}