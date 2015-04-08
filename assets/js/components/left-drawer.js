/**
 * Created by Dzmitry_Salnikau on 3/2/2015.
 * Component LeftDrawer - left pull user-menu
 */
IR.MODULE.LEFT_DRAWER.directive('irLeftDrawer', function($rootScope, $window, irExtendService, irDeviceInfo, irLog) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/left-drawer.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function LeftDrawerElementComponent() {
                // call of the parent constructor
                LeftDrawerElementComponent.superclass.constructor.call(this);

                this.NAME = "LeftDrawer";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = true;

                this.CLASS = {
                    OPEN: "open",
                    OPPOSITE_DRAWER_OPEN: "opposite-drawer-open",
                    _DRAGGER: ".dragger",
                    _TILE: ".tile"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.VAL = {
                    REM: "rem",
                    INHERIT: "inherit"
                };

                this.EVENT = {
                    TAP: "tap",
                    SWIPE_RIGHT: "swiperight",
                    SWIPE_LEFT: "swipeleft"
                };

                this.ELEMENT = {
                    DRAGGER: angular.element(wrapper[0].querySelector(this.CLASS._DRAGGER))
                };

                this.STATE = {
                    OPEN: "open",
                    CLOSE: "close"
                };

                // global listeners
                var offHeaderUserMenuButtonClicked = new Function(),
                    offRightDrawerOpen = new Function(),
                    offRightDrawerClose = new Function();

                var currentState = this.STATE.CLOSE,
                    mobileFontDecreaseValue = 0.06,
                    tilesNumber = 0,
                    tileHeight = 0,
                    minHeight = 0;

                this._init = function () {
                    var tilesArray = wrapper[0].querySelectorAll(this.CLASS._TILE);
                    tilesNumber = tilesArray.length;
                    tileHeight = tilesNumber > 0 ? tilesArray[0].offsetHeight : 0;
                    minHeight = tileHeight > 0 ? (tileHeight*tilesNumber) : 0;
                };

                this._postCreate = function(){
                    // global listeners
                    offHeaderUserMenuButtonClicked = $rootScope.$on(IR.EVENT.OCCURRED.HEADER_USER_MENU_BUTTON_CLICKED, angular.bind(this, this.toggle));

                    offRightDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_OPEN, angular.bind(this, this._onRightDrawerOpen));
                    offRightDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_CLOSE, angular.bind(this, this._onRightDrawerClose));

                    // local listeners
                    this.ELEMENT.DRAGGER.hammer = new Hammer(this.ELEMENT.DRAGGER[0])
                        .on(this.EVENT.TAP, angular.bind(this, this.toggle))
                        .on(this.EVENT.SWIPE_RIGHT, angular.bind(this, this.open))
                        .on(this.EVENT.SWIPE_LEFT, angular.bind(this, this.close));
                };

                this._resize = function(vw, vh){
                    var fontSize = 0.00;
                    // adjust by width
                    if (vw > irDeviceInfo.mobileWidth) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / irDeviceInfo.desktopBaseWidth).toFixed(2)), 1);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        // adjust by height for mobiles
                        if(vh <= minHeight){
                            fontSize = Math.min(parseFloat((vh / minHeight).toFixed(2)) - mobileFontDecreaseValue, 1);
                            wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                        } else {
                            // for any other cases - use css inherit value
                            wrapper.css(this.ATTR.FONT_SIZE, this.VAL.INHERIT)
                        }
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    offHeaderUserMenuButtonClicked();

                    // remove local listeners
                    this.ELEMENT.DRAGGER.hammer.destroy();
                };

                this.toggle = function(){
                    irLog.writeAs(irLog.LOG_LEVEL.INFO, this.NAME + ": toggle");
                    if(currentState === this.STATE.CLOSE){
                        this.open();
                    } else{
                        this.close();
                    }
                };

                this.open = function(){
                    irLog.writeAs(irLog.LOG_LEVEL.INFO, this.NAME + ": open");
                    wrapper.addClass(this.CLASS.OPEN);
                    currentState = this.STATE.OPEN;
                    $rootScope.$broadcast(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN);
                };

                this.close = function(){
                    irLog.writeAs(irLog.LOG_LEVEL.INFO, this.NAME + ": close");
                    if(wrapper.hasClass(this.CLASS.OPEN)){
                        wrapper.removeClass(this.CLASS.OPEN);
                        currentState = this.STATE.CLOSE;
                        $rootScope.$broadcast(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE);
                    }
                };

                this._onRightDrawerOpen = function(){
                    this.close();
                    wrapper.addClass(this.CLASS.OPPOSITE_DRAWER_OPEN);
                };

                this._onRightDrawerClose = function(){
                    wrapper.removeClass(this.CLASS.OPPOSITE_DRAWER_OPEN);
                };
            }

            irExtendService.extend(LeftDrawerElementComponent, irExtendService.BaseElementComponent);

            if(IR.UIC.LEFT_DRAWER){
                // no need to create a second component
                IR.UIC.LEFT_DRAWER.destroy();
            }
            IR.UIC.LEFT_DRAWER = new LeftDrawerElementComponent().build().render();

            return IR.UIC.LEFT_DRAWER;
        }
    };
});


