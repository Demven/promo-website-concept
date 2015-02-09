// Declare app level module which depends on templates, and components
angular.module('inspirr', [
    'ui.router',
    'angular-gestures'
  /*,
  'inspirr.main',
  'inspirr.settings'*/
])
.config(function($stateProvider, $urlRouterProvider, hammerDefaultOptsProvider) {
    // router config
    $urlRouterProvider.otherwise("/main");
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

    // gestures config
    hammerDefaultOptsProvider.set({
        recognizers: [[Hammer.Tap, {time: 250}]]
    });

    /*
     Supported events:
     hmDoubleTap : 'doubletap',
     hmDragstart : 'dragstart',
     hmDrag : 'drag',
     hmDragUp : 'dragup',
     hmDragDown : 'dragdown',
     hmDragLeft : 'dragleft',
     hmDragRight : 'dragright',
     hmDragend : 'dragend',
     hmHold : 'hold',
     hmPinch : 'pinch',
     hmPinchIn : 'pinchin',
     hmPinchOut : 'pinchout',
     hmRelease : 'release',
     hmRotate : 'rotate',
     hmSwipe : 'swipe',
     hmSwipeUp : 'swipeup',
     hmSwipeDown : 'swipedown',
     hmSwipeLeft : 'swipeleft',
     hmSwipeRight : 'swiperight',
     hmTap : 'tap',
     hmTouch : 'touch',
     hmTransformstart : 'transformstart',
     hmTransform : 'transform',
     hmTransformend : 'transformend'
     */
});
