require('dotenv').config();
const { Connector } = require('./quorum-connector');
const request = require('request-promise');


class ContractListener {
    
    constructor() {
        this.connector = new Connector();
        this.crossEvent = undefined;
        this.stateEvent = undefined;
        this.queue = [];
        
        if (process.env.ROLE === "BRIDGE") this.timeOutClear = undefined;
    }

    async start() {
        // Listen for initial cross chain transaction
        console.log("[INFO] Start to listen sendCrossTransaction event.");
        let contract = await this.connector.getListenContract();
        this.crossEvent = contract.events.sendCrossTransaction({}, (error) => {
            if (error) {
                console.log("[ERROR] Listen to sendCrossTransaction event error. Error: " + error);
                return;
            }
        })
        .on('data', async (event) => {
            /* Getting sendCrossTransaction event when start a cross chain transaction */
            console.log("[INFO] Getting sendCrossTransaction event trigger");

            // Vote to bridege node
            let options = {
                method: 'POST',
                uri: "http://" + process.env.BRIDGE_NODE_IP + "/vote",
                body: {
                    hash: await this.connector.calcHash(event.returnValues.fromChainID, event.returnValues.toChainID, event.returnValues.methods , event.returnValues.data),
                    from: process.env.PUBLIC_KEY,
                    txHash: event.transactionHash
                },
                json: true
            };

            await request(options)
                .then((body) => {
                    console.log("[INFO] Contract sendCrossTransaction event trigger request success. Info: " + body.info);
                })
                .catch((error) => {
                    console.log("[ERROR] Contract sendCrossTransaction event trigger request error. Error: " + error.error);
                })
        })
        .on('error', (error) => {
            console.log("[ERROR] Listen to sendCrossTransaction event error. Error: " + error);
        });

        // Listen for cross chain transaction state change
        console.log("[INFO] Start to listen onChangeTxState event.");
        this.stateEvent = contract.events.onChangeTxState({}, (error) => {
            if (error) {
                console.log("[ERROR] Listen to onChangeTxState event error. Error: " + error);
                return;
            }
        })
        .on('data', (event) => {
            console.log("[INFO] Contract onChangeTxState event trigger");
            console.log(event);
        })
        .on('error', (error) => {
            console.log("[ERROR] Listen to onChangeTxState event error. Error: " + error);
        });

        // Bridge auto remove non-active cross chain transaction
        if (process.env.ROLE === "BRIDGE") {
            this.timeOutClear = setInterval(() => {

            }, process.env.MINUTES_TIME_FOR_REVOKE * 60 * 1000);
        }
    }

    stop() {
        this.crossEvent.removeAllListeners('data');
        this.crossEvent.removeAllListeners('error');
        this.stateEvent.removeAllListeners('data');
        this.stateEvent.removeAllListeners('error');
        if (process.env.ROLE === "BRIDGE") clearInterval(this.timeOutClear);
    }

}

module.exports = {
    ContractListener
};