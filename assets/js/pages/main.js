/**
 * MainPage
 * @extends BasePage
 * @author Dmitry Salnikov
 * @since 4/14/2015
 */
IR.MODULE.MAIN_PAGE.directive('irMainPage', function($rootScope, $window, irExtendService) {
    return {
        restrict: 'E',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function MainPage() {
                // call of the parent constructor
                MainPage.superclass.constructor.call(this);

                this.NAME = "MainPage";
                this.isDestroyOnPageChange = true;
                this.isTriggerResize = false;
            }

            irExtendService.extend(MainPage, irExtendService.BasePage);

            if(IR.UIC.PAGE.MAIN){
                // no need to do a second header component
                IR.UIC.PAGE.MAIN.destroy();
            }
            IR.UIC.PAGE.MAIN = new MainPage().build().render();

            return IR.UIC.PAGE.MAIN;
        }
    };
});

