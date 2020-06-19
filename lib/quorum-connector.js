require('dotenv').config();
const Web3 = require("web3");
const Contract = require("@truffle/contract");
const fs = require('fs');
const net = require('net');

class Connector {
    
    constructor() {
        this.privatekey = process.env.PRIVATE_KEY;
        this.publickey = process.env.PUBLIC_KEY;
        this.provider = new Web3.providers.IpcProvider(process.env.QUORUM_IPC_PROVIDER, net);
        this.web3 = new Web3(this.provider);
        // Load abi
        try {
            this.abi = JSON.parse(fs.readFileSync(process.env.CONTRACT_JSON_PATH, 'utf8')).abi;
        } catch(err) {
            console.log("Load abi fail, error: " + err.message);
        }
        // Load Contract with abi
        this.contract = Contract({
            abi: this.abi
        });
        // Set contract provider and address
        this.contract.setProvider(this.provider);

        this.provider.on('error', e => console.log('Ipc Error', e));
        this.provider.on('end', e => {
            console.log('Attempting to reconnect...');
            this.provider = new Web3.providers.IpcProvider(process.env.QUORUM_IPC_PROVIDER, net);
            this.provider.on('connect', () => {
                console.log('WS Reconnected');
            });
            
            this.web3.setProvider(this.provider);
            this.contract.setProvider(this.provider);
        });
    }

    async calcHash(from, to, method, data) {
        return await this.web3.utils.soliditySha3(parseInt(from), parseInt(to), method, (typeof(data) === "object") ? JSON.stringify(data) : data);
    }

    async getContract() {
        return await this.contract.at(process.env.CROSSCHAIN_CONTRACT_ADR);
    }

    async getListenContract() {
        return await new this.web3.eth.Contract(this.abi, process.env.CROSSCHAIN_CONTRACT_ADR);
    }

    getAbi() {
        return this.abi;
    }

    getWeb3() {
        return this.web3;
    }

}

module.exports = {
    Connector
};