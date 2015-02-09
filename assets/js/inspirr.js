"use strict";
var IR = {
    // global scope
};

IR.MODULE_NAME = {
    APP_NAME: "inspirr",
    HEADER: IR.MODULE_NAME.APP_NAME + ".header",
    CONTENT: IR.MODULE_NAME.APP_NAME + ".content",
    LEFT_DRAWER: IR.MODULE_NAME.APP_NAME + ".leftDrawer",
    RIGHT_DRAWER: IR.MODULE_NAME.APP_NAME + ".rightDrawer",
    UTIL: IR.MODULE_NAME.APP_NAME + ".util",
    // pages:
    MAIN_PAGE: IR.MODULE_NAME.CONTENT + ".mainPage",
    GALLERY_PAGE: IR.MODULE_NAME.CONTENT + ".galleryPage",
    PROFILE_PAGE: IR.MODULE_NAME.CONTENT + ".profilePage",
    SETTINGS_PAGE: IR.MODULE_NAME.CONTENT + ".settingsPage"
};

IR.MODULE = {
    HEADER: angular.module(IR.MODULE_NAME.HEADER, []),
    LEFT_DRAWER: angular.module(IR.MODULE_NAME.LEFT_DRAWER, []),
    RIGHT_DRAWER: angular.module(IR.MODULE_NAME.RIGHT_DRAWER, []),
    UTIL: angular.module(IR.MODULE_NAME.UTIL, []),
    // pages:
    MAIN_PAGE: angular.module(IR.MODULE_NAME.MAIN_PAGE, []),
    GALLERY_PAGE: angular.module(IR.MODULE_NAME.GALLERY_PAGE, []),
    PROFILE_PAGE: angular.module(IR.MODULE_NAME.PROFILE_PAGE, []),
    SETTINGS_PAGE: angular.module(IR.MODULE_NAME.SETTINGS_PAGE, []),
    // content module
    CONTENT: angular.module(IR.MODULE_NAME.CONTENT, [
        IR.MODULE_NAME.MAIN_PAGE,
        IR.MODULE_NAME.GALLERY_PAGE,
        IR.MODULE_NAME.PROFILE_PAGE,
        IR.MODULE_NAME.SETTINGS_PAGE
    ]),
    // main module
    INSPIRR: angular.module(IR.MODULE_NAME.APP_NAME, [
        'ui.router',
        'angular-gestures',
        IR.MODULE_NAME.HEADER,
        IR.MODULE_NAME.LEFT_DRAWER,
        IR.MODULE_NAME.RIGHT_DRAWER,
        IR.MODULE_NAME.CONTENT,
        IR.MODULE_NAME.UTIL
    ])
};

IR.MODULE.INSPIRR
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
