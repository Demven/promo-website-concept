"use strict";
/**
 * Module, that contains useful services
 * Created by Dzmitry_Salnikau on 2/9/2015.
 */

/**
 * Factory, that provides base objects for services and components
 * Also have method to extend objects
 * @service
 * @return Object{extend, BaseJsonService, BaseListJsonService, BaseElementComponent}
 */
IR.MODULE.UTIL.factory("irExtendService", function($rootScope, $window, $q, irLog, irDeviceInfo){
    return (function(){
        /**
         * Function that provides extending parent's object
         * @function
         * @param Child - child object (which inherits Parent)
         * @param Parent - parent object (which the Child extends)
         * @return function
         */
        var extend = (function() {
            var F = function() {};
            return function(Child, Parent) {
                F.prototype = Parent.prototype;
                Child.prototype = new F();
                Child.prototype.constructor = Child;
                Child.superclass = Parent.prototype;
            };
        }());

        /**
         * Used as abstract service for creating angular services that works with JSON data objects
         * You should at least override 'DATA_URL' before use.
         * If you want to use prepared JSON - override 'dataJSON' with your JSON object, set 'isUsingFakeData' to 'true' and
         * do not override 'DATA_URL'
         * @constructor
         */
        var BaseJsonService = function(){
            this.NAME = "";
            /** (String) should be overridden to the proper URL in the descendant object */
            this.DATA_URL = null;
            /** (ms) default timeout
             * if 0 - no tracking
             */
            this.TIMEOUT_TO_UPDATE = 0;
            this.FAKE_DATA_DELAY = 500; // ms

            /** (Object JSON) should be overridden only if you set 'isUsingFakeData' to 'true'*/
            this.dataJSON = null;

            /** Flag indicates whether to destroy this service on the changing of a page
             *  Default value is true, but you can set it false to allow service working in the background
             *  while user can go around the app
             */
            this.isDestroyOnPageChange = true;
            /** Indicates that you don't have a working url for loading data, but you want to provide a fake data
             *  If so - override this flag to true and initialize a variable with the name "dataJSON" by your fake data
             */
            this.isUsingFakeData = false;

            /**
             * Contains configuration parameters for data requests
             * @type Object
             */
            this.CONFIG = {};

            /** json that will be returned by server */
            var data = null,
                /** will contain a reference to a concrete descendant object */
                self = this;

            /** Array of listener-functions that will be called in series when new settings are updated */
            var listenersOnUpdate = [],
                /** Integer id, that will be received from the setInterval() function and need for stop it working */
                trackingId;

            var isCreated = false,
                isTracking = false,
                isNewListener = false;

            // global listeners
            var offListenerPageChanged;

            /**
             * Starting method for service working
             * Asynchronously load data by the url DATA_URL
             * If service is already working - triggers update of the data
             * Contains logic of the service's lifecycle
             */
            this.load = function(callback){
                if(!isCreated || !isTracking){
                    this.create();
                    this.postCreate();
                    this.update()
                            .then(function(success){
                                if(typeof callback === "function"){
                                    callback(success);
                                }
                            });
                } else{
                    if(data && isNewListener){
                        // we have a new client, so do not update, but simply call it's callback
                        _informLastListenerAboutUpdate();
                    } else{
                        this.update();
                    }
                }
                return this;
            };

            /**
             * Method that starts service
             */
            this.create = function(){
                irLog.info(this.NAME + ": create");

                this.startTracking();
                this._create();

                isCreated = true;
                return this;
            };

            /**
             * For override
             * @return {BaseJsonService}
             */
            this._create = function(){
                return this;
            };

            /**
             * Used to add global listeners
             * @private
             */
            this.postCreate = function(){
                irLog.info(this.NAME + ": postCreate");
                if(this.isDestroyOnPageChange) {
                    // destroy service if page has just changed
                    offListenerPageChanged = $rootScope.$on(IR.EVENT.OCCURRED.PAGE_CHANGED, function () {
                        self.destroy();
                    });
                }
                this._postCreate();
                return this;
            };

            /**
             * For override
             * @return {BaseJsonService}
             */
            this._postCreate = function(){
                return this;
            };

            /**
             * Load data from backend using AJAX request to DATA_URL or use dataJSON if you set isUsingFakeData to true
             * @return promise
             */
            this.loadData = function(){
                irLog.info(this.NAME + ": load");
                var deferred = $q.defer(),
                    newData;
                if(isTracking || !data){
                    // load data at first time or update them if we are tracking data changes
                    if(this.isUsingFakeData && this.dataJSON) {
                        window.setTimeout(angular.bind(this, (function(){
                            newData = angular.copy(this.dataJSON);
                            deferred.resolve(newData);
                        })), this.FAKE_DATA_DELAY);
                    } else {
                        // TODO: need send request to server
                    }
                }
                return deferred.promise;
            };

            this.afterLoad = function(promise){
                promise
                    .then(angular.bind(this, function(newData) {
                        irLog.info(this.NAME + ": load SUCCESS");
                        if(isTracking && _isDataChanged(newData)){
                            data = newData;
                            _informListenersAboutUpdate();
                        } else{
                            data = newData;
                        }
                    }), angular.bind(this, function(failure) {
                        irLog.warn(this.NAME + ": load FAILED - " + failure);
                    }));
                return promise;
            };

            /**
             * Called before update()
             * For override
             * @return {BaseJsonService}
             */
            this._beforeUpdate = function(){
                return this;
            };

            /**
             * Asynchronously updates data by AJAX request to DATA_URL or use dataJSON if you set isUsingFakeData to true
             * Then calls method 'informListenersAboutUpdate()' if updating was successful.
             * @return promise
             */
            this.update = function(){
                $rootScope.$broadcast(IR.EVENT.OCCURRED.LOAD_DATA_START);
                irLog.info(this.NAME + ": beforeUpdate");
                this._beforeUpdate();

                irLog.info(this.NAME + ": update");

                var promise = this.loadData();

                this.afterLoad(promise);

                promise
                    .then(angular.bind(this, function(newData) {
                        irLog.info(this.NAME + ": update SUCCESS");
                        irLog.info(this.NAME + ": afterUpdate");
                        this._afterUpdate();
                    }), angular.bind(this, function(failure) {
                        irLog.warn(this.NAME + ": update FAILED - " + failure);
                    }))
                    .finally(function(){
                        $rootScope.$broadcast(IR.EVENT.OCCURRED.LOAD_DATA_FINISHED);
                    });

                return promise;
            };

            /**
             * Called after successful update()
             * For override
             * @return {BaseJsonService}
             */
            this._afterUpdate = function(){
                return this;
            };

            /**
             * Should be called after loading data.
             * Tries to trigger update data at a specified timeout.
             */
            this.startTracking = function(){
                irLog.info(this.NAME + ": startTracking");
                if(this.TIMEOUT_TO_UPDATE > 0){
                    isTracking = true;
                    trackingId = setInterval(function(){
                        self.update();
                    }, this.TIMEOUT_TO_UPDATE);
                }
            };

            this.stopTracking = function(){
                irLog.info(this.NAME + ": stopTracking");
                if(isTracking){
                    isTracking = false;
                    clearInterval(trackingId);
                }
            };

            this.isTracking = function(){
                return isTracking;
            };

            /**
             * Set the current cache of data
             */
            this.set = function(newData){
                irLog.info(this.NAME + ": set cache");

                data = newData;
            };

            /**
             * Returns data object
             */
            this.get = function(){
                return angular.copy(data);
            };

            this.addListenerOnUpdate = function(listener){
                listenersOnUpdate.push(listener);
                isNewListener = true;
            };

            this.save = function(newData){
                irLog.info(this.NAME + ": save");
                if(this.isUsingFakeData && this.dataJSON) {
                    this.dataJSON = newData;
                } else {
                    // TODO: send request to backend to save this new data
                }

                this.update();
            };

            this.destroy = function(){
                irLog.info(this.NAME + ": destroy");
                data = null;
                isCreated = false;
                trackingId = 0;
                listenersOnUpdate = [];

                this.stopTracking();

                // remove global listeners
                if(offListenerPageChanged) {
                    offListenerPageChanged();
                }

                this._destroy();

                irLog.info(this.NAME + ": DESTROYED");
            };

            /**
             * For override
             * @return {BaseJsonService}
             */
            this._destroy = function(){
                return this;
            };

            /** Iterate through over array of listeners and call each to inform about update */
            var _informListenersAboutUpdate = function(){
                for(var i = listenersOnUpdate.length; i--; ){
                    listenersOnUpdate[i](); // execute each listener
                }
            };

            /** Call only the last callback to inform about update */
            var _informLastListenerAboutUpdate = function(){
                listenersOnUpdate[listenersOnUpdate.length - 1]();
                isNewListener = false;
            };

            /** Check whether newData is differ from the previous json object */
            var _isDataChanged = function(newData){
                var oldStr = JSON.stringify(data);
                var newStr = JSON.stringify(newData);

                return oldStr !== newStr;
            };
        };

        /**
         * Used as abstract service for creating angular services that works with lists of JSON data objects
         * (contains some methods for convenience working with lists and collections)
         * If you want to use prepared JSON - override 'dataJSON' with your JSON object, set 'isUsingFakeData' to 'true' and
         * do not override 'DATA_URL'
         * @constructor
         */
        var BaseListJsonService = function(){
            // call of the parent constructor
            BaseListJsonService.superclass.constructor.call(this);

            /**
             * Declares how many list items will be loaded at each request
             * @type {number}
             */
            this.CONFIG.PORTION_SIZE = 10;

            var lastLoadFrom = 0,
                lastLoadTo = 0;

            /**
             * ! Overrides method from BaseJsonService
             * Load data from backend using AJAX request to DATA_URL or use dataJSON if you set isUsingFakeData to true
             * @return promise
             */
            this.loadData = function(portion){
                irLog.info(this.NAME + ": load");
                var deferred = $q.defer(),
                    newData,
                    portionNumber = portion || 1,
                    portionSize = this.CONFIG.PORTION_SIZE,
                    from = (portionNumber - 1) * portionSize,
                    to = from + portionSize; // not included last
                if(this.isTracking || !this.get()){
                    // load data at first time or update them if we are tracking data changes
                    if(this.isUsingFakeData && this.dataJSON) {
                        window.setTimeout(angular.bind(this, (function(){
                            newData = angular.copy(this.dataJSON.slice(from, to));
                            lastLoadFrom = from;
                            lastLoadTo = to;
                            deferred.resolve(newData);
                        })), this.FAKE_DATA_DELAY);
                    } else {
                        // TODO: need send request to server
                    }
                }

                return deferred.promise;
            };

            /**
             * ! Overrides method from BaseJsonService
             * @return promise
             */
            this.afterLoad = function(promise){
                promise
                    .then(angular.bind(this, function(newData) {
                        irLog.info(this.NAME + ": load SUCCESS");

                        if(newData){
                            // add this portion to the existing data cache
                            var data = this.get() || [],
                                len = newData.length,
                                d = lastLoadFrom,
                                n = 0;

                            for( ; n < len; n++, d++){
                                data[d] = newData[n];
                            }

                            // update cache
                            this.set(data);
                        }

                    }), angular.bind(this, function(failure) {
                        irLog.warn(this.NAME + ": load FAILED - " + failure);
                    }));
                return promise;
            };

            this.getById = function(id){
                var data = this.get(),
                    i = data.length;
                for( ; i--; ){
                    if(data[i].id == id){
                        return data[i];
                    }
                }
            };

            this.getIndexById = function(id){
                var data = this.get(),
                    i = data.length;
                for( ; i--; ){
                    if(data[i].id == id){
                        return i;
                    }
                }
            };

            /**
             * Returns array-portion of the list objects
             * @param portionNumber - number of the portion from 1
             * @param callback - function that will be called when portion will be loaded
             */
            this.getPortion = function(portionNumber, callback){
                var portion = [],
                    portionSize = this.CONFIG.PORTION_SIZE,
                    quantity = portionSize * portionNumber,
                    data = this.get(),
                    availQuantity = data.length,
                    from = (portionNumber - 1) * portionSize,
                    to = from + portionSize; // not included last;
                if(availQuantity >= quantity) {
                    portion = data.slice(from, to);
                    if(typeof callback === "function"){
                        callback(portion);
                    }
                } else{
                    // not enough data in cache to return a portion
                    // load needed data
                    var promise = this.loadData(portionNumber);
                    this.afterLoad(promise);
                    promise.then(function(newData) {
                        portion = newData;
                        if(typeof callback === "function"){
                            callback(portion);
                        }
                    });
                }

                return portion;
            };

            this.add = function(item){
                irLog.info(this.NAME + ": add");
                if(this.isUsingFakeData && this.dataJSON) {
                    this.dataJSON.push(item);
                } else {
                    // TODO: send request to backend to save this new list item
                }

                this.update();
            };

            this.change = function(item){
                irLog.info(this.NAME + ": change");
                if(this.isUsingFakeData && this.dataJSON) {
                    var index = this.getIndexById(item.id);
                    this.dataJSON[index] = item;
                } else {
                    // TODO: send request to backend to change this list item
                }

                this.update();
            };

            /**
             * Send request to server to remove this data list item
             * @param itemId - id of the item to remove
             */
            this.remove = function(itemId){
                irLog.info(this.NAME + ": delete with id = " + itemId);
                if(this.isUsingFakeData && this.dataJSON) {
                    var index = this.getIndexById(itemId);
                    if(index >=0){
                        this.dataJSON.splice(index, 1);
                    }
                } else {
                    // TODO: send request to backend to remove this list item
                }

                this.update();
            };
        };

        // BaseListJsonService is a extension of the BaseJsonService
        extend(BaseListJsonService, BaseJsonService);

        // Components
        /**
         * Used as abstract component for creating angular directives that replace elements
         * @constructor
         */
        var BaseElementComponent = function() {
            /**
             * Init this with the name of component for right logging
             * @type {string}
             */
            this.NAME = "";

            /**
             * Override this by a special prmise object and set flag this.isDefferedBuild to true
             * Build method will continue work only when this promise is resolved
             * @type {Promise}
             */
            this.defferedBuildPromise = null;

            /** Flag indicates whether to destroy this component on the changing of a page
             *  Default value is true, but you can set it false to allow component working in the background
             *  while user can go around the app
             */
            this.isDestroyOnPageChange = true;
            /** Flag indicates whether to resize this component on the changing of viewport dimensions
             *  Default value is false, but you can set it true to allow component resize itself
             */
            this.isTriggerResize = false;
            /**
             * Flag that indicates whether is lifecycle's build method should be postponed by a specified promise
             * @see this.defferedBuildPromise
             * @type {boolean}
             */
            this.isDefferedBuild = false;

            /** Object with css classes, that are used by this component */
            this.CLASS = {};
            /** Object with css attributes, that are used by this component */
            this.ATTR = {};
            /** Object with string values and their parts */
            this.VAL = {};
            /** Object containing angular elements, that are used by this component */
            this.ELEMENT = {};
            /** Object containing data from services*/
            this.DATA = {};
            /** Object containing strings for i10n */
            this.TEXT = {};

            /** will contain a reference to a concrete descendant object */
            var self = this;

            // boolean
            var isBuilt = false,
                isCreated = false,
                isRendered = false;

            // global listeners
            var offListenerPageChanged,
                offListenerWindowResize;

            /** Builds the directive
             * Should be called before render() method
             * @return {BaseElementComponent}
             */
            this.build = function (buildCallback) {
                if(this.isDefferedBuild && this.defferedBuildPromise){
                    this.init();
                    this.defferedBuildPromise.then(angular.bind(this, function(result){
                        if(result){
                            this.create(result)
                                .postCreate();

                            isBuilt = true;

                            if(typeof buildCallback === "function"){
                                buildCallback();
                            }
                        }
                    }));
                } else{
                    this.init()
                        .create()
                        .postCreate();

                    isBuilt = true;

                    if(typeof buildCallback === "function"){
                        buildCallback();
                    }
                }

                return this;
            };

            /**
             * Init services and component variables
             * @return {BaseElementComponent}
             */
            this.init = function () {
                irLog.info(this.NAME + ": init");
                this._init();
                return this;
            };

            /**
             * For override
             * @return {BaseElementComponent}
             */
            this._init = function () {
                return this;
            };

            /**
             * Create all dom elements if there is no template provided
             * @return {BaseElementComponent}
             */
            this.create = function (buildResult) {
                irLog.info(this.NAME + ": create");
                this._create(buildResult);
                isCreated = true;
                return this;
            };

            /**
             * For override
             * @return {BaseElementComponent}
             */
            this._create = function (buildResult) {
                return this;
            };

            /**
             * Fired after create method
             * @return {BaseElementComponent}
             */
            this.postCreate = function () {
                irLog.info(this.NAME + ": postCreate");

                if(this.isDestroyOnPageChange){
                    // destroy component if page has just changed
                    offListenerPageChanged = $rootScope.$on(IR.EVENT.OCCURRED.PAGE_CHANGED, function () {
                        self.destroy();
                    });
                }

                if(this.isTriggerResize){
                    offListenerWindowResize = $rootScope.$on(IR.EVENT.OCCURRED.WINDOW_RESIZE, function (ev, data) {
                        self.resize(data.vw, data.vh);
                    });
                }

                this._postCreate();

                return this;
            };

            /**
             * For override
             * @return {BaseElementComponent}
             */
            this._postCreate = function () {
                return this;
            };

            /** Render the component using created DOM-elements
             * @param data - data to render
             * @param animateShow - flag that indicates whether we need to animate appearance of the clement
             * @throw Error - if component is not built before render
             * @return {BaseElementComponent}
             */
            this.render = function (data,animateShow) {
                if(!isRendered){
                    // only for the first call
                    irLog.info(this.NAME + ": render");
                    if(isBuilt){
                        this._render(data, animateShow);

                        if(this.isTriggerResize){
                            var viewport = irDeviceInfo.getViewport();
                            this.resize(viewport.vw, viewport.vh);
                        }

                        isRendered = true;
                    } else{
                        var errorMsg = "UI component " + this.NAME + " should be built before render! Use 'build() method.'";
                        irLog.error(errorMsg);
                        throw new Error(errorMsg);
                    }
                } else{
                    // for subsequent calls
                    this._render(data, animateShow);
                }

                return this;
            };

            /**
             * For override
             * @param data - data to render
             * @param animateShow - flag that indicates whether we need to animate appearance of the clement
             * @return {BaseElementComponent}
             * @private
             */
            this._render = function (data, animateShow) {
                return this;
            };

            /** Resize the component */
            this.resize = function (vw, vh) {
                irLog.info(this.NAME + ": resize");

                this._resize(vw, vh);
            };

            /** For override
             *  Please remove all listeners and clear all data
             */
            this._resize = function (vw, vh) {
                return this;
            };

            /** Destroys the component */
            this.destroy = function () {
                irLog.info(this.NAME + ": destroy");
                // remove global listeners
                if(offListenerPageChanged) {
                    offListenerPageChanged();
                }
                if(offListenerWindowResize) {
                    offListenerWindowResize();
                }

                this._destroy();

                irLog.info(this.NAME + ": DESTROYED");
            };

            /** For override
             *  Please remove all listeners and clear all data
             */
            this._destroy = function () {
                return this;
            };
        };

        /**
         * Used as abstract page parent for all real pages
         * @author Dmitry Salnikov
         * @since 14.04.2015
         * @constructor
         */
        var BasePage = function() {
            // call of the parent constructor
            BasePage.superclass.constructor.call(this);

            var wrapper;

            var STATE = {
                NORMAL: "normal",
                SLIDE_RIGHT: "slide_right",
                SLIDE_LEFT: "slide_left"
            };

            var CLASS = {
                SLIDE_RIGHT: "slide-right",
                SLIDE_LEFT: "slide-left"
            };

            // global listeners
            var offLeftDrawerOpen = new Function(),
                offLeftDrawerClose = new Function(),
                offRightDrawerOpen = new Function(),
                offRightDrawerClose = new Function();

            var currentState = STATE.NORMAL;

            this._init = function(){
                wrapper = angular.element(document.querySelector("div.page-content"));
            };

            this._postCreate = function(){
                offLeftDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_OPEN, _onLeftDrawerOpen);
                offLeftDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.LEFT_DRAWER_CLOSE, _onLeftDrawerClose);

                offRightDrawerOpen = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_OPEN, _onRightDrawerOpen);
                offRightDrawerClose = $rootScope.$on(IR.EVENT.OCCURRED.RIGHT_DRAWER_CLOSE, _onRightDrawerClose);
            };

            this._destroy = function(){
                // remove global listeners
                offLeftDrawerOpen();
                offLeftDrawerClose();
                offRightDrawerOpen();
                offRightDrawerClose();
            };

            var _onLeftDrawerOpen = function(){
                _onRightDrawerClose();

                wrapper.addClass(CLASS.SLIDE_RIGHT);
                currentState = STATE.SLIDE_RIGHT;
            };

            var _onLeftDrawerClose = function(){
                if(currentState === STATE.SLIDE_RIGHT){
                    wrapper.removeClass(CLASS.SLIDE_RIGHT);
                }
            };

            var _onRightDrawerOpen = function(){
                _onLeftDrawerClose();

                wrapper.addClass(CLASS.SLIDE_LEFT);
                currentState = STATE.SLIDE_LEFT;
            };

            var _onRightDrawerClose = function(){
                if(currentState === STATE.SLIDE_LEFT){
                    wrapper.removeClass(CLASS.SLIDE_LEFT);
                }
            };
        };

        // BasePage is a extension of the BaseElementComponent
        extend(BasePage, BaseElementComponent);

        return {
            extend: extend,
            BaseJsonService: BaseJsonService,
            BaseListJsonService: BaseListJsonService,
            BaseElementComponent: BaseElementComponent,
            BasePage: BasePage
        };
    })();
});

