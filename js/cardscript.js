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
    var NULL_SUIT = {name:null, html:"", symbol:null, parity:null};
    var ranks = {
        TWO: {name: "two", symbol: "2", value: 2},
        THREE: {name: "three", symbol: "3", value: 3},
        FOUR: {name: "four", symbol: "4", value: 4},
        FIVE: {name: "five", symbol: "5", value: 5},
        SIX: {name: "six", symbol: "6", value: 6},
        SEVEN: {name: "seven", symbol: "7", value: 7},
        EIGHT: {name: "eight", symbol: "8", value: 8},
        NINE: {name: "nine", symbol: "9", value: 9},
        TEN: {name: "ten", symbol: "t", value: 10},
        JACK: {name: "jack", symbol: "j", value: 11},
        QUEEN: {name: "queen", symbol: "q", value: 12},
        KING: {name: "king", symbol: "k", value: 13},
        ACE: {name: "ace", symbol: "a", value: 1}
    };
    var NULL_RANK = {name:null, symbol:null, value:null};
    function string2RS(str) {
        if(typeof str != "string")
            return {rank:NULL_RANK, suit:NULL_SUIT};
        if(str.length == 2) {
            var rs = {};
            for(var r in ranks) {
                if(ranks[r].symbol == str.charAt(0).toLowerCase()) {
                    rs.rank = ranks[r];
                    break;
                }
            }
            rs.rank = rs.rank || NULL_RANK;
            for(var s in suits) {
                if(suits[s].symbol == str.charAt(1).toLowerCase()) {
                    rs.suit = suits[s];
                    break;
                }
            }
            rs.suit = rs.suit || NULL_SUIT;
            return rs;
        } else if(str.indexOf(" ") != -1) {
            str = str.split(" ");
            var rs = {};
            for(var r in ranks) {
                if(ranks[r].symbol == str[0].toLowerCase()) {
                    rs.rank = ranks[r];
                    break;
                }
                else if(ranks[r].name == str[0].toLowerCase()) {
                    rs.rank = ranks[r];
                    break;
                }
            }
            rs.rank = rs.rank || NULL_RANK;
            for(var s in suits) {
                if(suits[s].symbol == str[1].toLowerCase()) {
                    rs.suit = suits[s];
                    break;
                }
                else if(suits[s].name == str[1].toLowerCase()) {
                    rs.suit = suits[s];
                    break;
                }
            }
            rs.suit = rs.suit || NULL_SUIT;
            return rs;
        }
        return {rank: NULL_RANK, suit: NULL_SUIT};
    }
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
            rules: {a: "lol"},
            order: {a:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, j:11, q:12, k:13}
        }, opts);
        var nextCardID = 0;
        this.createPile = function(list) {
            if(list === "" || list == undefined || typeof list != "object") {
                return new Pile([]);
            }
            else if(Array.isArray(list)) {
                var arrayOfCards = [];
                for(var i = 0; i < list.length; i++) {
                    arrayOfCards.push(new Card(list[i], nextCardID));
                    nextCardID++;
                }
                return new Pile(arrayOfCards, this);
            }
        }
        this.createDeck52 = function() {
            var all52 = [];
            for(var r in ranks) {
                for(var s in suits) {
                    all52.push(ranks[r].symbol + suits[s].symbol);
                }
            }
            return this.createPile(all52);
        }
        this.compare = function(c1, c2) {
            if(arguments.length < 2) {
                throw ("Cannot compare " + arguments.length + " objects\n  in Game.compare(Card, Card)");
            } else if(!(c1.hasOwnProperty("rank")) && !(c2.hasOwnProperty("rank"))) {
                throw ("Cards can only be compared to other cards\n  in Game.compare(Card, Card)");
            } else {
                if(this.settings.order[c1.rank.symbol] < this.settings.order[c2.rank.symbol]) return -1; //c1 < c2
                if(this.settings.order[c1.rank.symbol] == this.settings.order[c2.rank.symbol]) return 0; //c1 = c2
                if(this.settings.order[c1.rank.symbol] > this.settings.order[c2.rank.symbol]) return 1; //c1 > c2
            }
        }
    }
    function Card(suit, rank, id) {
        if(arguments.length < 3) { //Card(STRING, id)
            var rs = string2RS(arguments[0]);
            this.rank = rs.rank;
            this.suit = rs.suit;
            if(rank != undefined) {this.id = rank;} //id is 2nd param in this case
        }
        else {
            this.suit = suit;
            this.rank = rank;
            this.id = id;
        }
        this.tags = {};
        this.copy = function() {
            var copy = new Card(this.suit, this.rank, this.id);
            copy.suit = {name:this.suit.name, symbol:this.suit.symbol, html:this.suit.symbol, parity:this.suit.parity};
            copy.rank = {name:this.rank.name, symbol:this.rank.symbol, value:this.rank.value};
            copy.tags = JSON.parse(JSON.stringify(this.tags));
            return copy;
        }
    }
    function Pile(arrayOfCards, owner) {
        var cards = arrayOfCards,
            selected = [],
            self = this,
            game = owner;
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
          - true   --> select everything
          - number --> select that index
          - function(card, index, selected) --> return true to select this card
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
                    if(what(cards[i].copy(), i, selected.slice()) === true) {
                        selected.push(i);
                    }
                }
            }
            else if(what === true) { //select all
                selected = [];
                for(var x in cards)
                    selected.push(parseInt(x));
            }
            else if(typeof what == "number") {
                this.select({index: what});
            }
            else if(typeof what == "object") {
                what.union = what.union || false;
                if(what.hasOwnProperty("index")) {
                    var indices = [];
                    if(typeof what.index == "number")
                        indices.push(what.index);
                    else if(Array.isArray(what.index))
                        indices = what.index;
                    for(var i = 0; i < indices.length; ) {
                        if(indices[i] < 0) indices[i] += this.size();
                        if(indices[i] < this.size() && indices[i] >= 0 && (!what.union || selected.indexOf(indices[i]) == -1)) {
                            i++;
                        } else {
                            indices.splice(i, 1);
                        }
                    }
                    if(what.union == true || selected.length == 0) {
                        selected.push.apply(selected, indices);
                    } else { //intersection
                        for(var s = 0; s < selected.length; ) {
                            if(indices.indexOf(selected[s]) == -1) selected.splice(s, 1);
                            else s++;
                        }
                    }
                }
                if(what.hasOwnProperty("range")) {
                    var ranges = [];
                    if(Array.isArray(what.range)) {
                        ranges = what.range;
                    } else if(typeof what.range == "object")
                        ranges.push(what.range);
                    var indices = [];
                    for(var i = 0; i < ranges.length; i++) {
                        ranges[i].from = ranges[i].from || 0;
                        ranges[i].to   = ranges[i].to   || this.size();
                        ranges[i].step = Math.abs(ranges[i].step) || 1;
                        if(ranges[i].from < 0) ranges[i].from += this.size();
                        if(ranges[i].to < 0) ranges[i].to += this.size();
                        if(ranges[i].from < ranges[i].to) {
                            for(var j = ranges[i].from; j < ranges[i].to; j += ranges[i].step) {
                                if(indices.indexOf(j) == -1) indices.push(j);
                            }
                        } else if(ranges[i].from > ranges[i].to) {
                            for(var j = ranges[i].from; j > ranges[i].to; j -= ranges[i].step) {
                                if(indices.indexOf(j) == -1) indices.push(j);
                            }
                        }
                    }
                    this.select({index: indices, union: what.union});
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
                if(what.hasOwnProperty("property") && (what.property == "highest" || what.property == "lowest") && this.size() > 0) {
                    if(what.union == true || selected.length == 0) {
                        var minmax = 0, equal = [0];
                        for(var i = 1; i < cards.length; i++) {
                            if(what.property == "highest" && game.compare(cards[i], cards[minmax]) == 1) {
                                minmax = i;
                                equal = [i];
                            }
                            else if(what.property == "lowest" && game.compare(cards[i], cards[minmax]) == -1) {
                                minmax = i;
                                equal = [i];
                            }
                            else if(game.compare(cards[i], cards[minmax]) == 0) {
                                equal.push(i);
                            }
                        }
                        for(var i = 0; i < equal.length; i++) { //only add indices not already there
                            if(selected.indexOf(equal[i]) == -1) selected.push(equal[i]);
                        }
                    } else { //intersection
                        var minmax = 0, equal = [0];
                        for(var i = 1; i < selected.length; i++) {
                            if(what.property == "highest" && game.compare(cards[selected[i]], cards[minmax]) == 1) {
                                minmax = selected[i];
                                equal = [selected[i]];
                            }
                            else if(what.property == "lowest" && game.compare(cards[selected[i]], cards[minmax]) == -1) {
                                minmax = selected[i];
                                equal = [selected[i]];
                            }
                            else if(game.compare(cards[i], cards[minmax]) == 0) {
                                equal.push(selected[i]);
                            }
                        }
                        for(var i = 0; i < selected.length; ) { //only keep indices present in both sets
                            if(equal.indexOf(selected[i]) == -1) selected.splice(i, 1);
                            else i++;
                        }
                    }
                }
            } else {
                selected = []; //unselect everything
            }
            return this;
        }
        this.peekSelected = function() {
            return selected.slice(); //return a copy, array of indices
        }
        this.view = function() {
            var view = [];
            for(var i = 0; i < selected.length; i++) {
                view[i] = cards[ selected[i] ].copy();
            }
            return view;
        }
        this.count = function() {
            return selected.length;
        }
        this.foreach = function(fxn, thisValue) {
            if(typeof fxn == "function") {
                thisValue = thisValue || this;
                var v = this.view();
                for(var s = 0; s < v.length; s++) {
                    fxn.call(thisValue, v[s], selected[s], (s==v.length-1)); //fxn(card, index, isLast?)
                }
            }
            return this;
        }
        this.forall = function(fxn, thisValue) {
            if(typeof fxn == "function") {
                thisValue = thisValue || this;
                for(var i = 0; i < cards.length; i++) {
                    fxn.call(thisValue, cards[i].copy(), i, (selected.indexOf(i) >= 0), (i==cards.length-1)); //fxn(card, index, isSelected?, isLast?)
                }
            }
            return this;
        }
        this.moveTo = function(destination, method) {
            if(method!="start"&&method!="before"&&method!="after"&&method!="end"&&method!="random")
                method = "end";
            if(destination instanceof Pile) {
                //pop selected cards
                var notMine = popSelected();
                //add cards to destination
                switch(method) {
                    case "start":
                    destination.add(notMine, 0);
                    break;
                    case "end":
                    destination.add(notMine);
                    break;
                    case "before":
                    var otherIndices = destination.peekSelected(), current = 0, resets = 0;
                    if(otherIndices.length == 0) otherIndices = [0]; //insert to beginning by default
                    for(var i = 0; i < notMine.length; i++) {
                        destination.add(notMine[i], otherIndices[current]+current+resets);
                        current++;
                        if(current == otherIndices.length) {current = 0; resets++;}
                    }
                    break;
                    case "after":
                    var otherIndices = destination.peekSelected(), current = 0, resets = 0;
                    if(otherIndices.length == 0) otherIndices = [destination.size()-1]; //insert at end by default
                    for(var i = 0; i < notMine.length; i++) {
                        destination.add(notMine[i], otherIndices[current]+current+resets+1);
                        current++;
                        if(current == otherIndices.length) {current = 0; resets++;}
                    }
                    break;
                    default: //random
                    for(var i = 0; i < notMine.length; i++) {
                        destination.add(notMine[i], destination.randomIndex()); //will never add to end
                    }
                    break;
                }
                //unselect everything
                this.select();
            } else {
                throw ("Expected a Pile, instead got " + destination + "\n  in Pile.moveTo(Pile, String)");
            }
            return this;
        }
        this.add = function(arrayOfCards, where) {
            if(typeof where != "number") where = this.size();
            if(where < 0) where += this.size();
            if(where < 0 || where > this.size()) where = this.size();
            if(arrayOfCards instanceof Card)
                arrayOfCards = [arrayOfCards];
            if(Array.isArray(arrayOfCards)) {
                for(var i = 0; i < arrayOfCards.length; ) {
                    if(!(arrayOfCards[i] instanceof Card)) arrayOfCards.splice(i, 1);
                    else i++;
                }
                arrayOfCards.unshift(0); //dont delete
                arrayOfCards.unshift(where); //start at $where
                cards.splice.apply(cards, arrayOfCards); //insert
                for(var s = 0; s < selected.length; s++) {
                    if(selected[s] >= where) selected[s] += arrayOfCards.length;
                }
            }
            return this;
        }
        this.remove = function() {
            var p = new Pile(popSelected(), game);
            this.select();
            return p;
        }
        this.swap = function() {
            var which = [];
            if(arguments.length == 0) which = selected;
            else {
                for(var i = 0; i < arguments.length; i++) {
                    if(typeof arguments[i] == "number") {
                        var index = arguments[i];
                        if(index < 0) index += this.size();
                        if(index >= 0 && index < this.size()) which.push(index);
                    }
                }
            }
            if(which.length >= 2) {
                var temp = cards[which[0]];
                cards[which[0]] = cards[which[1]];
                cards[which[1]] = temp;
                //updated selection to match swapped changes
                if(selected.indexOf(which[0]) != -1 && selected.indexOf(which[1]) == -1) {
                    selected[selected.indexOf(which[0])] = which[1];
                }
                else if(selected.indexOf(which[1]) != -1 && selected.indexOf(which[0]) == -1) {
                    selected[selected.indexOf(which[1])] = which[0];
                }
            }
            return this;
        }
        this.randomIndex = function() {
            return Math.floor(Math.random()*this.size());
        }
        /**Expects a string in the form <Rank><Suit> where
           rank and suit are one-character representations
           OR a card object with desired rank and suit
           @return  the index of the card, or -1 if not found*/
        this.find = function(_card) {
            if(typeof _card == "string" && _card.length == 2) {
                _card = new Card(_card, -1);
                return this.find(_card);
            }
            else if(_card instanceof Card) {
                _card.rank = _card.rank || NULL_RANK;
                _card.suit = _card.suit || NULL_SUIT;
                for(var i = 0; i < cards.length; i++) {
                    if(cards[i].rank.symbol == _card.rank.symbol && cards[i].suit.symbol == _card.suit.symbol) {
                        return i;
                    }
                }
            }
            return -1;
        }
        this.reverse = function() {
            for(var i = 0; i < cards.length/2; i++) {
                this.swap(i, this.size()-i-1);
            }
            return this;
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
        Game: Game,
        decode: string2RS
    };
})();