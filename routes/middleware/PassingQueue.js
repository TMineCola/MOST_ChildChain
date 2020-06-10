const { VoteQueue } = require('../../lib/consensis-vote');

const queue = new VoteQueue();

var PassingVoteQueue = function (req, res, next) {
    req.vote = queue;

    next();
};

module.exports = PassingVoteQueue;