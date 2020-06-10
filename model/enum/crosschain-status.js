const TX_STATE = {
    "PRE_PREPARE": 0,
    "PREPARE": 1,
    "PRE_COMMIT": 2,
    "COMMIT": 3,
    "REVOKE": 4
}

Object.freeze(TX_STATE);

module.exports = {
    TX_STATE: TX_STATE
};