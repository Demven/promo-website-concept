/* global $, FontFaceObserver, Promise */

DAR.MODULE.UTIL.provider("darFontProvider", function(){
    "use strict";
    this.NAME = "FontProvider";

    function FontProvider() {
        var self = this,
            $body = $('body');

        var FIRST_FONT = {
                BEBAS_REGULAR: 'Bebas-Regular',
                COMPACT_REGULAR: 'Compact-Regular'
            },
            SECOND_FONT = {
                BEBAS_BOLD: 'Bebas-Bold',
                PT_SANS_REGULAR: 'PT-Sans-Regular'
            },
            THIRD_FONT = {
                ROBOTO_REGULAR: 'Roboto-Regular',
                ROBOTO_LIGHT: 'Roboto-Light',
                ROBOTO_BOLD: 'Roboto-Bold'
            },
            CLASS = {
                FIRST: {
                    BEBAS_REGULAR: 'font-bebas-regular',
                    COMPACT_REGULAR: 'font-compact-regular'
                },
                SECOND: {
                    BEBAS_BOLD: 'font-bebas-bold',
                    PT_SANS_REGULAR: 'font-pt-sans-regular'
                },
                THIRD: {
                    ROBOTO_REGULAR: 'font-roboto-regular',
                    ROBOTO_LIGHT: 'font-roboto-light',
                    ROBOTO_BOLD: 'font-roboto-bold'
                }
            };

        this.loadFonts = function() {
            if(window.sessionStorage && sessionStorage.darFirstFontsLoaded) {
                $body.addClass(CLASS.FIRST.BEBAS_REGULAR);
                $body.addClass(CLASS.FIRST.COMPACT_REGULAR);

                if(sessionStorage.darSecondFontsLoaded) {
                    $body.addClass(CLASS.SECOND.BEBAS_BOLD);
                    $body.addClass(CLASS.SECOND.PT_SANS_REGULAR);

                    if(sessionStorage.darThirdFontsLoaded) {
                        $body.addClass(CLASS.THIRD.ROBOTO_REGULAR);
                        $body.addClass(CLASS.THIRD.ROBOTO_LIGHT);
                        $body.addClass(CLASS.THIRD.ROBOTO_BOLD);
                    }
                }

                return;
            }


            self._loadFirstFonts()
                .then(function () {
                    if(window.sessionStorage) {
                        sessionStorage.darFirstFontsLoaded = true;
                    }

                    self._loadSecondFonts()
                        .then(function () {
                            if(window.sessionStorage) {
                                sessionStorage.darSecondFontsLoaded = true;
                            }

                            self._loadThirdFonts()
                                .then(function () {
                                    if(window.sessionStorage) {
                                        sessionStorage.darThirdFontsLoaded = true;
                                    }
                                });
                        });
                });
        };

        this._loadFirstFonts = function() {
            var bebasObserver = new FontFaceObserver(FIRST_FONT.BEBAS_REGULAR).check(),
                compactObserver = new FontFaceObserver(FIRST_FONT.COMPACT_REGULAR).check();

            bebasObserver.then(function () {
                $body.addClass(CLASS.FIRST.BEBAS_REGULAR);
            });

            compactObserver.then(function () {
                $body.addClass(CLASS.FIRST.COMPACT_REGULAR);
            });

            return Promise.all([bebasObserver, compactObserver]);
        };

        this._loadSecondFonts = function() {
            var bebasBoldObserver = new FontFaceObserver(SECOND_FONT.BEBAS_BOLD).check(),
                ptSansRegularObserver = new FontFaceObserver(SECOND_FONT.PT_SANS_REGULAR).check();

            bebasBoldObserver.then(function () {
                $body.addClass(CLASS.SECOND.BEBAS_BOLD);
            });

            ptSansRegularObserver.then(function () {
                $body.addClass(CLASS.SECOND.PT_SANS_REGULAR);
            });

            return Promise.all([bebasBoldObserver, ptSansRegularObserver]);
        };

        this._loadThirdFonts = function() {
            var robotoRegularObserver = new FontFaceObserver(THIRD_FONT.ROBOTO_REGULAR).check(),
                robotoLightObserver = new FontFaceObserver(THIRD_FONT.ROBOTO_LIGHT).check(),
                robotoBoldObserver = new FontFaceObserver(THIRD_FONT.ROBOTO_BOLD).check();

            robotoRegularObserver.then(function () {
                $body.addClass(CLASS.THIRD.ROBOTO_REGULAR);
            });

            robotoLightObserver.then(function () {
                $body.addClass(CLASS.THIRD.ROBOTO_LIGHT);
            });

            robotoBoldObserver.then(function () {
                $body.addClass(CLASS.THIRD.ROBOTO_BOLD);
            });

            return Promise.all([robotoRegularObserver, robotoLightObserver, robotoBoldObserver]);
        };
    }

    var fontProvider = new FontProvider();

    this.$get = function(){
        return fontProvider;
    }
});

