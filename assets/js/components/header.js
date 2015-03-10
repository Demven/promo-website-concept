/**
 * Created by Dzmitry_Salnikau on 2/17/2015.
 */

IR.MODULE.HEADER.directive('header', function($rootScope, $window, extendService, deviceInfoService) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/header.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function HeaderElementComponent() {
                // call of the parent constructor
                HeaderElementComponent.superclass.constructor.call(this);

                this.ROOTSCOPE = $rootScope;
                this.WINDOW = $window;
                this.NAME = "Header";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = true;

                this.CLASS = {
                    SLIDE_RIGHT: "slide-right",
                    SLIDE_LEFT: "slide-left",
                    COLLAPSED: "collapsed"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto"
                };

                this.EVENT = {
                    CLICK: "click"
                };

                this.STATE = {
                    NORMAL: "normal",
                    SLIDE_RIGHT: "slide_right",
                    SLIDE_LEFT: "slide_left"
                };

                this.ELEMENT = {
                    USER_MENU_BUTTON: angular.element(wrapper[0].querySelector(".user-menu-button"))
                    //CENTER_BOX: angular.element(wrapper[0].querySelector(".center-box")),
                    //TITLE_BOX: angular.element(wrapper[0].querySelector(".title-box")),
                    //ACTIONS_BOX: angular.element(wrapper[0].querySelector(".actions-box"))
                };

                // global listeners
                var offLeftDrawerOpen = new Function(),
                    offLeftDrawerClose = new Function();

                var currentState = this.STATE.NORMAL;

                this._postCreate = function(){
                    offLeftDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN, angular.bind(this, this._onLeftDrawerOpen));
                    offLeftDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE, angular.bind(this, this._onLeftDrawerClose));

                    // local listeners
                    this.ELEMENT.USER_MENU_BUTTON.bind(this.EVENT.CLICK, function(){
                        $rootScope.$broadcast(IR.EVENT.HEADER_USER_MENU_BUTTON_CLICKED);
                    });
                };

                this._resize = function(vw, vh){
                    if (vw > deviceInfoService.mobileWidth) {
                        // for desktop and tablet
                        var fontSize = Math.min(vw / deviceInfoService.desktopBaseWidth, 1);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        wrapper.css(this.ATTR.FONT_SIZE, this.VAL.AUTO)
                    }
                };

                this._onLeftDrawerOpen = function(){
                    wrapper.addClass(this.CLASS.SLIDE_RIGHT);
                    this.ELEMENT.USER_MENU_BUTTON.addClass(this.CLASS.COLLAPSED);
                    currentState = this.STATE.SLIDE_RIGHT;
                };

                this._onLeftDrawerClose = function(){
                    if(currentState === this.STATE.SLIDE_RIGHT){
                        wrapper.removeClass(this.CLASS.SLIDE_RIGHT);
                        this.ELEMENT.USER_MENU_BUTTON.removeClass(this.CLASS.COLLAPSED);
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    offLeftDrawerOpen();
                    offLeftDrawerClose();

                    // remove local listeners
                    this.ELEMENT.USER_MENU_BUTTON.unbind(this.EVENT.CLICK);
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

