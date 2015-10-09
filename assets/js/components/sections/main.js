/* global Quo */

/**
 * Created by Dmitry_Salnikov on 9/24/2015.
 */
DAR.MODULE.SECTION_MAIN.directive('darSectionMain', function($rootScope, $window, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/main.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionMainElementComponent() {
                // call of the parent constructor
                SectionMainElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionMain";
                this.VERSION = "0.4";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.CONFIG = {
                    SECTION_HEIGHT: 0.85,  // % from viewport (used only for certain cases)
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.6
                };

                this.ATTR = {
                    FONT_SIZE: "font-size",
                    TRANSFORM: "transform"
                };

                this.VAL = {
                    REM: "rem",
                    AUTO: "auto",
                    VW: "vw"
                };

                this.EVENT = {
                    TAP: "touch",
                    SWIPE_TO_RIGHT: "swipeRight",
                    SWIPE_TO_LEFT: "swipeLeft"
                };

                this.CLASS = {
                    CLONED_FIRST: "cloned-first",
                    CLONED_LAST: "cloned-last"
                };

                this.SELECTOR = {
                    SLIDES_CONTAINER: ".slides",
                    SLIDES: ".slide",
                    PREV_BUTTON: ".prev",
                    NEXT_BUTTON: ".next"
                };

                this.ELEMENT = {
                    SLIDES_CONTAINER: angular.element(wrapper[0].querySelector(this.SELECTOR.SLIDES_CONTAINER)),
                    SLIDES: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.SLIDES)),
                    PREV_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.PREV_BUTTON)),
                    NEXT_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.NEXT_BUTTON))
                };

                this.slidesNumber = this.ELEMENT.SLIDES.length;

                // global listeners
                /*var offLeftDrawerOpen = new Function();*/

                this._postCreate = function(){
                    // global listeners
                    //offLeftDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN, angular.bind(this, this._onLeftDrawerOpen));*/

                    // local listeners
                    // tap
                    Quo(this.ELEMENT.PREV_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.prevSlide));
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.nextSlide));
                    // swipe
                    Quo(wrapper[0]).on(this.EVENT.SWIPE_TO_RIGHT, angular.bind(this, this.prevSlide));
                    Quo(wrapper[0]).on(this.EVENT.SWIPE_TO_LEFT, angular.bind(this, this.nextSlide));
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
                    //offLeftDrawerOpen();

                    // remove local listeners
                    Quo(this.ELEMENT.PREV_BUTTON[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.SLIDES_CONTAINER[0]).off(this.EVENT.SWIPE_TO_RIGHT);
                    Quo(this.ELEMENT.SLIDES_CONTAINER[0]).off(this.EVENT.SWIPE_TO_LEFT);
                };

                this.prevSlide = function(){
                    var slide,
                        translateX;
                    for(var i = 0, len = this.slidesNumber; i < len; i++){
                        slide = this.ELEMENT.SLIDES.eq(i);
                        translateX = this._getTranslateX(slide);
                        this._setTranslateX(slide, translateX + 100);
                    }

                    this._moveLastSlideToFirstPosition();
                };

                this.nextSlide = function(){
                    var slide,
                        translateX;
                    for(var i = 0, len = this.slidesNumber; i < len; i++){
                        slide = this.ELEMENT.SLIDES.eq(i);
                        translateX = this._getTranslateX(slide);
                        this._setTranslateX(slide, translateX - 100);
                    }

                    this._moveFirstSlideToLastPosition();
                };

                this._moveFirstSlideToLastPosition = function(){
                    var first = this.ELEMENT.SLIDES.eq(0),
                        lastTranslateX = this._getTranslateX(this.ELEMENT.SLIDES.eq(this.slidesNumber - 1));

                    this._setTranslateX(first, lastTranslateX + 100);

                    this.ELEMENT.SLIDES_CONTAINER.append(first);

                    // update list of slides
                    this.ELEMENT.SLIDES = angular.element(wrapper[0].querySelectorAll(this.SELECTOR.SLIDES));
                };

                this._moveLastSlideToFirstPosition = function(){
                    var last = this.ELEMENT.SLIDES.eq(this.slidesNumber - 1),
                        firstTranslateX = this._getTranslateX(this.ELEMENT.SLIDES.eq(0));

                    this._setTranslateX(last, firstTranslateX - 100);

                    this.ELEMENT.SLIDES_CONTAINER.prepend(last);

                    // update list of slides
                    this.ELEMENT.SLIDES = angular.element(wrapper[0].querySelectorAll(this.SELECTOR.SLIDES));
                };

                this._setTranslateX = function($el, numberValue){
                    return $el.css(this.ATTR.TRANSFORM, "translateX(" + numberValue + "vw)");
                };

                this._getTranslateX = function($el){
                    return Number($el.css(this.ATTR.TRANSFORM).split("(")[1].slice(0, -3));
                };
            }

            darExtendService.extend(SectionMainElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.MAIN){
                // no need to do a second header component
                DAR.UIC.SECTION.MAIN.destroy();
            }
            DAR.UIC.SECTION.MAIN = new SectionMainElementComponent().build().render();

            return DAR.UIC.SECTION.MAIN;
        }
    };
});

