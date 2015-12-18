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
                this.VERSION = "1.0";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.EVENT = {
                    TAP: "touch"
                };

                this.VAL = {
                    REM: "rem"
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

                var offScrollToSection = new Function();

                this._postCreate = function(){
                    // global listeners
                    offScrollToSection = $rootScope.$on(DAR.EVENT.WISH.SCROLL_TO_SECTION, angular.bind(this, this.onScrollToSectionEvent));

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

                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();

                    // remove local listeners
                    Quo(this.ELEMENT.SHOW_MORE[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.HIDE_MORE[0]).off(this.EVENT.TAP);
                };


                /************************ */

                this.showMore = function(){
                    if(currentState === this.STATE.CLOSED){
                        this.setState(this.STATE.OPEN);
                    }
                };

                this.hideMore = function(){
                    if(currentState === this.STATE.OPEN){
                        this.setState(this.STATE.CLOSED);
                    }
                };

                this.onScrollToSectionEvent = function(ev, data) {
                    if (data.sectionName && data.sectionName === this.NAME) {
                        var sectionOffsetTop = wrapper[0].offsetTop,
                            additionalOffsetTop = data.offsetTop || 0,
                            scrollY = sectionOffsetTop - additionalOffsetTop;
                        $window.scrollTo(0, scrollY);

                        console.warn(data.sectionName);
                    }
                }
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

