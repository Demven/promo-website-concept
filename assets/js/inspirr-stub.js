/** * Created by Dmitry Salnikov on 6/1/2015. */
var IR = IR || {};
IR.APP = (function InspirrStub(){
    function InspirrStub(){
        var viewport,
            self = this;

        var _onResize,
            _addEvents,
            _removeEvents;

        this.MOBILE_WIDTH = 690;
        this.TABLET_WIDTH = 995;
        this.TABLET_WIDE_WIDTH = 1024; // iPad, generic notebook
        this.DESKTOP_WIDTH = 1440;

        this.DESKTOP_WIDE_BASE_WIDTH = 1920;
        this.DESKTOP_BASE_WIDTH = 1280; // for 19' monitors

        this.DEVICE_STATE = {
            MOBILE: "mobile",
            TABLET: "tablet",
            TABLET_WIDE: "tabletWide",
            DESKTOP: "desktop",
            DESKTOP_WIDE: "desktopWide"
        };

        this.DEVICE_ORIENTATION = {
            LANDSCAPE: "landscape",
            PORTRAIT: "portrait"
        };

        this.currentDeviceState = this.DEVICE_STATE.DESKTOP;
        this.deviceOrientation = this.DEVICE_ORIENTATION.LANDSCAPE;

        this.start = function(){
            _addEvents();
            _onResize(); // trigger 'resize' to set initial state for all components
        };

        this.calculateViewport = function(){
            var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            viewport = {vw: vw, vh: vh};

            console.info("window resize to vw=" + vw + ", vh=" + vh);

            // update device state
            var newState;
            if(vw > this.DESKTOP_WIDTH){
                newState = this.DEVICE_STATE.DESKTOP_WIDE;
            } else if(vw > this.TABLET_WIDE_WIDTH){
                newState = this.DEVICE_STATE.DESKTOP;
            } else if(vw > this.TABLET_WIDTH){
                newState = this.DEVICE_STATE.TABLET_WIDE;
            } else if(vw > this.MOBILE_WIDTH){
                newState = this.DEVICE_STATE.TABLET;
            } else {
                newState = this.DEVICE_STATE.MOBILE;
            }

            if(newState !== this.currentDeviceState){
                this.currentDeviceState = newState;
                console.info("device state changed to " + newState);
            }

            if(vw > vh){
                this.deviceOrientation = this.DEVICE_ORIENTATION.LANDSCAPE;
            } else {
                this.deviceOrientation = this.DEVICE_ORIENTATION.PORTRAIT;
            }

            return viewport;
        };

        this.getViewport = function(){
            if(!viewport){
                this.calculateViewport();
            }
            return viewport;
        };

        this.destroy = function(){
            _removeEvents();
        };

        _onResize = function(){
            self.calculateViewport();
            if(IR.UIC.STAY_WITH_US){
                IR.UIC.STAY_WITH_US.resize(self.getViewport());
            }
        };

        _addEvents =  function(){
            window.addEventListener("resize", _onResize);
        };

        _removeEvents =  function(){
            window.removeEventListener("resize", _onResize);
        };
    }

    return new InspirrStub();
})();

