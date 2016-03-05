/**
 * Created by Dmitry_Salnikov on 11/26/2015.
 */
DAR.MODULE.FOOTER.directive('footer',
    ['$rootScope', '$timeout', 'darExtendService', 'darDeviceInfo',
    function($rootScope, $timeout, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/footer.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function FooterElementComponent() {
                // call of the parent constructor
                FooterElementComponent.superclass.constructor.call(this);

                this.NAME = "Footer";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = true;

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem"
                };

                this.CLASS = {
                    NORMAL: "normal"
                };

                this.SELECTOR = {
                    CURRENT_YEAR: ".current-year"
                };

                this.ELEMENT = {
                    CURRENT_YEAR: angular.element(wrapper[0].querySelector(this.SELECTOR.CURRENT_YEAR))
                };

                this.CONFIG = {
                    MAX_FONT_SIZE: 1,
                    MAX_TABLET_FONT_SIZE: 0.8,
                    MAX_MOBILE_FONT_SIZE: 0.8
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                var currentState;

                this._render = function(){
                    this.setState(this.STATE.NORMAL);
                };

                this._setState = function(state){
                    switch(state){
                    case this.STATE.NORMAL:
                        wrapper.addClass(this.CLASS.NORMAL);
                        currentState = this.STATE.NORMAL;
                        break;
                    }
                };

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw <= darDeviceInfo.MOBILE_WIDTH) {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw)*0.35/370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.35 - difference in fonts values for these extreme width
                    }
                    var fontSizeValue = fontSize ? fontSize + this.VAL.REM : "";
                    wrapper.css(this.ATTR.FONT_SIZE, fontSizeValue);
                };
            }

            darExtendService.extend(FooterElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.FOOTER){
                // no need to do a second header component
                DAR.UIC.FOOTER.destroy();
            }
            DAR.UIC.FOOTER = new FooterElementComponent().build().render();

            return DAR.UIC.FOOTER;
        }
    };
}]);
