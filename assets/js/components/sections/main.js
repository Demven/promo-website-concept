/* global Hammer */

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
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

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
                    TAP: "tap"
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

                this._currentSlidesPosition = 0; // central slide
                this.slidesNumber = this.ELEMENT.SLIDES.length;

                // global listeners
                /*var offLeftDrawerOpen = new Function(),
                 offLeftDrawerClose = new Function(),
                 offRightDrawerOpen = new Function(),
                 offRightDrawerClose = new Function();*/

                this._postCreate = function(){
                    //offLeftDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN, angular.bind(this, this._onLeftDrawerOpen));
                    //offLeftDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE, angular.bind(this, this._onLeftDrawerClose));

                    //offRightDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_OPEN, angular.bind(this, this._onRightDrawerOpen));
                    //offRightDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_CLOSE, angular.bind(this, this._onRightDrawerClose));*/

                    // local listeners
                    this.ELEMENT.PREV_BUTTON.hammer = new Hammer(this.ELEMENT.PREV_BUTTON[0])
                        .on(this.EVENT.TAP, angular.bind(this, this.prevSlide));
                    this.ELEMENT.NEXT_BUTTON.hammer = new Hammer(this.ELEMENT.NEXT_BUTTON[0])
                        .on(this.EVENT.TAP, angular.bind(this, this.nextSlide));
                };

                /*this._render = function () {
                    this._cloneLastSlide();
                    this._cloneFirstSlide();
                };*/

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat(0.9*(vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                    } else {
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.MOBILE_WIDTH).toFixed(2)), 0.6);
                        wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                        //wrapper.css(this.ATTR.FONT_SIZE, this.VAL.AUTO)
                    }
                };

                this._destroy = function(){
                    // remove global listeners
                    //offLeftDrawerOpen();
                    //offLeftDrawerClose();

                    // remove local listeners
                    this.ELEMENT.PREV_BUTTON.hammer.destroy();
                    this.ELEMENT.NEXT_BUTTON.hammer.destroy();
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

