/* global $, FontFaceObserver, Promise */

DAR.MODULE.UTIL.provider("darFontProvider", function(){
    "use strict";

    var darLogRef;

    function FontProvider() {
        this.NAME = "FontProvider";

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

        /**
         * Must be called on application run
         */
        this.loadBaseFonts = function() {
            if(window.sessionStorage && sessionStorage.darFirstFontsLoaded) {
                $body.addClass(CLASS.FIRST.BEBAS_REGULAR);
                $body.addClass(CLASS.FIRST.COMPACT_REGULAR);

                darLogRef.info(self.NAME + ":  applied first fonts from session [Bebas-Regular, Compact-Regular]");

                if(sessionStorage.darSecondFontsLoaded) {
                    $body.addClass(CLASS.SECOND.BEBAS_BOLD);
                    $body.addClass(CLASS.SECOND.PT_SANS_REGULAR);

                    darLogRef.info(self.NAME + ": applied second fonts from session [Bebas-Bold, PT-Sans-Regular]");

                    if(sessionStorage.darThirdFontsLoaded) {
                        $body.addClass(CLASS.THIRD.ROBOTO_REGULAR);
                        $body.addClass(CLASS.THIRD.ROBOTO_LIGHT);
                        $body.addClass(CLASS.THIRD.ROBOTO_BOLD);

                        darLogRef.info(self.NAME + ": applied third fonts from session [Roboto-Regular, Roboto-Light, Roboto-Bold]");
                    }
                }

                return;
            }

            self._loadFirstFonts()
                .then(function () {
                    if(window.sessionStorage) {
                        sessionStorage.darFirstFontsLoaded = true;
                    }

                    darLogRef.info(self.NAME + ": first fonts are loaded [Bebas-Regular, Compact-Regular]");
                });
        };

        /**
         * Must be called after render of the last component on the page
         * to ensure that the whole page is rendered
         */
        this.loadOtherFonts = function() {
            if(window.sessionStorage && sessionStorage.darSecondFontsLoaded) {
                $body.addClass(CLASS.SECOND.BEBAS_BOLD);
                $body.addClass(CLASS.SECOND.PT_SANS_REGULAR);

                darLogRef.info(self.NAME + ": applied second fonts from session [Bebas-Bold, PT-Sans-Regular]");

                if(sessionStorage.darThirdFontsLoaded) {
                    $body.addClass(CLASS.THIRD.ROBOTO_REGULAR);
                    $body.addClass(CLASS.THIRD.ROBOTO_LIGHT);
                    $body.addClass(CLASS.THIRD.ROBOTO_BOLD);

                    darLogRef.info(self.NAME + ": applied third fonts from session [Roboto-Regular, Roboto-Light, Roboto-Bold]");
                }

                return;
            }
            
            self._loadSecondFonts()
                .then(function () {
                    if(window.sessionStorage) {
                        sessionStorage.darSecondFontsLoaded = true;
                    }

                    darLogRef.info(self.NAME + ": second fonts are loaded [Bebas-Bold, PT-Sans-Regular]");

                    self._loadThirdFonts()
                        .then(function () {
                            if(window.sessionStorage) {
                                sessionStorage.darThirdFontsLoaded = true;
                            }

                            darLogRef.info(self.NAME + ": third fonts are loaded [Roboto-Regular, Roboto-Light, Roboto-Bold]");
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

    this.$get = ['darLog', function(darLog){

        darLogRef = darLog;

        return fontProvider;
    }];
});

