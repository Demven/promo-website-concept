/* global ymaps */
/**
 * Created by Dmitry Salnikov on 12/2/2015.
 */
DAR.MODULE.SECTION_CONTACTS.directive('darSectionContacts', 
    ['$rootScope', '$window', 'darExtendService', 'darDeviceInfo', 'darPageScroller',
    function($rootScope, $window, darExtendService, darDeviceInfo, darPageScroller) {
    return {
        restrict: 'E',
        templateUrl: 'templates/components/sections/contacts.html',
        link: function(scope, wrapper, iAttrs, controller, transcludeFn) {

            function SectionContactsElementComponent() {
                // call of the parent constructor
                SectionContactsElementComponent.superclass.constructor.call(this);

                this.NAME = "SectionContacts";
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
                    NORMAL: "normal",
                    SHOW_MAP: "show-map"
                };

                this.SELECTOR = {
                    ADDRESS_CONTAINER: ".address-container"
                };

                this.ELEMENT = {
                    ADDRESS_CONTAINER: angular.element(wrapper[0].querySelectorAll(this.SELECTOR.ADDRESS_CONTAINER))
                };

                this.STATE = {
                    NORMAL: "normal",
                    SHOW_MAP: "show-map"
                };

                this.CONFIG = {
                    MAX_FONT_SIZE: 1,
                    MAX_MOBILE_FONT_SIZE: 0.8
                };

                var currentState,
                    isMapRendered = false;

                var MAP_ELEMENT_ID = 'map';

                var offScrollToSection = new Function();

                this._render = function(){
                    this.setState(this.STATE.NORMAL);
                };

                this._setState = function(state){
                    switch(state){
                    case this.STATE.NORMAL:
                        wrapper.removeClass(this.CLASS.SHOW_MAP);
                        wrapper.addClass(this.CLASS.NORMAL);
                        currentState = this.STATE.NORMAL;
                        break;
                    case this.STATE.SHOW_MAP:
                        wrapper.removeClass(this.CLASS.NORMAL);
                        wrapper.addClass(this.CLASS.SHOW_MAP);
                        currentState = this.STATE.SHOW_MAP;
                        break;
                    }
                };

                this._postCreate = function(){
                    // global listeners
                    offScrollToSection = $rootScope.$on(DAR.EVENT.WISH.SCROLL_TO_SECTION, angular.bind(this, this.onScrollToSectionEvent));

                    // local listeners
                    // tap
                    Quo(this.ELEMENT.ADDRESS_CONTAINER[0]).on(this.EVENT.TAP, angular.bind(this, this.toggleMap));
                };

                this._resize = function(vw, vh) {
                    var fontSize;
                    if (vw > darDeviceInfo.MOBILE_WIDTH) {
                        // for desktop and tablet
                        fontSize = Math.min(parseFloat((vw / darDeviceInfo.DESKTOP_BASE_WIDTH).toFixed(2)), this.CONFIG.MAX_FONT_SIZE);
                    } else {
                        // mobile
                        fontSize = Math.min(parseFloat((this.CONFIG.MAX_MOBILE_FONT_SIZE - (darDeviceInfo.MOBILE_WIDTH - vw) * 0.335 / 370).toFixed(2)), this.CONFIG.MAX_MOBILE_FONT_SIZE);
                        // ^ here are some magic numbers: 370 - the difference between 690px and 320px (minimum mobile width)
                        // 0.335 - difference in fonts values for these extreme width
                    }
                    wrapper.css(this.ATTR.FONT_SIZE, fontSize + this.VAL.REM);
                };

                this._destroy = function(){
                    // remove global listeners
                    offScrollToSection();

                    // remove local listeners
                    Quo(this.ELEMENT.ADDRESS_CONTAINER[0]).off(this.EVENT.TAP);
                };

                /************************ */

                this.toggleMap = function(){
                    switch(currentState){
                        case this.STATE.NORMAL:
                        // show map
                        if (!isMapRendered && ymaps) {
                            this.initMap();
                        }
                        this.setState(this.STATE.SHOW_MAP);
                        break;
                    case this.STATE.SHOW_MAP:
                        // hide map
                        this.setState(this.STATE.NORMAL);
                        break;
                    }
                };

                this.initMap = function(){
                    ymaps.ready(function(){
                        var myMap = new ymaps.Map(MAP_ELEMENT_ID, {
                            center: [55.747565, 37.583461],
                            zoom: 16
                        });

                        var myPlacemark = new ymaps.Placemark([55.747565, 37.583461], {
                            hintContent: 'ДАР Девелопмент',
                            balloonContent: 'ООО ДАР Девелопмент <br> Москва <br><b>Усачева, 24</b>'
                        }, {
                            preset: 'islands#redIcon'
                        });

                        //myMap.setType('yandex#hybrid');

                        myMap.geoObjects.add(myPlacemark);

                        myMap.controls.remove('searchControl');
                        myMap.controls.remove('trafficControl');

                        if (darDeviceInfo.isMobileState) {
                            myMap.controls.remove('rulerControl');
                            myMap.controls.remove('typeSelector');
                            myMap.controls.remove('geolocationControl');
                            myMap.controls.add('geolocationControl', {
                                float: "right"
                            });
                            myMap.controls.remove('zoomControl');
                            myMap.controls.add('zoomControl', {
                                float: "right",
                                position: {
                                    top: 100,
                                    right: 10
                                }
                            });
                        }
                    });

                    isMapRendered = true;
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

            darExtendService.extend(SectionContactsElementComponent, darExtendService.BaseElementComponent);

            if(DAR.UIC.SECTION.CONTACTS){
                DAR.UIC.SECTION.CONTACTS.destroy();
            }
            DAR.UIC.SECTION.CONTACTS = new SectionContactsElementComponent().build().render();

            return DAR.UIC.SECTION.CONTACTS;
        }
    };
}]);

