const express = require('express');
const router = express.Router();
const { ContractManager } = require('../lib/contract-manager');

const manager = new ContractManager();

router.get('/:hash', async (req, res, next) => {
    let hash = req.params.hash;
    
    try {
        console.log("[INFO] Search recent state for " + hash);

        let txRes = await manager.getRecentState(hash);

        return (txRes) ? 
                res.status(200).json({ info: "查詢成功", status: txRes.words[0], rawResponse: txRes }) :
                res.status(404).json({ error: "查詢不到該筆狀態" });
    } catch (err) {
        console.log("[ERROR] Search state error. Error: " + err.message);
        return res.status(500).json({ error: "伺服器發生錯誤" });
    }

});

router.post('/', async (req, res, next) => {
    let txData = req.body;

    if (!txData.from || !txData.to || !txData.data ) return res.status(400).json({ error: "缺少資料欄位" });

    try {
        console.log("[INFO] Creating cross chain transaction from " + txData.from + " to " + txData.to);

        let txRes = await manager.sendTransaction(txData.from, txData.to, "REQUEST", txData.data);
        let dataHash = await manager.calcHash(txData.from, txData.to, "REQUEST", txData.data);

        return res.status(200).json({ info: "跨鏈交易請求已提交", dataHash: dataHash, rawResponse: txRes });
    } catch (err) {
        console.log("[ERROR] Create cross chain transaction error. Error: " + err.message);
        return res.status(500).json({ error: "伺服器發生錯誤" });
    }
});


router.patch('/', async (req, res, next) => {
    let txData = req.body;

    if (!txData.hash || !txData.state ) res.status(400).json({ error: "缺少資料欄位" });

    try {
        // Get current state
        let currentState = manager.getRecentState(txData.hash);

        if (currentState) {
            // check if step is correct
            if (parseInt(currentState) !== parseInt(txData.state) + 1) return res.status(400).json({ error: "跨鏈請求狀態不對稱" });
            // invoke change state
            await manager.changeState(txData.hash, txData.state);
            console.log("[INFO] Change cross chain transaction " + txData.hash + " state to " + txData.state + " success.");
            return res.status(200).json({ info: "跨鏈請求狀態更新成功", state: txData.state });
        } else {
            console.log("[ERROR] Change cross chain transaction " + txData.hash + " state to " + txData.state + " fail. Error: Cannot found specific hash " + txData.hash);
            return res.status(404).json({ error: "找不到該跨鏈請求" });
        }

    } catch (err) {
        console.log("[ERROR] Change cross chain transaction " + txData.hash + " state to " + state + "fail. Error: " + err.message);
        return res.status(500).json({ error: "伺服器發生錯誤" });
    }
});


module.exports = router;