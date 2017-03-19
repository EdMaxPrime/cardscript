(function() {
    var suits = {
        SPADES: {
            name: "spades",
            html: "&spades;",
            parity: false
        },
        HEARTS: {
            name: "hearts",
            html: "&heart;",
            parity: true
        },
        CLUBS: {
            name: "clubs",
            html: "&club;",
            parity: false
        },
        DIAMONDS: {
            name: "clubs",
            html: "&diam;",
            parity: true
        }
    };
    function merge(a, b) {
        var union = {};
        for(var k in a) {
            union[k] = a[k];
        }
        if(b != undefined) {
            for(var k in b) {
                if(!union.hasOwnProperty(k)) {
                    union[k] = b[k];
                } 
                else if(typeof union[k] != "object" && Array.isArray(union[k]) == false) {
                    union[k] = b[k];
                }
                else {
                    union[k] = merge(a[k], b[k]);
                }
            }
        }
        return union;
    }
    function Game(opts) {
        this.settings = merge({
            players: 1,
            rules: {a: "lol"}
        }, opts);
    }
})();