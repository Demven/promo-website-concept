/**
 * Created by Dzmitry_Salnikau on 2/17/2015.
 */

IR.MODULE.HEADER.directive('header', function($rootScope, $window, extendService) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/header.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function HeaderElementComponent() {
                // call of the parent constructor
                HeaderElementComponent.superclass.constructor.call(this);

                this.ROOTSCOPE = $rootScope;
                this.WINDOW = $window;
                this.NAME = "HeaderElementComponent";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = true;
                this.currentDeviceState = this.DEVICE_STATE.DESKTOP;

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto"
                };

                this.ELEMENT = {
                    CENTER_BOX: wrapper.find(".center-box"),
                    TITLE_BOX: wrapper.find(".title-box"),
                    ACTIONS_BOX: wrapper.find(".actions-box")
                };

                this._resize = function(vw, vh){
                    if (vw > 690) {
                        if (vw > 995) {
                            this.currentDeviceState = this.DEVICE_STATE.DESKTOP;
                        } else {
                            this.currentDeviceState = this.DEVICE_STATE.TABLET;
                        }

                        // for desktop and tablet
                        var fontSize = Math.min(vw / 1280, 1);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        this.currentDeviceState = this.DEVICE_STATE.MOBILE;
                        wrapper.css(this.ATTR.FONT_SIZE, this.VAL.AUTO)
                    }
                    console.log("FONT=" + fontSize + " vw=" + vw + " vh=" + vh);
                };
            }


            extendService.extend(HeaderElementComponent, extendService.BaseElementComponent);

            if(IR.UIC.HEADER){
                // no need to do a second header component
                IR.UIC.HEADER.destroy();
            }
            IR.UIC.HEADER = new HeaderElementComponent().build().render();

            return IR.UIC.HEADER;
        }
    };
});

