/**
 * Created by Dzmitry_Salnikau on 3/23/2015.
 */
IR.MODULE.CONTENT.directive('irCardContainer', function($rootScope, $window, $q, irExtendService, irArtService, irCardFactory, irDeviceInfoService) {
    return {
        restrict: 'E',

        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

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

                var loadPromise = null,
                    lastRenderedPortion = -1,
                    cardPortionsCache = []; // cache for portions (array of array) [[portion1], [portion2], ...]

                this._init = function(){
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

                this._resize = function(vw, vh){
                };

                this._destroy = function(){
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

