// Declare app level module which depends on templates, and components
angular.module('inspirr', [
  'ui.router'/*,
  'inspirr.main',
  'inspirr.settings'*/
])
.config(function($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to main state
    $urlRouterProvider.otherwise("/main");

    // Now set up the states
    $stateProvider
        .state('main', {
            url: "/main",
            views:{
                "content":{templateUrl: "templates/main.html"}
            }
        })
        .state('main.music', {
            url: "/music",
            views:{
                "mainContent":{templateUrl: "templates/mainMusic.html"}
            }
        })
        .state('settings', {
            url: "/settings",
            views:{
                "content":{templateUrl: "templates/settings.html"}
            }
        })
        .state('settings.profile', {
            url: "/profile",
            views:{
                "settingsContent":{templateUrl: "templates/settingsProfile.html"}
            }
        });
});
