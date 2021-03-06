/**
 * Created by Dmitry_Salnikov on 9/24/2015.
 */
DAR.MODULE.HEADER.directive('header', 
    ['$rootScope', '$timeout', 'darExtendService', 'darDeviceInfo', 
    function($rootScope, $timeout, darExtendService, darDeviceInfo) {
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
                    OPEN: "open",
                    PREVENT_SCROLL: "prevent-scroll",
                    LOGO_SHOW: "show"
                };

                this.SELECTOR = {
                    MENU_BUTTON: ".menu-button",
                    LOGO: ".logo",
                    NAV_ITEM: "li"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto"
                };

                this.STATE = {
                    NORMAL: "normal",
                    CLOSED: "closed",
                    OPEN: "open"
                };

                this.ELEMENT = {
                    MENU_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.MENU_BUTTON)),
                    LOGO: angular.element(wrapper[0].querySelector(this.SELECTOR.LOGO)),
                    BODY: angular.element(window.document.body),
                    NAV_ITEM: wrapper[0].querySelectorAll(this.SELECTOR.NAV_ITEM)
                };

                this.EVENT = {
                    TAP: "touch",
                    SWIPE_DOWN: "swipeDown",
                    SWIPE_UP: "swipeUp",
                    TOUCH_MOVE: "touchmove",
                    SCROLL: "scroll"
                };

                this.CONFIG = {
                    MOBILE_PORTRAIT_MAX_WIDTH: 414,
                    MOBILE_PORTRAIT_FACTOR: 0.8,
                    MOBILE_LANDSCAPE_FACTOR: 0.5,
                    MAX_SCROLL_VH_FACTOR: 0.45,
                    MOBILE_NAV_FOLDED_ANGLE_HEIGHT_VH: 0.08,
                    MOBILE_NAV_CLOSE_ANIMATION_MS: 200
                };

                var currentState = this.STATE.NORMAL;

                var self = this;
                var maxScrollTop = 0;
                var isLogoHidden = true;

                this._postCreate = function(){
                    // local listeners
                    var menuButton = this.ELEMENT.MENU_BUTTON[0];
                    // tap
                    Quo(menuButton).on(this.EVENT.TAP, angular.bind(this, this.toggleMenu));
                    for(var i = this.ELEMENT.NAV_ITEM.length; i--; ){
                        Quo(this.ELEMENT.NAV_ITEM[i]).on(this.EVENT.TAP, angular.bind(this, this.onNavItemClicked));
                    }

                    // swipe
                    Quo(menuButton).on(this.EVENT.SWIPE_DOWN, angular.bind(this, this.openMenu));
                    Quo(menuButton).on(this.EVENT.SWIPE_UP, angular.bind(this, this.closeMenu));

                    this.setState(this.STATE.NORMAL);
                };

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                    } else {
                        // mobile
                        if(darDeviceInfo.isPortraitMode){
                            fontSize = Math.min(parseFloat((vw * this.CONFIG.MOBILE_PORTRAIT_FACTOR / this.CONFIG.MOBILE_PORTRAIT_MAX_WIDTH).toFixed(2)), this.CONFIG.MOBILE_PORTRAIT_FACTOR);
                        } else {
                            // landscape
                            fontSize = Math.min(parseFloat((vw * this.CONFIG.MOBILE_LANDSCAPE_FACTOR / darDeviceInfo.MOBILE_WIDTH).toFixed(2)), this.CONFIG.MOBILE_LANDSCAPE_FACTOR);
                        }
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

                    maxScrollTop = this.CONFIG.MAX_SCROLL_VH_FACTOR * vh;
                };

                this._setState = function(state){
                    switch(state){
                        case this.STATE.NORMAL:
                            wrapper.removeClass(this.CLASS.CLOSED);
                            wrapper.removeClass(this.CLASS.OPEN);
                            this.addScrollHandling();
                            currentState = this.STATE.NORMAL;
                            break;
                        case this.STATE.CLOSED:
                            wrapper.removeClass(this.CLASS.OPEN);
                            wrapper.addClass(this.CLASS.CLOSED);
                            $timeout(function(){
                                // prevent scrolling until animated menu will disappear
                                self.ELEMENT.BODY.removeClass(self.CLASS.PREVENT_SCROLL);
                            }, 400);
                            this.removeScrollHandling();
                            this.removeTouchHandling();
                            currentState = this.STATE.CLOSED;
                            break;
                        case this.STATE.OPEN:
                            wrapper.removeClass(this.CLASS.CLOSED);
                            wrapper.addClass(this.CLASS.OPEN);
                            this.ELEMENT.BODY.addClass(this.CLASS.PREVENT_SCROLL);
                            this.addTouchHandling();
                            currentState = this.STATE.OPEN;
                            break;
                    }
                };

                this._destroy = function(){
                    // remove local listeners
                    var menuButton = this.ELEMENT.MENU_BUTTON[0];
                    Quo(menuButton).off(this.EVENT.TAP);
                    Quo(menuButton).off(this.EVENT.SWIPE_DOWN);
                    Quo(menuButton).off(this.EVENT.SWIPE_UP);

                    for(var i = this.ELEMENT.NAV_ITEM.length; i--; ){
                        Quo(this.ELEMENT.NAV_ITEM[i]).off(this.EVENT.TAP);
                    }

                    this.removeTouchHandling();
                };

                /*************************************** */

                this.onNavItemClicked = function(ev){
                    var sectionName = angular.element(ev.target).attr('data-section-name'),
                        additionalOffset = darDeviceInfo.isMobileState ? (this.CONFIG.MOBILE_NAV_FOLDED_ANGLE_HEIGHT_VH * darDeviceInfo.getViewport().vh) : wrapper[0].offsetHeight;

                    this.closeMenu();

                    // wait till the end of animation
                    // and then will broadcast event to scroll to clicked section
                    $timeout(function() {
                        $rootScope.$broadcast(DAR.EVENT.WISH.SCROLL_TO_SECTION, {sectionName: sectionName, offsetTop: additionalOffset});
                    }, this.CONFIG.MOBILE_NAV_CLOSE_ANIMATION_MS);
                };

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

                this.addTouchHandling = function(){
                    wrapper[0].addEventListener(this.EVENT.TOUCH_MOVE, self.handleTouchMove);
                };
                this.removeTouchHandling = function(){
                    wrapper[0].removeEventListener(this.EVENT.TOUCH_MOVE, self.handleTouchMove);
                };
                this.handleTouchMove = function(e){
                    e.preventDefault();
                };

                this.addScrollHandling = function(){
                    document.addEventListener(this.EVENT.SCROLL, self.handleScroll);
                };
                this.removeScrollHandling = function(){
                    document.removeEventListener(this.EVENT.SCROLL, self.handleScroll);
                };
                this.handleScroll = function(){
                    var scrollTop = window.document.documentElement.scrollTop || window.document.body.scrollTop;
                    if(isLogoHidden && (scrollTop > maxScrollTop)){
                        self.ELEMENT.LOGO.addClass(self.CLASS.LOGO_SHOW);
                        isLogoHidden = false;
                    } else if(!isLogoHidden && (scrollTop < maxScrollTop)) {
                        self.ELEMENT.LOGO.removeClass(self.CLASS.LOGO_SHOW);
                        isLogoHidden = true;
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
}]);