/**
 * Service, that provides all available data about user device
 * Also knows about device dimensions
 * @service
 */
IR.MODULE.UTIL.provider("irDeviceInfo", function(){
    this.MOBILE_WIDTH = 690;
    this.TABLET_WIDTH = 995;
    this.TABLET_WIDE_WIDTH = 1024; // iPad, generic notebook
    this.DESKTOP_WIDTH = 1440;

    this.DESKTOP_BASE_WIDTH = 1280; // for 19' monitors

    this.DEVICE_STATE = {
        MOBILE: "mobile",
        TABLET: "tablet",
        TABLET_WIDE: "tabletWide",
        DESKTOP: "desktop",
        DESKTOP_WIDE: "desktopWide"
    };

    this.currentDeviceState = this.DEVICE_STATE.DESKTOP; // default state TODO: change states

    var NAME = "DeviceInfo";

    // The code below is taken from https://github.com/benbscholz/detect
    var browser,
        version,
        mobile,
        os,
        osversion,
        bit,
        ua = window.navigator.userAgent,
        platform = window.navigator.platform,
        viewport;

    var irLogRef; // reference to a irLog service

    if ( /MSIE/.test(ua) ) {
        browser = 'Internet Explorer';
        if ( /IEMobile/.test(ua) ) {
            mobile = 1;
        }
        version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];
    } else if ( /Chrome/.test(ua) ) {
        // Platform override for Chromebooks
        if ( /CrOS/.test(ua) ) {
            platform = 'CrOS';
        }
        browser = 'Chrome';
        version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
    } else if ( /Opera/.test(ua) ) {
        browser = 'Opera';
        if ( /mini/.test(ua) || /Mobile/.test(ua) ) {
            mobile = 1;
        }
    } else if ( /Android/.test(ua) ) {
        browser = 'Android Webkit Browser';
        mobile = 1;
        os = /Android\s[\.\d]+/.exec(ua)[0];
    } else if ( /Firefox/.test(ua) ) {
        browser = 'Firefox';
        if ( /Fennec/.test(ua) ) {
            mobile = 1;
        }
        version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
    } else if ( /Safari/.test(ua) ) {
        browser = 'Safari';
        if ( (/iPhone/.test(ua)) || (/iPad/.test(ua)) || (/iPod/.test(ua)) ) {
            os = 'iOS';
            mobile = 1;
        }
    }

    if ( !version ) {
        version = /Version\/[\.\d]+/.exec(ua);
        if (version) {
            version = version[0].split('/')[1];
        } else {
            version = /Opera\/[\.\d]+/.exec(ua)[0].split('/')[1];
        }
    }

    if ( platform === 'MacIntel' || platform === 'MacPPC' ) {
        os = 'Mac OS X';
        osversion = /10[\.\_\d]+/.exec(ua)[0];
        if ( /[\_]/.test(osversion) ) {
            osversion = osversion.split('_').join('.');
        }
    } else if ( platform === 'CrOS' ) {
        os = 'ChromeOS';
    } else if ( platform === 'Win32' || platform == 'Win64' ) {
        os = 'Windows';
        bit = platform.replace(/[^0-9]+/,'');
    } else if ( !os && /Android/.test(ua) ) {
        os = 'Android';
    } else if ( !os && /Linux/.test(platform) ) {
        os = 'Linux';
    } else if ( !os && /Windows/.test(ua) ) {
        os = 'Windows';
    }

    /**
     * Recalculates size of the viewport and set a proper device state
     * @warn You must fire this method on each resize of window manually
     */
    this.resize = function(){
        var vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        viewport = {vw: vw, vh: vh};

        irLogRef.info(NAME + ": window resize to vw=" + vw + ", vh=" + vh);

        // update device state
        var newState;
        if(vw > this.DESKTOP_WIDTH){
            newState = this.DEVICE_STATE.DESKTOP_WIDE;
        } else if(vw > this.TABLET_WIDE_WIDTH){
            newState = this.DEVICE_STATE.DESKTOP;
        } else if(vw > this.TABLET_WIDTH){
            newState = this.DEVICE_STATE.TABLET_WIDE;
        } else if(vw > this.MOBILE_WIDTH){
            newState = this.DEVICE_STATE.TABLET;
        } else {
            newState = this.DEVICE_STATE.MOBILE;
        }

        if(newState !== this.currentDeviceState){
            this.currentDeviceState = newState;
            irLogRef.info(NAME + ": device state changed to " + newState);
        }
    };

    /**
     * Returs object with width and height of the viewport
     * @return {vw, vh}
     */
    this.getViewport = function(){
        if(!viewport){
            this.resize();
        }
        return viewport;
    };

    this.$get = function(irLog){
        irLogRef = irLog;

        return {
            MOBILE_WIDTH: this.MOBILE_WIDTH,
            TABLET_WIDTH: this.TABLET_WIDTH,
            TABLET_WIDE_WIDTH: this.TABLET_WIDE_WIDTH,
            DESKTOP_WIDTH: this.DESKTOP_WIDTH,
            DESKTOP_BASE_WIDTH: this.DESKTOP_BASE_WIDTH,

            DEVICE_STATE: this.DEVICE_STATE,
            currentDeviceState: this.currentDeviceState,

            resize: this.resize,
            getViewport: this.getViewport,

            browser : browser,
            version : version,
            mobile : mobile,
            os : os,
            osVersion : osversion,
            bit: bit
        }
    }
});

