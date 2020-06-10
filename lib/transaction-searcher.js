require('dotenv').config();
const { Connector } = require('./quorum-connector');
const abiDecoder = require('abi-decoder');

class TransactionSearcher {

    constructor() {
        this.connector = new Connector();
        // Load decoder with abi
        abiDecoder.addABI(this.connector.getAbi());    
    }

    // Return raw transaction
    async getTransaction(hash) {
        let web3 = await this.connector.getWeb3();
        return await web3.eth.getTransaction(hash);
    }

    // Return smart contract input information
    async receiveCrossChainTx(hash) {
        let web3 = await this.connector.getWeb3();
        return await web3.eth.getTransaction(hash)
                        .then(async res => await abiDecoder.decodeMethod(res.input))
                        .then(decoded => {
                            return {
                                from: decoded.params[0].value,
                                to: decoded.params[1].value,
                                methods: decoded.params[2].value,
                                data: JSON.parse(decoded.params[3].value),
                                timestamp: decoded.params[4].value
                            };
                        });
    }

    // Return smart contract change state data
    async receiveStateChange(hash) {
        let web3 = await this.connector.getWeb3();
        return await web3.eth.getTransaction(hash)
                        .then(async res => await abiDecoder.decodeMethod(res.input))
                        .then(decoded => {
                            return {
                                txHash: decoded.params[0].value,
                                state: decoded.params[1].value
                            };
                        });
    }
}

module.exports = {
    TransactionSearcher
}