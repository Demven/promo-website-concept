"use strict";
var DAR = {
    // global scope
};

/**
 * Namespace for UI Component (UIC) instances
 */
DAR.UIC = new (function(){
    this.HEADER = null;
    this.SECTIONS = null;
    // sections
    this.SECTION = {
        MAIN: null,
        ABOUT: null,
        PROJECTS: null,
        PARTNERS: null,
        TEAM: null,
        CONTACTS: null
    };
    this.FOOTER = null;
})();

/**
 * Namespace for Service (SRV) instances
 */
DAR.SRV = new (function(){
    this.ART = null;
})();

DAR.MODULE_NAME = new (function(){
    this.APP_NAME = "dar";
    this.HEADER = this.APP_NAME + ".header";
    this.SECTION = this.APP_NAME + ".section";
    this.FOOTER = this.APP_NAME + ".footer";
    this.UTIL = this.APP_NAME + ".util";
    // sections:
    this.SECTION_MAIN = this.SECTIONS + ".main";
    this.SECTION_ABOUT = this.SECTIONS + ".about";
    this.SECTION_PROJECTS = this.SECTIONS + ".projects";
    this.SECTION_PARTNERS = this.SECTIONS + ".partners";
    this.SECTION_TEAM = this.SECTIONS + ".team";
    this.SECTION_CONTACTS = this.SECTIONS + ".contacts";
})();

DAR.MODULE = new (function(){
    this.HEADER = angular.module(DAR.MODULE_NAME.HEADER, []);
    this.UTIL = angular.module(DAR.MODULE_NAME.UTIL, []);
    // sections:
    this.SECTION_MAIN = angular.module(DAR.MODULE_NAME.SECTION_MAIN, []);
    this.SECTION_ABOUT = angular.module(DAR.MODULE_NAME.SECTION_ABOUT, []);
    this.SECTION_PROJECTS = angular.module(DAR.MODULE_NAME.SECTION_PROJECTS, []);
    this.SECTION_PARTNERS = angular.module(DAR.MODULE_NAME.SECTION_PARTNERS, []);
    this.SECTION_TEAM = angular.module(DAR.MODULE_NAME.SECTION_TEAM, []);
    this.SECTION_CONTACTS = angular.module(DAR.MODULE_NAME.SECTION_CONTACTS, []);
    // sections container
    this.SECTION = angular.module(DAR.MODULE_NAME.SECTION, [
        DAR.MODULE_NAME.SECTION_MAIN,
        DAR.MODULE_NAME.SECTION_ABOUT,
        DAR.MODULE_NAME.SECTION_PROJECTS,
        DAR.MODULE_NAME.SECTION_PARTNERS,
        DAR.MODULE_NAME.SECTION_TEAM,
        DAR.MODULE_NAME.SECTION_CONTACTS
    ]);
    this.FOOTER = angular.module(DAR.MODULE_NAME.FOOTER, []);
    // main module
    this.DAR = angular.module(DAR.MODULE_NAME.APP_NAME, [
        'ui.router',
        DAR.MODULE_NAME.HEADER,
        DAR.MODULE_NAME.SECTION,
        DAR.MODULE_NAME.FOOTER,
        DAR.MODULE_NAME.UTIL
    ]);
})();

DAR.EVENT = {
    WISH: {
        SCROLL_TO_SECTION: "WISH_SCROLL_TO_SECTION" // data = {sectionName, offsetTop}
    },
    OCCURRED: {
        WINDOW_RESIZE: "OCCURRED_WINDOW_RESIZE", // data = {vw, vh}
        SECTION_CHANGED: "OCCURRED_SECTION_CHANGED",
        PAGE_CHANGED: "OCCURRED_PAGE_CHANGED",
        LOAD_DATA_START: "OCCURRED_LOAD_DATA_START",
        LOAD_DATA_FINISHED: "OCCURRED_LOAD_DATA_FINISHED"
    }
};

DAR.MODULE.DAR
    .config(function($stateProvider, $urlRouterProvider, darLogProvider) {
        // router config
        $urlRouterProvider.otherwise("/main");
        $stateProvider
            .state('main', {
                url: "/main",
                views:{
                    "content":{templateUrl: "templates/pages/main/main.html"}
                }
            });
            /*.state('main.music', {
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
            });*/

        // log config
        darLogProvider.setLogLevel(darLogProvider.LOG_LEVEL.ALL);
    })
    .run(function($rootScope, darLog, darDeviceInfo /*, $state, authService*/){

        darDeviceInfo.resize();

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
                darLog.writeAs(darLog.LOG_LEVEL.INFO, "STATE CHANGED from " + fromState.name + " to " + toState.name);
                var fromParentState = fromState.name.split(".")[0],
                    toParentState = toState.name.split(".")[0];

                if(fromParentState !== toParentState){
                    // it is a whole new page
                    $rootScope.$broadcast(DAR.EVENT.OCCURRED.PAGE_CHANGED);
                }
            });

        window.addEventListener("resize", function(){
            darDeviceInfo.resize();
            $rootScope.$broadcast(DAR.EVENT.OCCURRED.WINDOW_RESIZE, darDeviceInfo.getViewport());
        });
    });
