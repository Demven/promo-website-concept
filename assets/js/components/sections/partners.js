/**
 * Created by Dmitry Salnikov on 12/22/2015.
 */
DAR.MODULE.SECTION_TEAM.directive('darSectionPartners', function($rootScope, $window, darExtendService, darDeviceInfo, darPageScroller) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/partners.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionPartnersElementComponent() {
                // call of the parent constructor
                SectionPartnersElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionPartners";
                this.VERSION = "0.5";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = true;

                this.EVENT = {
                    TAP: "touch",
                    TOUCH_START: "touchstart"
                };

                this.VAL = {
                    REM: "rem"
                };

                this.ATTR = {
                    FONT_SIZE: "font-size"
                };

                this.CLASS = {
                    NORMAL: "normal",
                    PARTNER_LOGO_HOVER: "hover"
                };

                this.SELECTOR = {
                    PARTNER_LOGO: ".partner"
                };

                this.ELEMENT = {
                    PARTNER_LOGOS: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.PARTNER_LOGO))
                };

                this.CONFIG = {
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.8
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                var currentState,
                    self = this;

                var offScrollToSection = new Function();

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

                this._postCreate = function(){
                    // global listeners
                    offScrollToSection = $rootScope.$on(DAR.EVENT.WISH.SCROLL_TO_SECTION, angular.bind(this, this.onScrollToSectionEvent));

                    // local listeners
                    this.ELEMENT.PARTNER_LOGOS.on(this.EVENT.TOUCH_START, angular.bind(this, this.onTouchLogo));
                };

                this._resize = function(vw, vh) {
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw) * 0.35 / 370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.35 - difference in fonts values for these extreme width
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();

                    // remove local listeners
                    this.ELEMENT.PARTNER_LOGOS.off(this.EVENT.TOUCH_START);
                };

                /** *********************************************/

                this.onTouchLogo = function(ev) {
                    // remove hover-class from all logos
                    self.ELEMENT.PARTNER_LOGOS.removeClass(self.CLASS.PARTNER_LOGO_HOVER);

                    // add hover-class to touched logo
                    angular.element(ev.target).addClass(self.CLASS.PARTNER_LOGO_HOVER);
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

            darExtendService.extend(SectionPartnersElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.PARTNERS){
                DAR.UIC.SECTION.PARTNERS.destroy();
            }
            DAR.UIC.SECTION.PARTNERS = new SectionPartnersElementComponent().build().render();

            return DAR.UIC.SECTION.PARTNERS;
        }
    };
});

