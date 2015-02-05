'use strict';

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
            url: "/",
            templateUrl: "templates/main.html"
        })
        .state('main.music', {
            url: "/music",
            templateUrl: "templates/main.music.html"
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "templates/settings.html"
        })
        .state('settings.profile', {
            url: "/profile",
            templateUrl: "templates/settings.profile.html"
        });
});
