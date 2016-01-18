/* global Quo */

/**
 * Created by Dmitry Salnikov on 9/24/2015.
 */
DAR.MODULE.SECTION_MAIN.directive('darSectionMain', function($rootScope, $window, darExtendService, darDeviceInfo, darPageScroller) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/main.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionMainElementComponent() {
                // call of the parent constructor
                SectionMainElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionMain";
                this.VERSION = "1.0";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.ATTR = {
                    FONT_SIZE: "font-size",
                };

                this.VAL = {
                    REM: "rem",
                };

                this.EVENT = {
                    TAP: "touch",
                    SWIPE_TO_RIGHT: "swipeRight",
                    SWIPE_TO_LEFT: "swipeLeft"
                };

                this.SELECTOR = {
                    SLIDES_CONTAINER: ".slides",
                    PREV_BUTTON: ".prev",
                    NEXT_BUTTON: ".next"
                };

                this.ELEMENT = {
                    SLIDES_CONTAINER: angular.element(wrapper[0].querySelector(this.SELECTOR.SLIDES_CONTAINER)),
                    PREV_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.PREV_BUTTON)),
                    NEXT_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.NEXT_BUTTON))
                };

                this.CONFIG = {
                    SECTION_HEIGHT: 0.85,  // % from viewport (used only for certain cases)
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.6,
                    SLIDES_INTERVAL_MS: 7000
                };

                // global listeners
                var offScrollToSection = new Function(),
                    nextSlideClearIntervalId,
                    autoSlideshowStopped = false;

                this._postCreate = function(){
                    // global listeners
                    offScrollToSection = $rootScope.$on(DAR.EVENT.WISH.SCROLL_TO_SECTION, angular.bind(this, this.onScrollToSectionEvent));

                    // local listeners
                    // tap
                    Quo(this.ELEMENT.PREV_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.touchPrevSlide));
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.touchNextSlide));
                    // swipe
                    Quo(wrapper[0]).on(this.EVENT.SWIPE_TO_RIGHT, angular.bind(this, this.touchPrevSlide));
                    Quo(wrapper[0]).on(this.EVENT.SWIPE_TO_LEFT, angular.bind(this, this.touchNextSlide));

                    // auto-sliding
                    nextSlideClearIntervalId = window.setInterval(angular.bind(this, this._nextSlide), this.CONFIG.SLIDES_INTERVAL_MS);
                };

                this._render = function(){
                    this.ELEMENT.SLIDES_CONTAINER.slick({
                        arrows: false,
                        initialSlide: 1,
                        pauseOnHover: true,
                        draggable: false,
                        swipe: false,
                        touchMove: false
                    });
                };

                this._resize = function(vw, vh){
                    var fontSize,
                        wrapperHeight,
                        requiredSectionHeight;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // DESKTOP and TABLET

                        // apply max font-size
                        wrapper.css(this.ATTR.FONT_SIZE, this.CONFIG.MAX_FONT_SIZE + this.VAL.REM);

                        // then adjust by viewport height
                        wrapperHeight = wrapper[0].offsetHeight;
                        requiredSectionHeight = vh*this.CONFIG.SECTION_HEIGHT;
                        fontSize = Math.min(parseFloat((requiredSectionHeight/wrapperHeight).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);

                        // for portrait mode on tablets
                        if(fontSize === 1 && darDeviceInfo.isPortraitMode){
                            fontSize *=0.9;
                        }

                        // apply recalculated font-size
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        // MOBILE

                        if(darDeviceInfo.isPortraitMode){
                            fontSize = Math.min(parseFloat((vw / darDeviceInfo.MOBILE_WIDTH).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                            wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                        } else {
                            // landscape mode
                            wrapper.css(this.ATTR.FONT_SIZE, this.CONFIG.MAX_MOBILE_FONT_SIZE + this.VAL.REM);

                            // then adjust by viewport height
                            wrapperHeight = wrapper[0].offsetHeight;
                            requiredSectionHeight = vh*this.CONFIG.SECTION_HEIGHT;
                            fontSize = Math.min(parseFloat(((requiredSectionHeight*this.CONFIG.MAX_MOBILE_FONT_SIZE)/wrapperHeight).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);

                            // apply recalculated font-size
                            wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                        }
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();

                    // remove local listeners
                    Quo(this.ELEMENT.PREV_BUTTON[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.SLIDES_CONTAINER[0]).off(this.EVENT.SWIPE_TO_RIGHT);
                    Quo(this.ELEMENT.SLIDES_CONTAINER[0]).off(this.EVENT.SWIPE_TO_LEFT);

                    window.clearInterval(nextSlideClearIntervalId);

                    this.ELEMENT.SLIDES_CONTAINER.slick('unslick');
                };


                /************************ */

                this.touchPrevSlide = function(){
                    this.stopAutoSlideshow();
                    this._prevSlide();
                };

                this.touchNextSlide = function(){
                    this.stopAutoSlideshow();
                    this._nextSlide();
                };

                this._prevSlide = function(){
                    this.ELEMENT.SLIDES_CONTAINER.slick('slickPrev');
                };

                this._nextSlide = function(){
                    this.ELEMENT.SLIDES_CONTAINER.slick('slickNext');
                };

                this.stopAutoSlideshow = function() {
                    if (!autoSlideshowStopped) {
                        window.clearInterval(nextSlideClearIntervalId);
                        autoSlideshowStopped = true;
                    }
                };

                this.onScrollToSectionEvent = function(ev, data) {
                    if (data.sectionName && data.sectionName === this.NAME) {
                        var sectionOffsetTop = wrapper[0].offsetTop,
                            additionalOffsetTop = data.offsetTop || 0,
                            targetValue = sectionOffsetTop - additionalOffsetTop;

                        darPageScroller.scrollTo(targetValue, data.sectionName);
                    }
                };
            }

            darExtendService.extend(SectionMainElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.MAIN){
                DAR.UIC.SECTION.MAIN.destroy();
            }
            DAR.UIC.SECTION.MAIN = new SectionMainElementComponent().build().render();

            return DAR.UIC.SECTION.MAIN;
        }
    };
});

