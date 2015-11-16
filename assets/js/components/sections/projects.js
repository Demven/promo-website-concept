/**
 * Created by Dmitry Salnikov on 11/12/2015.
 */
DAR.MODULE.SECTION_PROJECTS.directive('darSectionProjects', function($rootScope, $window, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/projects.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionProjectsElementComponent() {
                // call of the parent constructor
                SectionProjectsElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionProjects";
                this.VERSION = "0.2";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.EVENT = {
                    DRAG: "drag"
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
                    CLOSED: "closed",
                    OPEN: "open"
                };

                this.SELECTOR = {
                    TILE_SMALL: ".tile.small",
                    TILE_BIG: ".tile.big",
                    SLIDER: ".slider"
                };

                this.ELEMENT = {
                    TILES_SMALL: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_SMALL)),
                    TILES_BIG: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_BIG)),
                    SLIDER: angular.element(wrapper[0].querySelector(this.SELECTOR.SLIDER))
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                var currentState,
                    isFirstResize = true,
                    sliderMovePosition = 0,
                    sliderWidth = 0,
                    sliderLeft = 0,
                    maxSliderLeft = 0,
                    minSliderLeft = 0;

                this._postCreate = function(){
                    // local listeners
                    this.ELEMENT.SLIDER.on("touchstart mousedown", angular.bind(this, this.onSliderStartMove));
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
                    /*var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);*/

                    var tileStyle = this.ELEMENT.TILES_BIG[0].currentStyle || window.getComputedStyle(this.ELEMENT.TILES_BIG[0]),
                        tileMarginTotal = window.parseInt(tileStyle.marginLeft) * 2,
                        smallColumnQuantity = this.ELEMENT.TILES_SMALL.length / 2,
                        bigColumnQuantity = this.ELEMENT.TILES_BIG.length,
                        smallColumnWidth = this.ELEMENT.TILES_SMALL[0].offsetWidth + tileMarginTotal,
                        bigColumnWidth = this.ELEMENT.TILES_BIG[0].offsetWidth + tileMarginTotal;

                    sliderWidth = (smallColumnQuantity * smallColumnWidth) + (bigColumnQuantity * bigColumnWidth);
                    this.ELEMENT.SLIDER.css(this.ATTR.WIDTH, sliderWidth + this.VAL.PX);

                    if(isFirstResize){
                        // set offset to slider such way that the first BIG tile from left is placed along with section title
                        var bigTileOffsetLeft = this.ELEMENT.TILES_BIG[0].offsetLeft,
                            headerOffsetLeft = window.document.querySelector("header ul").offsetLeft,
                            delta = headerOffsetLeft - bigTileOffsetLeft;
                        this.ELEMENT.SLIDER.css(this.ATTR.TRANSFORM, "translateX(" + delta + this.VAL.PX + ")");
                        sliderLeft = delta;
                    }

                    maxSliderLeft = 0.2 * vw;
                    minSliderLeft = (-0.2 * vw) - (sliderWidth - vw);
                };

                this._destroy = function(){
                    // remove local listeners
                    Quo(this.ELEMENT.SLIDER[0]).off(this.EVENT.DRAG);
                };


                /************************ */

                this.onSliderStartMove = function(ev){
                    this.ELEMENT.SLIDER.on("touchmove mousemove", angular.bind(this, this.onSliderMove));
                    this.ELEMENT.SLIDER.on("touchend mouseup", angular.bind(this, this.onSliderEndMove));
                    console.log("START");
                    var clientX = ev.clientX || ev.touches[0].clientX;
                    sliderMovePosition = clientX;
                };

                this.onSliderEndMove = function(){
                    console.log("END");
                    this.ELEMENT.SLIDER.off("touchmove mousemove");
                    this.ELEMENT.SLIDER.off("touchend mouseup");
                    sliderMovePosition = 0;
                };

                this.onSliderMove = function(ev) {
                    var clientX = ev.clientX || ev.touches[0].clientX,
                        delta = clientX - sliderMovePosition,
                        calculatedSliderLeft = sliderLeft + delta;

                    console.log(delta);
                    console.log("sliderLeft " + calculatedSliderLeft);
                    console.log("sliderWidth " + sliderWidth);
                    console.log("maxValue " + maxSliderLeft);
                    console.log("minValue " + minSliderLeft);

                    if(calculatedSliderLeft < maxSliderLeft && calculatedSliderLeft > minSliderLeft){
                        sliderLeft = calculatedSliderLeft;
                        this.ELEMENT.SLIDER.css(this.ATTR.TRANSFORM, "translateX(" + sliderLeft + this.VAL.PX + ") translateZ(0)");

                        sliderMovePosition = clientX;
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
});

