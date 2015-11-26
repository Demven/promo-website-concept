/**
 * Created by Dmitry_Salnikov on 11/26/2015.
 */
DAR.MODULE.FOOTER.directive('footer', function($rootScope, $timeout, darExtendService) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/footer.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function FooterElementComponent() {
                // call of the parent constructor
                FooterElementComponent.superclass.constructor.call(this);

                this.NAME = "Footer";
                this.isDestroyOnPageChange = false;
                this.isTriggerResize = false;

                this.SELECTOR = {
                    CURRENT_YEAR: ".current-year"
                };

                this.ELEMENT = {
                    CURRENT_YEAR: angular.element(wrapper[0].querySelector(this.SELECTOR.CURRENT_YEAR))
                };
            }

            darExtendService.extend(FooterElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.FOOTER){
                // no need to do a second header component
                DAR.UIC.FOOTER.destroy();
            }
            DAR.UIC.FOOTER = new FooterElementComponent().build().render();

            return DAR.UIC.FOOTER;
        }
    };
});

