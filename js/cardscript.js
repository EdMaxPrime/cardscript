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
        KING: {name: "king", symbol: "k", value: 13},
        ACE: {name: "ace", symbol: "a", value: 1}
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
                    if(ranks[r].symbol == suit.charAt(0).toLowerCase()) {
                        this.rank = ranks[r];
                        break;
                    }
                }
                for(var s in suits) {
                    if(suits[s].symbol == suit.charAt(1).toLowerCase()) {
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
            selected = [],
            self = this;
        this.size = function() {return cards.length;};
        this.isEmpty = function() {return this.size()==0;};
        var popSelected = function() {
            var staysHere = [], removed = [];
            for(var i = 0; i < cards.length; i++) {
                if(selected.indexOf(i) == -1)
                    staysHere.push(cards[i]);
                else
                    removed.push(cards[i]);
            }
            cards = staysHere;
            return removed;
        }
        /*Selectors:
          - function(suit, rank, index) --> return true to select this card
          - object --> with any of the following properties:
            - index:INT,ARRAY  --> selects cards at this index/indices
            - range:ARRAY  --> selects cards using python indexing rules
            - property:STRING --> either "highest" or "lowest"
            - suit:CHAR,ARRAY --> must be the one letter symbol of the suit or an array of those
            - rank:CHAR,ARRAY --> must be the one letter symbol of the rank or an array of those
            */
        this.select = function(what) {
            if(typeof what == "function") {
                for(var i = 0; i < cards.length; i++) {
                    if(what(cards[i].suit, cards[i].rank, i) === true) {
                        selected.push(i);
                    }
                }
            }
            else if(typeof what == "object") {
                if(what.hasOwnProperty("index")) {
                    var indices = [];
                    if(typeof what.index == "number")
                        indices.push(what.index);
                    else if(Array.isArray(what.index))
                        indices = what.index;
                    for(var i = 0; i < indices.length; i++) {
                        if(indices[i] < 0) indices[i] += this.size();
                        if(indices[i] < this.size() && indices[i] >= 0) {
                            selected.push(indices[i]);
                        }
                    }
                }
            }
        }
        this.stringify = function() {
            var str = "[";
            for(var i = 0; i < cards.length; i++) {
                str += cards[i].rank.symbol + cards[i].suit.symbol.toUpperCase() + "@" + cards[i].id;
                if(i < cards.length - 1) {str += ", ";}
            }
            return str + "]";
        }
    }
    window.cards = {
        Game: Game
    };
})();