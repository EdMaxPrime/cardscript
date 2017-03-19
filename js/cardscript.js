(function() {
    var suits = {
        SPADES: {
            name: "spades",
            html: "&spades;",
            symbol: "s",
            parity: false
        },
        HEARTS: {
            name: "hearts",
            html: "&heart;",
            symbol: "h",
            parity: true
        },
        CLUBS: {
            name: "clubs",
            html: "&club;",
            symbol: "c",
            parity: false
        },
        DIAMONDS: {
            name: "clubs",
            html: "&diam;",
            symbol: "d",
            parity: true
        }
    };
    var ranks = {
        TWO: {name: "two", symbol: "2", value: 2},
        THREE: {name: "three", symbol: "3", value: 3},
        KING: {name: "king", symbol: "K", value: 13},
        ACE: {name: "ace", symbol: "A", value: 1}
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
        var nextCardID = 0;
        this.createPile = function(list) {
            if(list === "" || list == undefined || typeof list != "object") {
                return new Pile([]);
            }
            else if(Array.isArray(list)) {
                var arrayOfCards = [];
                for(var i = 0; i < list.length; i++) {
                    if(typeof list[i] == "string") {
                        if(list[i].length == 2) {
                            arrayOfCards.push(new Card(list[i], nextCardID));
                            nextCardID++;
                        }
                    }
                }
                return new Pile(arrayOfCards);
            }
        }
    }
    function Card(suit, rank, id) {
        if(arguments.length < 3) {
            if(suit.length == 2) {
                for(var r in ranks) {
                    if(ranks[r].symbol == suit.charAt(0)) {
                        this.rank = ranks[r];
                        break;
                    }
                }
                for(var s in suits) {
                    if(suits[s].symbol == suit.charAt(1)) {
                        this.suit = suits[s];
                        break;
                    }
                }
            }
            if(rank != undefined) {this.id = rank;}
        }
        else {
            this.suit = suit;
            this.rank = rank;
            this.id = id;
        }
        this.tags = {};
    }
    function Pile(arrayOfCards) {
        var cards = arrayOfCards,
            selected = [];
        this.size = function() {return cards.length;};
        this.isEmpty = function() {return this.size()==0;};
        this.stringify = function() {
            console.log(cards);
            var str = "[";
            for(var i = 0; i < cards.length; i++) {
                str += cards[i].rank.symbol + cards[i].suit.symbol + "@" + cards[i].id;
                if(i < cards.length - 1) {str += ", ";}
            }
            return str + "]";
        }
    }
    window.cards = {
        Game: Game
    };
})();