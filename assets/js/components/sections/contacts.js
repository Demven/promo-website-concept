/**
 * Created by Dmitry Salnikov on 12/2/2015.
 */
DAR.MODULE.SECTION_CONTACTS.directive('darSectionContacts', function($rootScope, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/contacts.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionContactsElementComponent() {
                // call of the parent constructor
                SectionContactsElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionContacts";
                this.VERSION = "0.1";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.EVENT = {
                    TAP: "touch"
                };

                this.VAL = {
                    REM: "rem"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.CLASS = {
                    NORMAL: "normal"
                };

                /*this.SELECTOR = {
                 TILE_SMALL: ".tile.small"
                 };

                 this.ELEMENT = {
                 TILES_SMALL: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_SMALL))
                 };*/

                this.STATE = {
                    NORMAL: "normal"
                };

                this.CONFIG = {
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.8
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

                this._resize = function(vw, vh) {
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw) * 0.335 / 370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.335 - difference in fonts values for these extreme width
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                }
            }

            darExtendService.extend(SectionContactsElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.CONTACTS){
                DAR.UIC.SECTION.CONTACTS.destroy();
            }
            DAR.UIC.SECTION.CONTACTS = new SectionContactsElementComponent().build().render();

            return DAR.UIC.SECTION.CONTACTS;
        }
    };
});

