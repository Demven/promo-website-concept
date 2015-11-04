/**
 * Created by Dmitry Salnikov on 11/4/2015.
 */
DAR.MODULE.SECTION_ABOUT.directive('darSectionAbout', function($rootScope, $window, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/about.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionAboutElementComponent() {
                // call of the parent constructor
                SectionAboutElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionAbout";
                this.VERSION = "0.1";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = false;

                this.EVENT = {
                    TAP: "touch"
                };

                this.VAL = {
                    NONE: "none",
                    BLOCK: "block"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size",
                    DISPLAY: "display"
                };

                this.CLASS = {
                    CLOSED: "closed",
                    OPEN: "open"
                };

                this.SELECTOR = {
                    MORE: ".more",
                    SHOW_MORE: ".show-more",
                    HIDE_MORE: ".hide-more"
                };

                this.ELEMENT = {
                    MORE: angular.element(wrapper[0].querySelector(this.SELECTOR.MORE)),
                    SHOW_MORE: angular.element(wrapper[0].querySelector(this.SELECTOR.SHOW_MORE)),
                    HIDE_MORE: angular.element(wrapper[0].querySelector(this.SELECTOR.HIDE_MORE))
                };

                this.STATE = {
                    CLOSED: "closed",
                    OPEN: "open"
                };

                var currentState;

                this._postCreate = function(){
                    // local listeners
                    // tap
                    Quo(this.ELEMENT.SHOW_MORE[0]).on(this.EVENT.TAP, angular.bind(this, this.showMore));
                    Quo(this.ELEMENT.HIDE_MORE[0]).on(this.EVENT.TAP, angular.bind(this, this.hideMore));
                };

                this._render = function(){
                    this.setState(this.STATE.CLOSED);
                };

                this._setState = function(state){
                    switch(state){
                        case this.STATE.CLOSED:
                            wrapper.addClass(this.CLASS.CLOSED);
                            wrapper.removeClass(this.CLASS.OPEN);
                            currentState = this.STATE.CLOSED;
                            break;
                        case this.STATE.OPEN:
                            wrapper.removeClass(this.CLASS.CLOSED);
                            wrapper.addClass(this.CLASS.OPEN);
                            currentState = this.STATE.OPEN;
                            break;
                    }
                };

                this._destroy = function(){
                    // remove local listeners
                    Quo(this.ELEMENT.SHOW_MORE[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.HIDE_MORE[0]).off(this.EVENT.TAP);
                };


                /************************ */

                this.showMore = function(){
                    if(currentState === this.STATE.CLOSED){
                        this.setState(this.STATE.OPEN);
                    }
                    //this.ELEMENT.MORE.css(this.ATTR.DISPLAY, this.VAL.BLOCK);
                    //this.ELEMENT.SHOW_MORE.css(this.ATTR.DISPLAY, this.VAL.NONE);
                    //this.ELEMENT.HIDE_MORE.css(this.ATTR.DISPLAY, this.VAL.BLOCK);
                };

                this.hideMore = function(){
                    if(currentState === this.STATE.OPEN){
                        this.setState(this.STATE.CLOSED);
                    }
                    //this.ELEMENT.MORE.css(this.ATTR.DISPLAY, this.VAL.NONE);
                    //this.ELEMENT.SHOW_MORE.css(this.ATTR.DISPLAY, this.VAL.NONE);
                    //this.ELEMENT.HIDE_MORE.css(this.ATTR.DISPLAY, this.VAL.BLOCK);
                };
            }

            darExtendService.extend(SectionAboutElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.ABOUT){
                DAR.UIC.SECTION.ABOUT.destroy();
            }
            DAR.UIC.SECTION.ABOUT = new SectionAboutElementComponent().build().render();

            return DAR.UIC.SECTION.ABOUT;
        }
    };
});

