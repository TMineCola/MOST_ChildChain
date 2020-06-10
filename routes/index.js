var express = require('express');
var router = express.Router();

// Response node information
router.get('/', (req, res, next) => {
    res.status(200).json({
        mode: process.env.MODE || undefined,
        account: process.env.PUBLIC_KEY || undefined,
        role: process.env.ROLE || undefined,
        provider: process.env.QUORUM_PROVIDER || undefined,
        chain: {
            id: process.env.CHAIN_ID || undefined,
            member_amount: process.env.CHAIN_COUNT || undefined,
            bridge_node: process.env.BRIDGE_NODE_IP || undefined,
            relay_node: process.env.RELAY_CHAIN_IP || undefined
        },
        config: {
            check_time: process.env.MINUTES_TIME_FOR_CHECK || undefined,
            revoke_time: process.env.MINUTES_TIME_FOR_REVOKE || undefined
        }
    });
});



module.exports = router;
