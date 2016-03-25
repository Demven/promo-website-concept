DAR.MODULE.DAR
    .config(['$stateProvider', '$urlRouterProvider', 'darLogProvider', function($stateProvider, $urlRouterProvider, darLogProvider) {
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
    }])
    .run(['$rootScope', 'darLog', 'darDeviceInfo', 'darFontProvider',
        function($rootScope, darLog, darDeviceInfo, darFontProvider /*, $state, authService*/){

        // adjust all components to fit perfectly to the current viewport
        darDeviceInfo.resize();

        // load custom fonts
        darFontProvider.loadFonts();

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
    }]);
