"use strict";
var IR = {
    // global scope
};

IR.MODULE_NAME = new (function(){
    this.APP_NAME = "inspirr";
    this.HEADER = this.APP_NAME + ".header";
    this.CONTENT = this.APP_NAME + ".content";
    this.LEFT_DRAWER = this.APP_NAME + ".leftDrawer";
    this.RIGHT_DRAWER = this.APP_NAME + ".rightDrawer";
    this.UTIL = this.APP_NAME + ".util";
    // pages:
    this.MAIN_PAGE = this.CONTENT + ".mainPage";
    this.GALLERY_PAGE = this.CONTENT + ".galleryPage";
    this.PROFILE_PAGE = this.CONTENT + ".profilePage";
    this.SETTINGS_PAGE = this.CONTENT + ".settingsPage";
})();

IR.MODULE = new (function(){
    this.HEADER = angular.module(IR.MODULE_NAME.HEADER, []);
    this.LEFT_DRAWER = angular.module(IR.MODULE_NAME.LEFT_DRAWER, []);
    this.RIGHT_DRAWER = angular.module(IR.MODULE_NAME.RIGHT_DRAWER, []);
    this.UTIL = angular.module(IR.MODULE_NAME.UTIL, []);
    // pages:
    this.MAIN_PAGE = angular.module(IR.MODULE_NAME.MAIN_PAGE, []);
    this.GALLERY_PAGE = angular.module(IR.MODULE_NAME.GALLERY_PAGE, []);
    this.PROFILE_PAGE = angular.module(IR.MODULE_NAME.PROFILE_PAGE, []);
    this.SETTINGS_PAGE = angular.module(IR.MODULE_NAME.SETTINGS_PAGE, []);
    // content module
    this.CONTENT = angular.module(IR.MODULE_NAME.CONTENT, [
        IR.MODULE_NAME.MAIN_PAGE,
        IR.MODULE_NAME.GALLERY_PAGE,
        IR.MODULE_NAME.PROFILE_PAGE,
        IR.MODULE_NAME.SETTINGS_PAGE
    ]);
    // main module
    this.INSPIRR = angular.module(IR.MODULE_NAME.APP_NAME, [
        'ui.router',
        'angular-gestures',
        IR.MODULE_NAME.HEADER,
        IR.MODULE_NAME.LEFT_DRAWER,
        IR.MODULE_NAME.RIGHT_DRAWER,
        IR.MODULE_NAME.CONTENT,
        IR.MODULE_NAME.UTIL
    ]);
})();

IR.EVENT = {
    WISH: {
        /** request to change page title using data send with this event */
        SET_PAGE_TITLE: "WISH_SET_PAGE_TITLE", // data = "pageTitle"
        /** request to change page subtitle using data send with this event */
        SET_PAGE_SUBTITLE: "WISH_SET_PAGE_SUBTITLE" // data = "pageSubtitle"
    },
    OCCURRED: {
        WINDOW_RESIZE: "OCCURRED_WINDOW_RESIZE", // data = {vw, vh}
        PAGE_CHANGED: "OCCURRED_PAGE_CHANGED",
        LOAD_DATA_START: "OCCURRED_LOAD_DATA_START",
        LOAD_DATA_FINISHED: "OCCURRED_LOAD_DATA_FINISHED"
    }
};

IR.MODULE.INSPIRR
    .config(function($stateProvider, $urlRouterProvider) {
        // router config
        $urlRouterProvider.otherwise("/main");
        $stateProvider
            .state('main', {
                url: "/main",
                views:{
                    "content":{templateUrl: "templates/pages/main/main.html"}
                }
            })
            .state('main.music', {
                url: "/music",
                views:{
                    "mainContent":{templateUrl: "templates/pages/main/mainMusic.html"}
                }
            })
            .state('settings', {
                url: "/settings",
                views:{
                    "content":{templateUrl: "templates/pages/settings/settings.html"}
                }
            })
            .state('settings.profile', {
                url: "/profile",
                views:{
                    "settingsContent":{templateUrl: "templates/pages/settings/settingsProfile.html"}
                }
            });
    })
    .run(function($rootScope, $window /*, $state, authService*/){
        // TODO: Authentication checkout
        /*$rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if(authService.isGuest()){
                    $state.go('login');
                    // prevent the transition from happening.
                    event.preventDefault();
                }
            });*/
        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams){
                console.log("STATE CHANGED from " + fromState.name + " to " + toState.name);
                var fromParentState = fromState.name.split(".")[0],
                    toParentState = toState.name.split(".")[0];

                if(fromParentState !== toParentState){
                    // it is a whole new page
                    $rootScope.$broadcast(IR.EVENT.OCCURRED.PAGE_CHANGED);
                }
            });

        window.addEventListener("resize", function(){
            $rootScope.$broadcast(IR.EVENT.OCCURRED.WINDOW_RESIZE, {vw: $window.outerWidth, vh: $window.outerHeight});
            console.log("resize");
        });
    });
