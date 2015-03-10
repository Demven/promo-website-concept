/**
 * Created by Dzmitry_Salnikau on 3/2/2015.
 * Component LeftDrawer - left pull user-menu
 */
IR.MODULE.LEFT_DRAWER.directive('irLeftDrawer', function($rootScope, $window, extendService, deviceInfoService) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/left-drawer.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function LeftDrawerElementComponent() {
                // call of the parent constructor
                LeftDrawerElementComponent.superclass.constructor.call(this);

                this.ROOTSCOPE = $rootScope;
                this.WINDOW = $window;
                this.NAME = "LeftDrawer";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = false;

                this.CLASS = {
                    OPEN: "open"
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

                this.ELEMENT = {
                    DRAGGER: angular.element(wrapper[0].querySelector(".dragger"))
                };

                this.STATE = {
                    OPEN: "open",
                    CLOSE: "close"
                };

                // global listeners
                var offHeaderUserMenuButtonClicked = new Function();

                var currentState = this.STATE.CLOSE;

                this._postCreate = function(){
                    // global listeners
                    offHeaderUserMenuButtonClicked = $rootScope.$on(IR.EVENT.HEADER_USER_MENU_BUTTON_CLICKED, angular.bind(this, this.toggle));
                    this.ELEMENT.DRAGGER.bind(this.EVENT.CLICK, angular.bind(this, this.toggle));
                };

                this.toggle = function(){
                    if(currentState === this.STATE.CLOSE){
                        this.open();
                    } else{
                        this.close();
                    }
                };

                this.open = function(){
                    wrapper.addClass(this.CLASS.OPEN);
                    currentState = this.STATE.OPEN;
                    $rootScope.$broadcast(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN);
                };

                this.close = function(){
                    if(wrapper.hasClass(this.CLASS.OPEN)){
                        wrapper.removeClass(this.CLASS.OPEN)
                        currentState = this.STATE.CLOSE;
                        $rootScope.$broadcast(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE);
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    offHeaderUserMenuButtonClicked();

                    // remove local listeners
                    this.ELEMENT.DRAGGER.unbind(this.EVENT.CLICK);
                }
            }

            extendService.extend(LeftDrawerElementComponent, extendService.BaseElementComponent);

            if(IR.UIC.LEFT_DRAWER){
                // no need to create a second component
                IR.UIC.LEFT_DRAWER.destroy();
            }
            IR.UIC.LEFT_DRAWER = new LeftDrawerElementComponent().build().render();

            return IR.UIC.LEFT_DRAWER;
        }
    };
});


