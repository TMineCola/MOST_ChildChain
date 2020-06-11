const express = require('express');
const router = express.Router();
const PassingQueue = require('./middleware/PassingQueue');


router.get('/', PassingQueue, (req, res, next) => {
    console.log("[INFO] Getting vote queue information.");
    res.status(200).json(req.vote.toObject());
});

router.post('/', PassingQueue, (req, res, next) => {
    let voteInfo = req.body;

    if ( !voteInfo.hash || !voteInfo.from || !voteInfo.txHash ) return res.status(400).json({ error: "缺少資料欄位" });

    try {
        return (req.vote.push(voteInfo.hash, voteInfo.from, voteInfo.txHash)) ?
        res.status(200).json({ info: "投票成功" }) :
        res.status(400).json({ error: "重複投票" }) ;
    } catch (error) {
        console.log("[ERROR] Voting for " + voteInfo.hash + " error. Error: " + error.message);
        return res.status(500).json({ error: "伺服器異常" });
    }
});

module.exports = router;
