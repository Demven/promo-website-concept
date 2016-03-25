/* global $, FontFaceObserver, Promise */

DAR.MODULE.UTIL.provider("darFontProvider", function(){
    "use strict";
    this.NAME = "FontProvider";

    function FontProvider() {
        var self = this,
            $body = $('body');

        var BASE_FONT = {
                BEBAS_REGULAR: 'Bebas-Regular',
                COMPACT_REGULAR: 'Compact-Regular',
                PT_SANS_REGULAR: 'PT-Sans-Regular'
            },
            SECOND_FONT = {
                ROBOTO_REGULAR: 'Roboto-Regular',
                BEBAS_BOLD: 'Bebas-Bold',
                ROBOTO_LIGHT: 'Roboto-Light',
                ROBOTO_BOLD: 'Roboto-Bold',
            },
            CLASS = {
                BASE: {
                    BEBAS_REGULAR: 'font-bebas-regular',
                    COMPACT_REGULAR: 'font-compact-regular',
                    PT_SANS_REGULAR: 'font-pt-sans-regular',
                },
                SECOND: {
                    ROBOTO_REGULAR: 'font-roboto-regular',
                    BEBAS_BOLD: 'font-bebas-bold',
                    ROBOTO_LIGHT: 'font-roboto-light',
                    ROBOTO_BOLD: 'font-roboto-bold',
                },
            };

        this.loadFonts = function(){
            if(window.sessionStorage && sessionStorage.darBaseFontsLoaded) {
                $body.addClass(CLASS.BASE.BEBAS_REGULAR);
                $body.addClass(CLASS.BASE.COMPACT_REGULAR);
                $body.addClass(CLASS.BASE.PT_SANS_REGULAR);

                if(sessionStorage.darSecondFontsLoaded) {
                    $body.addClass(CLASS.SECOND.ROBOTO_REGULAR);
                    $body.addClass(CLASS.SECOND.BEBAS_BOLD);
                    $body.addClass(CLASS.SECOND.ROBOTO_LIGHT);
                    $body.addClass(CLASS.SECOND.ROBOTO_BOLD);
                }

                return;
            }


            self._loadBaseFonts()
                .then(function () {
                    if(window.sessionStorage) {
                        sessionStorage.darBaseFontsLoaded = true;
                    }

                    self._loadSecondFonts()
                        .then(function () {
                            if(window.sessionStorage) {
                                sessionStorage.darSecondFontsLoaded = true;
                            }
                        });
                });
        };

        this._loadBaseFonts = function(){
            var bebasObserver = new FontFaceObserver(BASE_FONT.BEBAS_REGULAR).check(),
                compactObserver = new FontFaceObserver(BASE_FONT.COMPACT_REGULAR).check(),
                ptsansObserver = new FontFaceObserver(BASE_FONT.PT_SANS_REGULAR).check();

            bebasObserver.then(function () {
                $body.addClass(CLASS.BASE.BEBAS_REGULAR);
            });

            compactObserver.then(function () {
                $body.addClass(CLASS.BASE.COMPACT_REGULAR);
            });

            ptsansObserver.then(function () {
                $body.addClass(CLASS.BASE.PT_SANS_REGULAR);
            });

            return Promise.all([bebasObserver, compactObserver, ptsansObserver]);
        };

        this._loadSecondFonts = function(){
            var robotoRegularObserver = new FontFaceObserver(SECOND_FONT.ROBOTO_REGULAR).check(),
                bebasBoldObserver = new FontFaceObserver(SECOND_FONT.BEBAS_BOLD).check(),
                robotoLightObserver = new FontFaceObserver(SECOND_FONT.ROBOTO_LIGHT).check(),
                robotoBoldObserver = new FontFaceObserver(SECOND_FONT.ROBOTO_BOLD).check();

            robotoRegularObserver.then(function () {
                $body.addClass(CLASS.SECOND.ROBOTO_REGULAR);
            });

            bebasBoldObserver.then(function () {
                $body.addClass(CLASS.SECOND.BEBAS_BOLD);
            });

            robotoLightObserver.then(function () {
                $body.addClass(CLASS.SECOND.ROBOTO_LIGHT);
            });

            robotoBoldObserver.then(function () {
                $body.addClass(CLASS.SECOND.ROBOTO_BOLD);
            });

            return Promise.all([robotoRegularObserver, bebasBoldObserver, robotoLightObserver, robotoBoldObserver]);
        };
    }

    var fontProvider = new FontProvider();

    this.$get = function(){
        return fontProvider;
    }
});

