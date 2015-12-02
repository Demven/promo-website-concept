/**
 * Created by Dmitry Salnikov on 12/2/2015.
 */
DAR.MODULE.SECTION_TEAM.directive('darSectionTeam', function($rootScope, $window, $timeout, darExtendService, darDeviceInfo) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/team.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionTeamElementComponent() {
                // call of the parent constructor
                SectionTeamElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionTeam";
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
                    FONT_SIZE: "font-size"
                };

                this.CLASS = {
                    NORMAL: "normal"
                };

                /*this.SELECTOR = {
                    TILE_SMALL: ".tile.small"
                };

                this.ELEMENT = {
                    TILES_SMALL: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.TILE_SMALL))
                };*/

                this.STATE = {
                    NORMAL: "normal"
                };

                var currentState;

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
            }

            darExtendService.extend(SectionTeamElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.TEAM){
                DAR.UIC.SECTION.TEAM.destroy();
            }
            DAR.UIC.SECTION.TEAM = new SectionTeamElementComponent().build().render();

            return DAR.UIC.SECTION.TEAM;
        }
    };
});

