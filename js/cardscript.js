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
        FOUR: {name: "four", symbol: "4", value: 4},
        FIVE: {name: "five", symbol: "5", value: 5},
        SIX: {name: "six", symbol: "6", value: 6},
        SEVEN: {name: "seven", symbol: "7", value: 7},
        EIGHT: {name: "eight", symbol: "8", value: 8},
        NINE: {name: "nine", symbol: "9", value: 9},
        TEN: {name: "ten", symbol: "10", value: 10},
        JACK: {name: "jack", symbol: "j", value: 11},
        QUEEN: {name: "queen", symbol: "q", value: 12},
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
            - range:OBJECT,ARRAY --> selects cards using python indexing rules
            - property:STRING --> either "highest" or "lowest"
            - suit:CHAR,ARRAY --> must be the one letter symbol of the suit or an array of those
            - rank:CHAR,ARRAY --> must be the one letter symbol of the rank or an array of those
            - union:BOOLEAN   --> default false. If true, each property acts like an independent
                                  selector, otherwise only cards that share all these properties
                                  are selected
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
                what.union = what.union || false;
                if(what.hasOwnProperty("index")) {
                    var indices = [];
                    if(typeof what.index == "number")
                        indices.push(what.index);
                    else if(Array.isArray(what.index))
                        indices = what.index;
                    for(var i = 0; i < indices.length; i++) {
                        if(indices[i] < 0) indices[i] += this.size();
                        if(indices[i] < this.size() && indices[i] >= 0 && selected.indexOf(indices[i]) == -1) {
                            selected.push(indices[i]);
                        }
                    }
                }
                if(what.hasOwnProperty("range")) {
                    var ranges = [];
                    if(Array.isArray(what.range)) {
                        ranges = what.range;
                    } else if(typeof what.range == "object")
                        ranges.push(what.range);
                    for(var i = 0; i < ranges.length; i++) {
                        ranges[i].from = ranges[i].from || 0;
                        ranges[i].to   = ranges[i].to   || this.size();
                        ranges[i].step = Math.abs(ranges[i].step) || 1;
                        if(ranges[i].from < 0) ranges[i].from += this.size();
                        if(ranges[i].to < 0) ranges[i].to += this.size();
                        if(ranges[i].from < ranges[i].to) {
                            for(var j = ranges[i].from; j < ranges[i].to; j += ranges[i].step) {
                                this.select({index: j});
                            }
                        } else if(ranges[i].from > ranges[i].to) {
                            for(var j = ranges[i].from; j > ranges[i].to; j -= ranges[i].step) {
                                this.select({index: j});
                            }
                        }
                    }
                }
                if(what.hasOwnProperty("suit")) {
                    var _suits = [];
                    if(Array.isArray(what.suit)) {
                        for(var s = 0; s < what.suit.length; s++) {
                            if(typeof what.suit[s] == "string" && what.suit[s].length == 1)
                                _suits.push(what.suit[s].toLowerCase());
                        }
                    }
                    else if(typeof what.suit == "string" && what.suit.length == 1)
                        _suits.push(what.suit.toLowerCase());
                    if(what.union == true || selected.length == 0) {
                        for(var i = 0; i < cards.length; i++) {
                            if(_suits.indexOf(cards[i].suit.symbol) != -1 && selected.indexOf(i) == -1) {
                                selected.push(i);
                            }
                        }
                    } else {
                        for(var i = 0; i < selected.length; ) {
                            if(_suits.indexOf(cards[selected[i]].suit.symbol) == -1) {
                                selected.splice(i, 1);
                            } else {i++;}
                        }
                    }
                }
                if(what.hasOwnProperty("rank")) {
                    var _ranks = [];
                    if(Array.isArray(what.rank)) {
                        for(var r = 0; r < what.rank.length; r++) {
                            if(typeof what.rank[r] == "string" && what.rank[r].length == 1)
                                _ranks.push(what.rank[r].toLowerCase());
                        }
                    }
                    else if(typeof what.rank == "string" && what.rank.length == 1)
                        _ranks.push(what.rank.toLowerCase());
                    if(what.union == true || selected.length == 0) {
                        for(var i = 0; i < cards.length; i++) {
                            if(_ranks.indexOf(cards[i].rank.symbol) != -1 && selected.indexOf(i) == -1) {
                                selected.push(i);
                            }
                        }
                    } else {
                        for(var i = 0; i < selected.length; ) {
                            if(_ranks.indexOf(cards[selected[i]].rank.symbol) == -1) {
                                selected.splice(i, 1);
                            } else {i++;}
                        }
                    }
                }
            } else {
                selected = []; //unselect everything
            }
        }
        this.moveTo = function(destination, method) {
            if(method!="start"&&method!="before"&&method!="after"&&method!="end"&&method!="alternate")
                method = "end";
            if(destination instanceof Pile) {
                //pop selected cards
                //add cards to destination
                //unselect everything
            } else {
                throw ("Expected a Pile, instead got " + destination + "\n  in Pile.moveTo(Pile, String)");
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
        this.stringSelected = function() {
            var str = "[";
            for(var i = 0; i < selected.length; i++) {
                str += cards[selected[i]].rank.symbol + cards[selected[i]].suit.symbol.toUpperCase() + "#" + selected[i];
                if(i < selected.length - 1) {str += ", ";}
            }
            return str + "]";
        }
    }
    window.cards = {
        Game: Game
    };
})();