/**
 * Created by Dzmitry_Salnikau on 3/23/2015.
 */
IR.MODULE.CONTENT.directive('irCardContainer', function($rootScope, $window, $q, irExtendService, irArtService, irCardFactory, irElement, irDeviceInfo, irLog) {
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
                    SHOW: "show"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto"
                };

                this.EVENT = {
                    TAP: "tap",
                    SCROLL: "scroll"
                };

                var wrapperEl, // HTMLElement object
                    loadPromise = null,
                    lastRenderedPortion = -1,
                    cardPortionsCache = [], // cache for Card objects' portions (array of arrays) [[portion1], [portion2], ...]
                    firstCard, // Card object that is the first in stack
                    rowsMatrix, // matrix of rows (array of arrays) [[row1],[row2],...]
                    columnsMatrix, // matrix of columns (array of arrays) [[column1],[column2],...]
                    rowsHeights = [], // array of rows' heights (height of the row = height of the highest card in a row)
                    columnsHeights = [], // array of columns' heights (height of the column = sum of heights of the all cards in a column)
                    minColumnHeight, // px
                    maxColumnHeight, // px
                    canTrackScroll = true; // flag that indicates whether we can track scroll

                var PADDING = {
                    MOBILE: 1,
                    TABLET: 2,
                    TABLET_WIDE: 2,
                    DESKTOP: 4,
                    DESKTOP_WIDE: 4
                };

                var COLUMNS = {
                    MOBILE: 1,
                    TABLET: 2,
                    TABLET_WIDE: 2,
                    DESKTOP: 3,
                    DESKTOP_WIDE: 4
                };

                var width,
                    padding = PADDING.DESKTOP, // em
                    columnsByDevice = COLUMNS.DESKTOP,
                    pxInRem = 10, // px
                    baseFontSize = 1, // rem
                    currentFontSize = 1, // rem
                    columnsNumber = 0,
                    cardMargin = 1.6, // em (if you chane this - see baseCardWidth below)
                    baseCardWidth = 432,// px (40em + 2*1.6em = 43.2em)
                    cardWidth = 0,
                    deviceState,
                    isDeviceStateChanged = false;

                this._init = function(){
                    wrapperEl = wrapper[0];
                    var loadDeffered = $q.defer();
                    loadPromise = loadDeffered.promise;
                    irArtService.load(function(artArray){
                        loadDeffered.resolve(artArray);
                    });
                };

                this._create = function(artArray, afterRenderCallback){
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
                                    if(cardPortionsCache.length > 1){
                                        // not the first portion
                                        self._render(cardPortion, afterRenderCallback);
                                    } else {
                                        // first portion
                                        firstCard = card; // save first card to variable
                                        // use parent render method
                                        self.render(cardPortion, afterRenderCallback);
                                    }
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

                this._postCreate = function(){
                    window.addEventListener(this.EVENT.SCROLL, scroll, false);
                };

                this._render = function(cardPortion, afterRenderCallback){
                    var i = 0,
                        len = cardPortion.length,
                        card,
                        needToShow = cardPortionsCache.length >= 2; // show only from the second portion

                    for( ; i < len; i++){
                        card = cardPortion[i];
                        wrapper.append(card.getWrapper());
                        card.render(null, needToShow);
                    }

                    wrapper.addClass(this.CLASS.SHOW);

                    if(typeof afterRenderCallback === "function"){
                        afterRenderCallback();
                    } else{
                        // obviously it is the first render
                        // fire this method to load next portion if it's necessary
                        scroll();
                    }
                };

                this._resize = function(vw, vh){
                    updateDeviceInfo();

                    window.console.log("columnsByDevice: " + columnsByDevice + " vw=" + vw + " padding = " + padding);

                    // set a proper font-size
                    this.scaleContainer();

                    if(isDeviceStateChanged){
                        // scale again, because padding has changed and so did available width after setting new font-size,
                        // so we need to adjust font-size again
                        this.scaleContainer();
                    }
                    // fire resize for each card
                    resizeCards();

                    // available width for cards
                    width = wrapperEl.offsetWidth - convertEmToPx(padding + padding);
                    // get a result card's width
                    cardWidth = (baseCardWidth*currentFontSize).toFixed(2);
                    window.console.log("width: " + width + " card-width: " + cardWidth);

                    // calculate number of columns and check whether it has changed
                    //var newColumnsNumber = Math.floor(width/cardWidth);
                    if(columnsByDevice !== columnsNumber){
                        columnsNumber = columnsByDevice;
                        irLog.all(this.NAME + ": columns number = " + columnsNumber);

                        // number of columns changed - recalculate matrix
                        calculateMatrix();

                        // shift cards up to hide empty spaces
                        shiftCards();
                    }
                };

                this._destroy = function(){
                    cardPortionsCache = null;
                    rowsMatrix = null;
                    columnsMatrix = null;

                    // remove local listeners
                    window.removeEventListener(this.EVENT.SCROLL, scroll, false);
                };

                this.loadNextPortion = function(){
                    canTrackScroll = false; // will become true after render portion
                    irArtService.getPortion(cardPortionsCache.length + 1, angular.bind(this, this.onPortionLoad));
                };

                this.onPortionLoad = function(artArray){
                    window.console.log("--- onPortionLoad ---");
                    window.console.log(artArray);

                    if(artArray.length){
                        this._create(artArray, function(){
                            // number of rows changed - recalculate matrix
                            calculateMatrix();
                            // shift cards up to hide empty spaces
                            shiftCards(); // TODO: shift only this portion

                            // cards are loaded and rendered - allow scroll tracking
                            canTrackScroll = true;

                            scroll(); // check scroll again
                        });
                    }
                };

                var scroll = function(){
                    if(canTrackScroll){
                        var offset = irElement.getOffset(wrapperEl),
                            minColumnBottom = offset.top + minColumnHeight,
                            threshold = 0.8*minColumnBottom,
                            scrollBottom = irDeviceInfo.getViewport().vh + window.scrollY;

                        window.console.log(window.scrollY + " scrollBottom = " + scrollBottom + " threshold=" + threshold);

                        if(scrollBottom > threshold){
                            IR.UIC.CARD_CONTAINER.loadNextPortion();
                        }
                    }
                };

                /**
                 * Set a proper padding and columns number according of the device state (tablet, mobile, etc...)
                 */
                var updateDeviceInfo = function(){
                    var currentDeviceState = irDeviceInfo.currentDeviceState,
                        DEVICE_STATE = irDeviceInfo.DEVICE_STATE;
                    // init padding and minimum number of columns according to a device state
                    window.console.log("DEVICE_STATE = " + currentDeviceState);
                    switch(currentDeviceState){
                        case DEVICE_STATE.DESKTOP_WIDE:
                            padding = PADDING.DESKTOP_WIDE;
                            columnsByDevice = COLUMNS.DESKTOP_WIDE;
                            break;
                        case DEVICE_STATE.DESKTOP:
                            padding = PADDING.DESKTOP;
                            columnsByDevice = COLUMNS.DESKTOP;
                            break;
                        case DEVICE_STATE.TABLET_WIDE:
                            padding = PADDING.TABLET_WIDE;
                            columnsByDevice = COLUMNS.TABLET_WIDE;
                            break;
                        case DEVICE_STATE.TABLET:
                            padding = PADDING.TABLET;
                            columnsByDevice = COLUMNS.TABLET;
                            break;
                        case DEVICE_STATE.MOBILE:
                            padding = PADDING.MOBILE;
                            columnsByDevice = COLUMNS.MOBILE;
                            break;
                    }

                    if(currentDeviceState !== deviceState){
                        deviceState = currentDeviceState;
                        isDeviceStateChanged = true;
                    } else{
                        isDeviceStateChanged = false;
                    }
                };

                /**
                 * Calculates and applies needed font size of the card container
                 */
                this.scaleContainer = function(){
                    var containerWidth = wrapperEl.offsetWidth - convertEmToPx(padding + padding),
                        neededCardWidth = containerWidth/columnsByDevice,
                        neededFontSize = (neededCardWidth*baseFontSize/baseCardWidth).toFixed(2) - 0.01;

                    currentFontSize = neededFontSize;
                    wrapper.css(this.ATTR.FONT_SIZE, neededFontSize + this.VAL.REM);
                    window.console.log("scale container: neededFontSize=" + neededFontSize + " containerWidth= " + containerWidth + " cardWidth = " + neededCardWidth);
                };

                /**
                 * Fire resize method on all of the cards in stack
                 */
                var resizeCards = function(){
                    window.console.log("resize cards!");
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
                        row,
                        cardBothMarginsPx = Math.ceil(convertEmToPx(2*cardMargin));

                    columnsMatrix = [];
                    columnsHeights = [];

                    for( ; r < rowsQuantity; r++){
                        row = rowsMatrix[r];
                        // for each row
                        cardQuantity = row.length;
                        for (c = 0; c < cardQuantity; c++){
                            cardToMatrix(row[c]);
                        }
                    }

                    // Calculate max column height
                    maxColumnHeight = Math.max.apply(Math, columnsHeights);

                    // Calculate min column height
                    minColumnHeight = Math.min.apply(Math, columnsHeights);

                    window.console.log("columns");
                    window.console.log(columnsMatrix);
                    window.console.log("col Height = " + maxColumnHeight);
                    window.console.log(columnsHeights);

                    function cardToMatrix(card){
                        if(!columnsMatrix[c]){
                            // add new empty column
                            columnsMatrix[c] = [];
                        }
                        if(!columnsHeights[c]){
                            // add new zero value of column height
                            columnsHeights[c] = 0;
                        }
                        columnsHeights[c] += (card.getHeight() + cardBothMarginsPx);
                        columnsMatrix[c].push(card);
                    }
                };

                var convertEmToPx = function(em){
                    return em*currentFontSize*pxInRem;
                };

                var convertPxToEm = function(px){
                    return px/(currentFontSize*pxInRem);
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

