/* global interact */
/**
 * Created by Dmitry Salnikov on 11/12/2015.
 */
DAR.MODULE.SECTION_PROJECTS.directive('darSectionProjects',
    ['$rootScope', '$window', '$timeout', 'darExtendService', 'darDeviceInfo', 'darPageScroller',
    function($rootScope, $window, $timeout, darExtendService, darDeviceInfo, darPageScroller) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/projects.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionProjectsElementComponent() {
                // call of the parent constructor
                SectionProjectsElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionProjects";
                this.VERSION = "1.0";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.EVENT = {
                    TAP: "touch",
                    DRAG_START: "dragstart",
                    DRAG_MOVE: "dragmove",
                    DRAG_END: "dragend"
                };

                this.VAL = {
                    REM: "rem",
                    PX: "px"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size",
                    WIDTH: "width",
                    TRANSFORM: "transform"
                };

                this.CLASS = {
                    NORMAL: "normal",
                    SLIDER_IN_MOVING: "in-moving",
                    ANIMATE: "animate"
                };

                this.SELECTOR = {
                    TILE_SMALL: ".tile.small",
                    TILE_BIG: ".tile.big",
                    SLIDER: ".slider",
                    PREV_BUTTON: ".prev",
                    NEXT_BUTTON: ".next"
                };

                this.ELEMENT = {
                    TILES_SMALL: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_SMALL)),
                    TILES_BIG: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_BIG)),
                    SLIDER: angular.element(wrapper[0].querySelector(this.SELECTOR.SLIDER)),
                    PREV_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.PREV_BUTTON)),
                    NEXT_BUTTON: angular.element(wrapper[0].querySelector(this.SELECTOR.NEXT_BUTTON))
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                this.CONFIG = {
                    SLIDER_ANIMATE_TIME: 400, // ms
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.5
                };

                var self = this,
                    currentState,
                    isFirstResize = true,
                    sliderWidth = 0,
                    smallColumnWidth = 0,
                    sliderLeft = 0,
                    maxSliderLeft = 0,
                    minSliderLeft = 0;

                var sliderInteractObject = null;

                var offScrollToSection = new Function();

                this._postCreate = function(){
                    // global listeners
                    offScrollToSection = $rootScope.$on(DAR.EVENT.WISH.SCROLL_TO_SECTION, angular.bind(this, this.onScrollToSectionEvent));

                    // local listeners

                    // drag events
                    // see http://interactjs.io/docs/
                    if (window.interact) {
                        sliderInteractObject = window.interact(this.ELEMENT.SLIDER[0])
                            .draggable({
                                axis: 'x'
                            })
                            .on(this.EVENT.DRAG_START, angular.bind(this, this.onSliderStartMove))
                            .on(this.EVENT.DRAG_MOVE, angular.bind(this, this.onSliderMove))
                            .on(this.EVENT.DRAG_END, angular.bind(this, this.onSliderEndMove));
                    }

                    // tap
                    Quo(this.ELEMENT.PREV_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.slideToLeft));
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).on(this.EVENT.TAP, angular.bind(this, this.slideToRight));
                };

                this._render = function(){
                    this.setState(this.STATE.NORMAL);
                };

                this._setState = function(state){
                    switch(state){
                    case this.STATE.NORMAL:
                        wrapper.addClass(this.CLASS.NORMAL);
                        currentState = this.STATE.NORMAL;
                        break;
                    }
                };

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw)*0.12/370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.12 - difference in fonts values for these extreme width
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);

                    var tileStyle = this.ELEMENT.TILES_BIG[0].currentStyle || window.getComputedStyle(this.ELEMENT.TILES_BIG[0]),
                        tileMarginTotal = window.parseInt(tileStyle.marginLeft) * 2,
                        smallColumnQuantity = darDeviceInfo.isMobileState ? this.ELEMENT.TILES_SMALL.length : this.ELEMENT.TILES_SMALL.length / 2,
                        bigColumnQuantity = this.ELEMENT.TILES_BIG.length,
                        bigTileWidth = this.ELEMENT.TILES_BIG[0].offsetWidth,
                        bigColumnWidth = bigTileWidth + tileMarginTotal;

                    smallColumnWidth = this.ELEMENT.TILES_SMALL[0].offsetWidth + tileMarginTotal;
                    sliderWidth = (smallColumnQuantity * smallColumnWidth) + (bigColumnQuantity * bigColumnWidth);
                    this.ELEMENT.SLIDER.css(this.ATTR.WIDTH, sliderWidth + this.VAL.PX);

                    if(isFirstResize){
                        // set offset to slider such way that the first BIG tile from left is placed along with section title
                        var bigTileOffsetLeft = this.ELEMENT.TILES_BIG[0].offsetLeft,
                            delta = 0;
                        if(darDeviceInfo.isMobileState){
                            delta = -bigTileOffsetLeft + ((vw - bigTileWidth) / 2);
                        } else {
                            var headerOffsetLeft = window.document.querySelector("header ul").offsetLeft;

                            delta = headerOffsetLeft - bigTileOffsetLeft;
                        }

                        this.ELEMENT.SLIDER.css(this.ATTR.TRANSFORM, "translateX(" + delta + this.VAL.PX + ")");
                        sliderLeft = delta;
                    }

                    maxSliderLeft = 0.2 * vw;
                    minSliderLeft = (-0.2 * vw) - (sliderWidth - vw);
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();

                    // remove local listeners
                    Quo(this.ELEMENT.PREV_BUTTON[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.NEXT_BUTTON[0]).off(this.EVENT.TAP);

                    sliderInteractObject.unset(); // remove all drag events
                };


                /************************ */

                this.onSliderStartMove = function(){
                    this.ELEMENT.SLIDER.addClass(this.CLASS.SLIDER_IN_MOVING);
                };

                this.onSliderMove = function(ev) {
                    var delta = ev.dx,
                        calculatedSliderLeft = sliderLeft + delta;

                    if(calculatedSliderLeft < maxSliderLeft && calculatedSliderLeft > minSliderLeft){
                        sliderLeft = calculatedSliderLeft;
                        this.ELEMENT.SLIDER.css(this.ATTR.TRANSFORM, "translateX(" + sliderLeft + this.VAL.PX + ") translateZ(0)");
                    }
                };

                this.onSliderEndMove = function(){
                    this.ELEMENT.SLIDER.removeClass(this.CLASS.SLIDER_IN_MOVING);
                };

                this.slideToLeft = function(){
                    this.moveSlideAnimated(smallColumnWidth);
                };

                this.slideToRight = function(){
                    this.moveSlideAnimated(-smallColumnWidth);
                };

                this.moveSlideAnimated = function(delta){
                    this.ELEMENT.SLIDER.addClass(this.CLASS.ANIMATE);

                    var calculatedSliderLeft = sliderLeft + delta;
                    if (calculatedSliderLeft > maxSliderLeft) {
                        calculatedSliderLeft = maxSliderLeft;
                    } else if (calculatedSliderLeft < minSliderLeft) {
                        calculatedSliderLeft = minSliderLeft;
                    }
                    sliderLeft = calculatedSliderLeft;
                    this.ELEMENT.SLIDER.css(this.ATTR.TRANSFORM, "translateX(" + sliderLeft + this.VAL.PX + ") translateZ(0)");

                    $timeout(function(){
                        self.ELEMENT.SLIDER.removeClass(self.CLASS.ANIMATE);
                    }, self.CONFIG.SLIDER_ANIMATE_TIME);
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

            darExtendService.extend(SectionProjectsElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.PROJECTS){
                DAR.UIC.SECTION.PROJECTS.destroy();
            }
            DAR.UIC.SECTION.PROJECTS = new SectionProjectsElementComponent().build().render();

            return DAR.UIC.SECTION.PROJECTS;
        }
    };
}]);

