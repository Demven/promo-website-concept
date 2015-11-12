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
                this.VERSION = "0.1";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = false;

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
                    NORMAL: "normal"
                };

                var currentState;

                /*this._postCreate = function(){
                    // local listeners
                    // tap
                    Quo(this.ELEMENT.SHOW_MORE[0]).on(this.EVENT.TAP, angular.bind(this, this.showMore));
                    Quo(this.ELEMENT.HIDE_MORE[0]).on(this.EVENT.TAP, angular.bind(this, this.hideMore));
                };*/

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

/*                this._resize = function(vw, vh){
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), 1);
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                };*/

/*                this._destroy = function(){
                    // remove local listeners
                    Quo(this.ELEMENT.SHOW_MORE[0]).off(this.EVENT.TAP);
                    Quo(this.ELEMENT.HIDE_MORE[0]).off(this.EVENT.TAP);
                };*/


                /************************ */


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

