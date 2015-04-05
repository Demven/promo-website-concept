/**
 * Created by Dzmitry_Salnikau on 3/23/2015.
 */
IR.MODULE.CONTENT.directive('irCardContainer', function($rootScope, $window, $q, irExtendService, irArtService, irCardFactory, irLog) {
    return {
        restrict: 'E',
        link: function(scope, wrapper) {

            function CardContainerComponent() {
                // call of the parent constructor
                CardContainerComponent.superclass.constructor.call(this);

                this.NAME = "CardContainer";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.CLASS = {
                    COLUMN_1: "column-1",
                    COLUMN_2: "column-2",
                    COLUMN_3: "column-3",
                    COLUMN_4: "column-4"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto"
                };

                this.EVENT = {
                    TAP: "tap"
                };

                var wrapperEl, // HTMLElement object
                    loadPromise = null,
                    lastRenderedPortion = -1,
                    cardPortionsCache = [], // cache for Card objects' portions (array of arrays) [[portion1], [portion2], ...]
                    firstCard, // Card object that is the first in stack
                    rowsMatrix, // matrix of rows (array of arrays) [[row1],[row2],...]
                    columnsMatrix, // matrix of columns (array of arrays) [[column1],[column2],...]
                    rowsHeights = []; // array of rows' heights (height of the row = height of the highest card in a row)

                var width,
                    padding = 8, // em
                    pxInRem = 10, // px
                    fontSize = 1, // rem
                    cardMargin = 1.6, // em
                    columnsNumber = 0,
                    cardWidth = 0;

                this._init = function(){
                    wrapperEl = wrapper[0];
                    var loadDeffered = $q.defer();
                    loadPromise = loadDeffered.promise;
                    irArtService.load(function(artArray){
                        loadDeffered.resolve(artArray);
                    });
                };

                this._create = function(artArray){
                    if(artArray){
                        // create card-objects for all of this data items
                        var self = this,
                            i = 0,
                            len = artArray.length,
                            card,
                            cardPortion = [],
                            buildCounter = 0;
                        for( ; i < len; i++){
                            card = irCardFactory.createCard(artArray[i]);
                            cardPortion.push(card);
                            card.build(function(){
                                buildCounter = buildCounter + 1;
                                if(buildCounter === len){
                                    cardPortionsCache.push(cardPortion); // save portion to cache
                                    lastRenderedPortion = lastRenderedPortion + 1;
                                    firstCard = card; // save first card to variable
                                    self.render(cardPortion);
                                }
                            });
                        }
                    } else{
                        loadPromise.then(angular.bind(this, function(artArray){
                            if(artArray){
                                // a portion of art items successfully loaded
                                // create them
                                this._create(artArray);
                            }
                        }));
                    }
                };

                this._render = function(cardPortion){
                    var i = 0,
                        len = cardPortion.length,
                        card;
                    for( ; i < len; i++){
                        card = cardPortion[i];
                        wrapper.append(card.getWrapper());
                        card.render();
                    }
                };

                this._resize = function(/* vw, vh */){
                    window.console.log("resize cards!");
                    resizeCards();

                    width = wrapperEl.offsetWidth - convertEmToPx(padding + padding); // available width for cards
                    cardWidth = firstCard.getWidth() + convertEmToPx(cardMargin + cardMargin);

                    var newColumnsNumber = Math.floor(width/cardWidth);

                    window.console.log("width: " + width + " card-width: " + cardWidth);

                    if(newColumnsNumber !== columnsNumber){
                        columnsNumber = newColumnsNumber;
                        irLog.all(this.NAME + ": columns number = " + columnsNumber);

                        // number of columns changed - recalculate matrix
                        calculateMatrix();
                    }

                    // shift cards up to hide empty spaces
                    shiftCards();
                };

                this._destroy = function(){
                    cardPortionsCache = null;
                    rowsMatrix = null;
                    columnsMatrix = null;
                };

                var resizeCards = function(){
                    var p = 0, // portion index
                        c = 0, // card index,
                        portionsQuantity = cardPortionsCache.length,
                        cardQuantity = 0,
                        portion;

                    for( ; p < portionsQuantity; p++){
                        portion = cardPortionsCache[p];
                        // for each portion
                        cardQuantity = portion.length;
                        for (c = 0; c < cardQuantity; c++){
                            portion[c]._resize();
                        }
                    }
                };

                /**
                 * Shifts up if necessary cards to hide empty spaces in rows
                 */
                var shiftCards = function(){
                    var i = 0,
                        c = 1, // start from the second card in each column
                        column,
                        card,
                        prevCard,
                        cardsInColumn = 0,
                        cardHeight = 0,
                        prevCardHeight = 0,
                        prevCardShift = 0,
                        prevRowHeight = 0,
                        shiftValue = 0;

                    // vertical shift
                    for( ; i < columnsNumber; i++){
                        // for each column
                        column = columnsMatrix[i];
                        for(c = 1, cardsInColumn = column.length; c < cardsInColumn; c++){
                            // for each card
                            card = column[c];
                            prevCard = column[c-1];
                            cardHeight = card.getHeight();
                            prevCardHeight = prevCard.getHeight();
                            prevCardShift = convertEmToPx(prevCard.getShiftUp());
                            prevRowHeight = rowsHeights[c-1]; // height of the previous row
                            shiftValue = convertPxToEm(prevRowHeight - prevCardHeight + prevCardShift);

                            if(shiftValue > 0){
                                card.shiftUp(shiftValue);
                            } else{
                                card.shiftUp(0);
                            }
                        }
                    }

                    // horizontal shift (for the last row if it is incomplete)
                    var lastRow = rowsMatrix[rowsMatrix.length-1],
                        lastRowLength = lastRow.length;
                    if(lastRowLength < columnsNumber){
                        // incomplete row
                        shiftValue = convertPxToEm(cardWidth*(columnsNumber-lastRowLength)/2);
                        for(c = 0; c < lastRowLength; c++){
                            // shift to left each card
                            card = lastRow[c];
                            card.shiftLeft(shiftValue);
                        }
                    }
                };

                /**
                 * Create matrix of rows and columns (array of arrays)
                 * Must be fired when columns quantity changes on resize
                 */
                var calculateMatrix = function(){
                    // columns are calculated from rows, so must be such sequence
                    _calculateRows();
                    _calculateColumns();
                };

                var _calculateRows = function(){
                    var p = 0, // portion index
                        c = 0, // card index
                        rowCapacity = columnsNumber,
                        portionsQuantity = cardPortionsCache.length,
                        cardQuantity = 0,
                        portion,
                        row = [],
                        currentHeight = 0,
                        rowHeight = 0;

                    rowsMatrix = [];
                    rowsHeights = [];

                    for( ; p < portionsQuantity; p++){
                        portion = cardPortionsCache[p];
                        // for each portion
                        cardQuantity = portion.length;
                        for (c = 0; c < cardQuantity; c++){
                            cardToMatrix(portion[c]);
                        }
                    }

                    if(row.length <= rowCapacity){
                        // the row is incomplete - add to matrix anyway
                        rowToMatrix();
                    }

                    window.console.log("rows");
                    window.console.log(rowsMatrix);
                    window.console.log("heights");
                    window.console.log(rowsHeights);

                    function cardToMatrix(card){
                        if(row.length < rowCapacity){
                            row.push(card);
                            currentHeight = card.getHeight();
                            if(currentHeight > rowHeight){
                                rowHeight = currentHeight;
                            }
                        } else {
                            rowToMatrix();
                            // recursively call to add card again (in the newly created row)
                            cardToMatrix(card);
                        }
                    }

                    function rowToMatrix(){
                        rowsMatrix.push(row);
                        rowsHeights.push(rowHeight);
                        row = [];
                        rowHeight = 0;
                    }
                };

                var _calculateColumns = function(){
                    var r = 0, // row index
                        c = 0, // card index
                        columnCapacity = rowsMatrix.length,
                        rowsQuantity = columnCapacity,
                        cardQuantity = 0,
                        row;

                    columnsMatrix = [];

                    for( ; r < rowsQuantity; r++){
                        row = rowsMatrix[r];
                        // for each row
                        cardQuantity = row.length;
                        for (c = 0; c < cardQuantity; c++){
                            cardToMatrix(row[c]);
                        }
                    }

                    window.console.log("columns");
                    window.console.log(columnsMatrix);

                    function cardToMatrix(card){
                        if(!columnsMatrix[c]){
                            // add new empty column
                            columnsMatrix[c] = [];
                        }
                        columnsMatrix[c].push(card);
                    }
                };

                var convertEmToPx = function(em){
                    return em*fontSize*pxInRem;
                };

                var convertPxToEm = function(px){
                    return px*fontSize/pxInRem;
                };
            }

            irExtendService.extend(CardContainerComponent, irExtendService.BaseElementComponent);

            if(IR.UIC.CARD_CONTAINER){
                // no need to do a second header component
                IR.UIC.CARD_CONTAINER.destroy();
            }
            IR.UIC.CARD_CONTAINER = new CardContainerComponent().build();

            return IR.UIC.CARD_CONTAINER;
        }
    };
});