// UI Components
IR.UIC = {};
IR.UIC.STAY_WITH_US = (function(){
    /**
     * Component, that manage page-stub called 'stay with us'
     * @constructor
     */
    var StayWithUs = function(){
        this.NAME = "Stay-With-Us-page";

        this.EL = {
            WRAPPER: $(document.getElementById("stay-with-us")),
            LOGO: $(document.getElementById("logo-group")),
            SKYLINE: $(document.getElementById("skyline")),
            MOUNTAIN_TALL: $(document.querySelector("#skyline .mountain.tall")),
            TERRAIN: $(document.getElementById("terrain")),
            FORM: $(document.getElementById("form")),
            FORM_BUTTON: $(document.querySelector("#form .button"))
        };

        this.ATTR = {
            FONT_SIZE: "font-size",
            MARGIN_TOP: "margin-top"
        };

        this.CLASS = {
            SKYLINE_RISE: "rise",
            FORM_SHOW: "show",
            EXTEND: "extend",
            SUBSCRIBE: "subscribe"
        };

        this.VAL = {
            EM: "em",
            REM: "rem",
            PX: "px"
        };

        var self = this,
            appeared = false,
            subscribed = false,
            scrolled = false,
            normalLogoFontSise = 1, // em
            scrolledLogoFontSise = 0.7, // em
            logoFontSizeCorrelation = normalLogoFontSise / scrolledLogoFontSise,

            normalTerrainHeight = 16, // %
            scrolledTerrainHeight = 45, // %
            terrainHeightsCorrelation = normalTerrainHeight / scrolledTerrainHeight;

        this.resize = (function() {
            var fontSize = 1;

            var CRITERION_WIDTH = IR.APP.DESKTOP_WIDE_BASE_WIDTH, // px
                MIN_FONT_SIZE_DESKTOP = 0.74, // fontSize for with == CRITERION_WIDTH
                DIFF_DESKTOP_WIDTH = CRITERION_WIDTH - IR.APP.TABLET_WIDE_WIDTH,
                DIFF_DESKTOP_FONT_SIZE = 1 - MIN_FONT_SIZE_DESKTOP;

            var CRITERION_MOBILE_WIDTH = 414, // px
                MIN_FONT_SIZE_MOBILE = 0.6, // fontSize for with == CRITERION_MOBILE_WIDTH
                DIFF_MOBILE_WIDTH = IR.APP.TABLET_WIDE_WIDTH - CRITERION_MOBILE_WIDTH,
                DIFF_MOBILE_FONT_SIZE = 1 - MIN_FONT_SIZE_MOBILE;

            var SKYLINE_MAX_CORRELATION = 0.35; // 35% of height

            return function(viewport){
                console.info(self.NAME + ": resize with w=" + viewport.vw + " h=" + viewport.vh);

                resizeRoot();
                resizeSkyline();
                self._resizeLogo(viewport);

                self._afterResize();

                function resizeRoot(){
                    if(IR.APP.deviceOrientation === IR.APP.DEVICE_ORIENTATION.LANDSCAPE){
                        // landscape
                        if(viewport.vw >= CRITERION_WIDTH){
                            // more than 1920
                            fontSize = (viewport.vw/CRITERION_WIDTH).toFixed(2);
                        } else if (viewport.vw >= IR.APP.TABLET_WIDE_WIDTH) {
                            // for desktop and wide tablets (e.g. iPad)
                            fontSize = interpolateFontSize(CRITERION_WIDTH, DIFF_DESKTOP_WIDTH, DIFF_DESKTOP_FONT_SIZE);
                        } else {
                            fontSize = (viewport.vw * MIN_FONT_SIZE_DESKTOP/IR.APP.TABLET_WIDE_WIDTH).toFixed(2);
                        }
                    } else {
                        // portrait
                        if (viewport.vw >= CRITERION_MOBILE_WIDTH) {
                            // for tablets and mobiles in portrait with width >= iPhone 6+
                            fontSize = interpolateFontSize(IR.APP.TABLET_WIDE_WIDTH, DIFF_MOBILE_WIDTH, DIFF_MOBILE_FONT_SIZE);
                        } else {
                            // for tablets and mobiles in portrait with width < iPhone 6+
                            fontSize = (viewport.vw * MIN_FONT_SIZE_MOBILE/CRITERION_MOBILE_WIDTH).toFixed(2);
                        }
                    }

                    console.log(fontSize);
                    if(fontSize){
                        self.EL.WRAPPER.css(self.ATTR.FONT_SIZE, fontSize + self.VAL.REM);
                    } else {
                        self.EL.WRAPPER.css(self.ATTR.FONT_SIZE, self.VAL.AUTO);
                    }
                }

                function resizeSkyline(){
                    var skylineHeight = self.EL.MOUNTAIN_TALL.height(),
                        currentCorrelation = skylineHeight/viewport.vh,
                        neededFontSize = (Math.min(SKYLINE_MAX_CORRELATION/currentCorrelation, 1)).toFixed(2);

                    self.EL.SKYLINE.css(self.ATTR.FONT_SIZE, neededFontSize + self.VAL.EM);
                }

                function interpolateFontSize(baseWidth, diffWidth, diffScale){
                    return (1 + (viewport.vw - baseWidth)*diffScale/diffWidth).toFixed(2);
                }
            };
        })();

        this._resizeLogo = function(viewport){
            var skylineHeight = self.EL.MOUNTAIN_TALL.height(),
                terrainHeight = self.EL.TERRAIN.height() * (scrolled ? terrainHeightsCorrelation : 1),
                availableSpace = viewport.vh - skylineHeight - terrainHeight,
                logoHeight = self.EL.LOGO.height() * (scrolled ? logoFontSizeCorrelation : 1),
                additionalMargin = logoHeight*0.15,
                marginTop = (availableSpace - (logoHeight - additionalMargin))/2 + additionalMargin;

            self.EL.LOGO.css(self.ATTR.MARGIN_TOP, marginTop.toFixed(2) + self.VAL.PX);
        };

        this._afterResize = function(){
            if(!appeared){
                this._appearSkyline();
                this._appearForm();
                this._appearLogo();

                appeared = true;

                this._attachEvents();
            }
        };

        this._appearSkyline = function(){
            this.EL.SKYLINE.addClass(this.CLASS.SKYLINE_RISE);
        };

        this._appearForm = function(){
            this.EL.FORM.addClass(this.CLASS.FORM_SHOW);
        };

        this._appearLogo = function(){
            this.EL.LOGO.addClass(this.CLASS.FORM_SHOW);
        };

        // Event handlers
        this._attachEvents = function(){
            this.EL.FORM_BUTTON.hammer = new Hammer(this.EL.FORM_BUTTON[0])
                .on("tap", self._onSubscribe);
            this.EL.WRAPPER.hammer = new Hammer(this.EL.WRAPPER[0])
                .on("panup", self._scrollDown)
                .on("pandown", self._scrollUp);

            $(window).bind('mousewheel', self._onMouseWheel);
        };

        this._dettachEvents = function(){
            this.EL.FORM_BUTTON.hammer.destroy();
            this.EL.WRAPPER.hammer.destroy();

            $(window).unbind('mousewheel', self._onMouseWheel);
        };

        this._scrollDown = function(){
            if(!scrolled){
                scrolled = true;
                self.EL.WRAPPER.addClass(self.CLASS.EXTEND);
            }
        };

        this._scrollUp = function(){
            if(scrolled){
                scrolled = false;
                self.EL.WRAPPER.removeClass(self.CLASS.EXTEND);
            }
        };

        this._onMouseWheel = function(ev){
            if(ev.originalEvent.wheelDelta /120 > 0) {
                self._scrollUp();
            }
            else{
                self._scrollDown();
            }
        };

        this._onSubscribe = function(){
            if(!subscribed){
                subscribed = true;

                if(!scrolled){
                    self._scrollDown();
                }

                self.EL.WRAPPER.addClass(self.CLASS.SUBSCRIBE);
                //self.EL.FORM_BUTTON.hide();
            }
        };
    };

    return new StayWithUs();
})();

// Start application
IR.APP.start();
