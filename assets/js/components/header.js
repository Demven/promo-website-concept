/**
 * Created by Dzmitry_Salnikau on 2/17/2015.
 */

IR.MODULE.HEADER.directive('header', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/header.html',
        link: function(scope, iElement, iAttrs, controller, transcludeFn) {
            var DEVICE_STATE = {
                MOBILE: "mobile",
                TABLET: "tablet",
                DESKTOP: "desktop"
                },
                currentDeviceState = DEVICE_STATE.DESKTOP,
                elements = {
                    centerBoxEl: iElement.find(".center-box"),
                    titleBoxEl: iElement.find(".title-box"),
                    actionsBoxEl: iElement.find(".actions-box")
                };

            $rootScope.$on(IR.EVENT.OCCURRED.WINDOW_RESIZE, function(ev, data){
                _resize(data.vw, data.vh);
            });

            function _resize(vw, vh){
                if(vw > 690){
                    if(vw > 995){
                        currentDeviceState = DEVICE_STATE.DESKTOP;
                    } else{
                        currentDeviceState = DEVICE_STATE.TABLET;
                    }

                    // for desktop and tablet
                    var fontSize = Math.min(vw/1280, 1);
                    iElement.css("font-size", fontSize + "rem")
                } else{
                    iElement.css("font-size", "auto")
                }
                console.log("FONT=" + fontSize + " vw=" + vw + " vh=" + vh);
                //console.log(iElement.css("font-size"));
            }

            _resize();
        }
    };
});

