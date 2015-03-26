/**
 * Created by Dzmitry_Salnikau on 3/23/2015.
 */
IR.MODULE.CONTENT.directive('irCardContainer', function($rootScope, $window, irExtendService, irArtService, irDeviceInfoService) {
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

                this._init = function(){
                    irArtService.load(function(success){
                        window.console.log(" --- CARD_CONTAINER --- SUCCESS");
                        window.console.log(success);
                    });
                };

                this._render = function(){
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
            IR.UIC.CARD_CONTAINER = new CardContainerComponent().build().render();

            return IR.UIC.CARD_CONTAINER;
        }
    };
});

