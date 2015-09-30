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
                    TAP: "tap"
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                this.ELEMENT = {
                    //ACTIONS_BOX: angular.element(wrapper[0].querySelector(".actions-box"))
                };

                // global listeners
                /*var offLeftDrawerOpen = new Function(),
                    offLeftDrawerClose = new Function(),
                    offRightDrawerOpen = new Function(),
                    offRightDrawerClose = new Function();*/

                var currentState = this.STATE.NORMAL;

                //this._postCreate = function(){
                    /*offLeftDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN, angular.bind(this, this._onLeftDrawerOpen));
                    offLeftDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE, angular.bind(this, this._onLeftDrawerClose));

                    offRightDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_OPEN, angular.bind(this, this._onRightDrawerOpen));
                    offRightDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_CLOSE, angular.bind(this, this._onRightDrawerClose));*/

                    // local listeners
                    /*this.ELEMENT.USER_MENU_BUTTON.hammer = new Hammer(this.ELEMENT.USER_MENU_BUTTON[0])
                            .on(this.EVENT.TAP, function(){
                                $rootScope.$broadcast(IR.EVENT.OCCURRED.HEADER_USER_MENU_BUTTON_CLICKED);
                            });
                    this.ELEMENT.NOTIFICATIONS_BUTTON.hammer = new Hammer(this.ELEMENT.NOTIFICATIONS_BUTTON[0])
                            .on(this.EVENT.TAP, function(){
                                $rootScope.$broadcast(IR.EVENT.OCCURRED.HEADER_NOTIFICATIONS_BUTTON_CLICKED);
                            });*/
                //};

                this._resize = function(vw, vh){
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        var fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        wrapper.css(this.ATTR.FONT_SIZE, this.VAL.AUTO)
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    //offLeftDrawerOpen();
                    //offLeftDrawerClose();

                    // remove local listeners
                    //this.ELEMENT.USER_MENU_BUTTON.hammer.destroy();
                    //this.ELEMENT.NOTIFICATIONS_BUTTON.hammer.destroy();
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