/**
 * Service, that provides handy logging
 * You can set default log level in the angular's config method
 * @service
 */
IR.MODULE.UTIL.provider("irLog", function(){
    "use strict";
    this.LOG_LEVEL = {
        ALL: "ALL",
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR",
        FATAL: "FATAL",
        OFF: "OFF"
    };

    var LEVEL_PRIORITY = {
        ALL: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4,
        OFF: 5
    };

    var WRITE_WAY = ["log", "info", "warn", "error", "error"];

    var colon = ": ",
        currentLogLevel = this.LOG_LEVEL.ALL; // default level

    /**
     * Set log level
     * @param logLevel - one value from the this.LOG_LEVEL
     */
    this.setLogLevel = function(logLevel){
        currentLogLevel = logLevel;
    };

    /**
     * Write log message without any level
     * @param msg - String
     */
    this.write = function(msg){
        if(LEVEL_PRIORITY[currentLogLevel] !== LEVEL_PRIORITY.OFF){
            window.console.log(msg);
        }
    };

    /**
     * Write log message using passing log level
     * @param logLevel - one value from the this.LOG_LEVEL
     * @param msg - String
     */
    this.writeAs = function(logLevel, msg){
        var requestedPriority = LEVEL_PRIORITY[logLevel];
        if(LEVEL_PRIORITY[currentLogLevel] <= requestedPriority){
            window.console[WRITE_WAY[requestedPriority]](logLevel + colon + msg);
        }
    };

    this.all = function(msg){
        this.writeAs(this.LOG_LEVEL.ALL, msg);
    };

    this.info = function(msg){
        this.writeAs(this.LOG_LEVEL.INFO, msg);
    };

    this.warn = function(msg){
        this.writeAs(this.LOG_LEVEL.WARN, msg);
    };

    this.error = function(msg){
        this.writeAs(this.LOG_LEVEL.ERROR, msg);
    };

    this.fatal = function(msg){
        this.writeAs(this.LOG_LEVEL.FATAL, msg);
    };

    this.$get = function(){
        return {
            LOG_LEVEL: this.LOG_LEVEL,
            setLogLevel: this.setLogLevel,
            writeAs: this.writeAs,
            write: this.write,
            all: this.all,
            info: this.info,
            warn: this.warn,
            fatal: this.fatal
        };
    }
});

/**
 * Service, that provides useful methods for DOM elements (analog of jQuery)
 * @service
 */
IR.MODULE.UTIL.service("irElement", function Element(){

    /**
     * Returns top and left offset of element
     * @param el - DOM element
     * @return {{top: number, left: number}}
     */
    this.getOffset = function(el){
        var de = document.documentElement,
            box = el.getBoundingClientRect();
        return {
            top: box.top + window.pageYOffset - de.clientTop,
            left: box.left + window.pageXOffset - de.clientLeft
        };
    };

});
