/**
 * Created by Dmitry Salnikov on 12/2/2015.
 */
DAR.MODULE.SECTION_TEAM.directive('darSectionTeam',
    ['$rootScope', '$window', 'darExtendService', 'darDeviceInfo', 'darPageScroller',
    function($rootScope, $window, darExtendService, darDeviceInfo, darPageScroller) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/team.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionTeamElementComponent() {
                // call of the parent constructor
                SectionTeamElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionTeam";
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
                    FONT_SIZE: "font-size"
                };

                this.CLASS = {
                    NORMAL: "normal"
                };

                this.CONFIG = {
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.8
                };

                this.STATE = {
                    NORMAL: "normal"
                };

                var currentState;

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
                };

                this._resize = function(vw, vh) {
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw) * 0.28 / 370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.28 - difference in fonts values for these extreme width
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();
                };

                /** *********************************************/

                this.onScrollToSectionEvent = function(ev, data) {
                    if (data.sectionName && data.sectionName === this.NAME) {
                        var sectionOffsetTop = wrapper[0].offsetTop,
                            additionalOffsetTop = data.offsetTop || 0,
                            targetValue = sectionOffsetTop - additionalOffsetTop;

                        darPageScroller.scrollTo(targetValue, data.sectionName);
                    }
                };
            }

            darExtendService.extend(SectionTeamElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.TEAM){
                DAR.UIC.SECTION.TEAM.destroy();
            }
            DAR.UIC.SECTION.TEAM = new SectionTeamElementComponent().build().render();

            return DAR.UIC.SECTION.TEAM;
        }
    };
}]);

