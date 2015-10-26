/**
 * Created by Dmitry_Salnikov on 9/24/2015.
 */
DAR.MODULE.HEADER.directive('header', function($rootScope, $window, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/header.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function HeaderElementComponent() {
                // call of the parent constructor
                HeaderElementComponent.superclass.constructor.call(this);

                this.NAME = "Header";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = true;

                this.CLASS = {
                    CLOSED: "closed",
                    OPEN: "open"
                };

                this.SELECTOR = {
                    MENU_BUTTON: ".menu-button"
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

                this.STATE = {
                    NORMAL: "normal",
                    CLOSED: "closed",
                    OPEN: "open"
                };

                this.ELEMENT = {
                    MENU_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.MENU_BUTTON))
                };

                this.EVENT = {
                    TAP: "touch",
                    SWIPE_DOWN: "swipeDown",
                    SWIPE_UP: "swipeUp"
                };

                // global listeners
                /*var offLeftDrawerOpen = new Function(),
                    offLeftDrawerClose = new Function(),
                    offRightDrawerOpen = new Function(),
                    offRightDrawerClose = new Function();*/

                var currentState = this.STATE.NORMAL;
                var MOBILE_MAX_WIDTH = 414;

                this._postCreate = function(){
                    // local listeners
                    var menuButton = this.ELEMENT.MENU_BUTTON[0];
                    // tap
                    Quo(menuButton).on(this.EVENT.TAP, angular.bind(this, this.toggleMenu));
                    // swipe
                    Quo(menuButton).on(this.EVENT.SWIPE_DOWN, angular.bind(this, this.openMenu));
                    Quo(menuButton).on(this.EVENT.SWIPE_UP, angular.bind(this, this.closeMenu));
                };

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((vw / MOBILE_MAX_WIDTH).toFixed(2)), 1);
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);

                    // set proper state
                    if(darDeviceInfo.deviceState === darDeviceInfo.DEVICE_STATE.MOBILE){
                        if(currentState === this.STATE.NORMAL){
                            this.setState(this.STATE.CLOSED);
                        }
                    } else if(currentState === this.STATE.CLOSED){
                        this.setState(this.STATE.NORMAL);
                    }
                };

                this._setState = function(state){
                    switch(state){
                        case this.STATE.NORMAL:
                            wrapper.removeClass(this.CLASS.CLOSED);
                            wrapper.removeClass(this.CLASS.OPEN);
                            currentState = this.STATE.NORMAL;
                            break;
                        case this.STATE.CLOSED:
                            wrapper.removeClass(this.CLASS.OPEN);
                            wrapper.addClass(this.CLASS.CLOSED);
                            currentState = this.STATE.CLOSED;
                            break;
                        case this.STATE.OPEN:
                            wrapper.removeClass(this.CLASS.CLOSED);
                            wrapper.addClass(this.CLASS.OPEN);
                            currentState = this.STATE.OPEN;
                            break;
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    //offLeftDrawerOpen();
                    //offLeftDrawerClose();

                    // remove local listeners
                    var menuButton = this.ELEMENT.MENU_BUTTON[0];
                    Quo(menuButton).off(this.EVENT.TAP);
                    Quo(menuButton).off(this.EVENT.SWIPE_DOWN);
                    Quo(menuButton).off(this.EVENT.SWIPE_UP);
                };

                /*************************************** */

                this.openMenu = function(){
                    if(currentState === this.STATE.CLOSED){
                        this.setState(this.STATE.OPEN);
                    }
                };

                this.closeMenu = function(){
                    if(currentState === this.STATE.OPEN){
                        this.setState(this.STATE.CLOSED);
                    }
                };

                this.toggleMenu = function(){
                    if(currentState === this.STATE.CLOSED){
                        this.openMenu();
                    } else if(currentState === this.STATE.OPEN) {
                        this.closeMenu();
                    }
                };
            }

            darExtendService.extend(HeaderElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.HEADER){
                // no need to do a second header component
                DAR.UIC.HEADER.destroy();
            }
            DAR.UIC.HEADER = new HeaderElementComponent().build().render();

            return DAR.UIC.HEADER;
        }
    };
});

