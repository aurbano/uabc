"use strict";
exports.__esModule = true;
var funcs = require("../lib/funcs");
var constants_1 = require("@socialgorithm/ultimate-ttt/dist/model/constants");
var State = (function () {
    function State() {
        this.games = 0;
        this.ties = 0;
        this.wins = [0, 0];
        this.times = [];
        this.timeouts = [0, 0];
    }
    State.prototype.printState = function () {
        var stats = this.getStats();
        var winner = null;
        if (stats.winner === constants_1.ME) {
            winner = 'A';
        }
        else if (stats.winner === constants_1.OPPONENT) {
            winner = 'B';
        }
        console.log('');
        if (winner) {
            console.log('Winner: Player %s', winner);
        }
        else {
            console.log('Tie!');
        }
        console.log('Games played: %d', this.games);
        console.log('');
        console.log('Player A wins: %d (%s)', this.wins[constants_1.ME], stats.winPercentages[constants_1.ME]);
        console.log('Player B wins: %d (%s)', this.wins[constants_1.OPPONENT], stats.winPercentages[constants_1.OPPONENT]);
        console.log('Ties: %d (%s)', this.ties, stats.tiePercentage);
        console.log('');
        console.log('Player A timeouts: %d', this.timeouts[constants_1.ME]);
        console.log('Player B timeouts: %d', this.timeouts[constants_1.OPPONENT]);
        console.log('');
        console.log('Total time: %dms', stats.total);
        console.log('Avg game: %dms', stats.avg);
        console.log('Max game: %dms', stats.max);
        console.log('Min game: %dms', stats.min);
        return true;
    };
    State.prototype.getStats = function () {
        var stats = {};
        if (this.wins[constants_1.ME] === this.wins[constants_1.OPPONENT]) {
            stats.winner = constants_1.RESULT_TIE;
        }
        else if (this.wins[constants_1.ME] > this.wins[constants_1.OPPONENT]) {
            stats.winner = constants_1.ME;
        }
        else {
            stats.winner = constants_1.OPPONENT;
        }
        stats.winPercentages = [
            funcs.getPercentage(this.wins[constants_1.ME], this.games),
            funcs.getPercentage(this.wins[constants_1.OPPONENT], this.games)
        ];
        stats.tiePercentage = funcs.getPercentage(this.ties, this.games);
        var sum = 0;
        stats.total = 0;
        stats.max = 0;
        stats.avg = 0;
        stats.min = 1000;
        if (this.times.length > 0) {
            for (var i = 0; i < this.times.length; i++) {
                stats.total += this.times[i];
                sum += this.times[i];
                stats.max = Math.max(stats.max, this.times[i]);
                stats.min = Math.min(stats.min, this.times[i]);
            }
            stats.avg = funcs.round(sum / this.times.length);
            stats.total = funcs.round(stats.total);
            stats.max = funcs.round(stats.max);
            stats.min = funcs.round(stats.min);
            stats.avg = funcs.round(stats.avg);
        }
        return stats;
    };
    return State;
}());
exports["default"] = State;
//# sourceMappingURL=State.js.map