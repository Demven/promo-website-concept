"use strict";
/**
 * Module, that contains useful services
 * Created by Dzmitry_Salnikau on 2/9/2015.
 */

/**
 * Factory, that provides base objects for services and components
 * Also returns method to extend objects
 * @service
 * @return Object{extend, BaseJsonService, BaseListJsonService}
 */
IR.MODULE.UTIL.factory("extendService", function(){
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
         * You should at least override 'DATA_URL' and 'ROOTSCOPE' before use.
         * If you want to use prepared JSON - override 'dataJSON' with your JSON object, set 'isUsingFakeData' to 'true' and
         * do not override 'DATA_URL'
         * @constructor
         */
        var BaseJsonService = function(){
            /** (String) should be overridden to the proper URL in the descendant object */
            this.DATA_URL = null;
            this.ROOTSCOPE = null;
            /** (ms) default timeout */
            this.TIMEOUT_TO_UPDATE = 60000;

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
            this.load = function(){
                if(!isCreated || !isTracking){
                    this.create();
                    this.postCreate();
                    this.update();
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
                this.startTracking();

                isCreated = true;
            };

            /**
             * Used to add global listeners
             * @private
             */
            this.postCreate = function(){
                if(this.ROOTSCOPE && this.isDestroyOnPageChange) {
                    // destroy service if page has just changed
                    offListenerPageChanged = this.ROOTSCOPE.$on(IR.EVENT.OCCURRED.PAGE_CHANGED, function () {
                        self.destroy();
                    });
                }
            };

            /**
             * Called before update()
             * You can override this method to add some logic before updating
             */
            this.beforeUpdate = function(){
            };

            /**
             * Asynchronously updates data by AJAX request to DATA_URL or use dataJSON if you set isUsingFakeData to true
             * Then calls method 'informListenersAboutUpdate()' if updating was successful.
             */
            this.update = function(){
                this.ROOTSCOPE.$broadcast(IR.EVENT.OCCURRED.LOAD_DATA_START);
                this.beforeUpdate();
                if(isTracking){
                    var newData;

                    if(this.isUsingFakeData && this.dataJSON) {
                        newData = angular.copy(this.dataJSON);
                    } else {
                        // TODO: need send request to server
                    }

                    if(_isDataChanged(newData)){
                        data = newData;
                        _informListenersAboutUpdate();
                    }
                }

                // TODO: should be in callback after success load (timeout just to see spinner at least 2 seconds)
                var rootScope = this.ROOTSCOPE;
                setTimeout(function(){
                    rootScope.$broadcast(IR.EVENT.OCCURRED.LOAD_DATA_FINISHED);
                }, 2000);

            };

            /**
             * Should be called after loading data.
             * Tries to trigger update data at a specified timeout.
             */
            this.startTracking = function(){
                isTracking = true;
                trackingId = setInterval(function(){
                    self.update();
                }, this.TIMEOUT_TO_UPDATE);
            };

            this.stopTracking = function(){
                if(isTracking){
                    isTracking = false;
                    clearInterval(trackingId);
                }
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
                if(this.isUsingFakeData && this.dataJSON) {
                    this.dataJSON = newData;
                } else {
                    // TODO: send request to backend to save this new data
                }

                this.update();
            };

            this.destroy = function(){
                data = null;
                isCreated = false;
                trackingId = 0;
                listenersOnUpdate = [];

                this.stopTracking();

                // remove global listeners
                if(offListenerPageChanged) {
                    offListenerPageChanged();
                }
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
         * You should at least to override 'DATA_URL' and 'ROOTSCOPE' before use.
         * If you want to use prepared JSON - override 'dataJSON' with your JSON object, set 'isUsingFakeData' to 'true' and
         * do not override 'DATA_URL'
         * @constructor
         */
        var BaseListJsonService = function(){
            // call of the parent constructor
            BaseListJsonService.superclass.constructor.call(this);

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
             * @param portionSize - quantity of objects in a portion
             * @param portionNumber - number of the portion from 1
             */
            this.getPortion = function(portionSize, portionNumber){
                var portion = [];
                if(this.isUsingFakeData && this.dataJSON) {
                    var data = this.get(),
                        from = (portionNumber - 1) * portionSize,
                        to = from + portionSize; // not included last
                    portion = data.slice(from, to);
                } else {
                    // TODO: send request to backend to get this portion
                }

                return portion;
            };

            this.add = function(item){
                if(this.isUsingFakeData && this.dataJSON) {
                    this.dataJSON.push(item);
                } else {
                    // TODO: send request to backend to save this new list item
                }

                this.update();
            };

            this.change = function(item){
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
            this.delete = function(itemId){
                if(this.isUsingFakeData && this.dataJSON) {
                    var index = this.getIndexById(itemId);
                    if(index >=0){
                        this.dataJSON.splice(index, 1);
                    }
                } else {
                    // TODO: send request to backend to delete this list item
                }

                this.update();
            };
        };

        // BaseListJsonService is a extension of the BaseJsonService
        extend(BaseListJsonService, BaseJsonService);

        return {
            extend: extend,
            BaseJsonService: BaseJsonService,
            BaseListJsonService: BaseListJsonService
        };
    })();
});

// Supported gestures events
// just for easy access and to be at hand
/**
 hmDoubleTap : 'doubletap',
 hmDragstart : 'dragstart',
 hmDrag : 'drag',
 hmDragUp : 'dragup',
 hmDragDown : 'dragdown',
 hmDragLeft : 'dragleft',
 hmDragRight : 'dragright',
 hmDragend : 'dragend',
 hmHold : 'hold',
 hmPinch : 'pinch',
 hmPinchIn : 'pinchin',
 hmPinchOut : 'pinchout',
 hmRelease : 'release',
 hmRotate : 'rotate',
 hmSwipe : 'swipe',
 hmSwipeUp : 'swipeup',
 hmSwipeDown : 'swipedown',
 hmSwipeLeft : 'swipeleft',
 hmSwipeRight : 'swiperight',
 hmTap : 'tap',
 hmTouch : 'touch',
 hmTransformstart : 'transformstart',
 hmTransform : 'transform',
 hmTransformend : 'transformend'
 */
