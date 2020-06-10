// Record vote information including when it create and which address vote from
class VoteInfo {

    constructor(voteFrom) {
        this.createTime = new Date().toISOString();
        this.voteFrom = voteFrom;
    }

    toObject() {
        return this;
    }

}

// Record for specific cross chain transaction, which identify via input hash (from, to, method, data)
// Also record that cross chain transaction's tx hash (For search that transaction)
// using createTime for timeout check
class VoteGroup {

    constructor(hash, txHash) {
        this.voteFor = hash;
        this.txHash = txHash;
        this.createTime = new Date().toISOString();
        this.group = [];
    }

    // push new vote information
    push(voteFrom) {
        let vote = new VoteInfo(voteFrom);

        this.group.push(
            vote
        );

        return vote;
    }

    // count total vote information
    count() {
        return this.group.length;
    }

    // format array object of all vote info
    toObject() {
        return this.group.map(vote => vote.toObject());
    }
}

module.exports = {
    VoteInfo,
    VoteGroup
}; 