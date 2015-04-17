/**
 * Created by Dzmitry_Salnikau on 3/26/2015.
 */
IR.MODULE.CONTENT.factory("irCardFactory", function($rootScope, $window, $q, irExtendService, irTemplateService, irLog){
    return (function(){

        var CARD_TYPE = {
            IMAGE: "image",
            VIDEO: "video",
            AUDIO: "audio"
        };

        var imageTemplatePromise,
            videoTemplatePromise,
            audioTemplatePromise;

        /**
         * Load templates for all card types and create promises for them
         */
        (function initTemplates(){
            var imageDeffered = $q.defer(),
                videoDeffered = $q.defer(),
                audioDeffered = $q.defer();
            imageTemplatePromise = imageDeffered.promise;
            videoTemplatePromise = videoDeffered.promise;
            audioTemplatePromise = audioDeffered.promise;
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "image-card.html")
                .then(function(template){
                    imageDeffered.resolve(template);
                });
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "video-card.html")
                .then(function(template){
                    videoDeffered.resolve(template);
                });
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "audio-card.html")
                .then(function(template){
                    audioDeffered.resolve(template);
                });
        })();

        /**
         * Abstract class for Card component
         * Used as parent object for implementation of Card (Image, Video, etc)
         * @extends BaseElementComponent
         * @constructor
         */
        var BaseCard = function(data, templatePromise){
            // call of the parent constructor
            BaseCard.superclass.constructor.call(this);

            // settings of the BaseElementComponent
            this.isTriggerResize = false;
            this.isDestroyOnPageChange = true;
            this.isDefferedBuild = true;
            this.defferedBuildPromise = templatePromise;

            this.ATTR = {
                TRANSFORM: "transform",
                _WEBKIT_TRANSFORM: "-webkit-transform"
            };

            this.CLASS = {
                HAS_DESCRIPTION: "has-description",
                TOP_LEFT: "top-left",
                TOP_RIGHT: "top-right",
                BOTTOM_RIGHT: "bottom-right",
                BOTTOM_LEFT: "bottom-left"
            };

            this.VAL = {
                SPACE: " "
            };

            this.baseWidth = 40;// em

            /**
             * Id of the card
             * @type {string}
             */
            this.id = "";
            /**
             * Title for the card content
             * @type {string}
             */
            this.title = "";
            /**
             * Category of the card content (Photo, Soundtrack, Painting, etc)
             * @type {string}
             */
            this.category = "";
            /**
             * Description of the card content
             * @type {string}
             */
            this.description = "";
            /**
             * Object that contains data about content's author
             * @type Object
             */
            this.author = null;
            /**
             * Date of the content's publication
             * @type Date
             */
            this.pubDate = null;
            /**
             * Source uri of the content (e.g <img src='contentSrc'>)
             * @type {string}
             */
            this.contentSrc = "";
            /**
             * Float value with 2 digits after point that indicates interrelation of height to width of content
             * @type {float}
             */
            this.aspectRatio = 0.00;
            /**
             * Position of the info-box on the card (value from 1 to 4 stands for the corner of the card clockwise)
             * @type {integer}
             */
            this.infoPosition = 0;
            /**
             * Type of the content's distribution (sale, free, etc)
             * @see this.DISTRIBUTION_TYPE
             * @type {string}
             */
            this.distributionType = "";
            /**
             * Type of the content: Image, Video, etc
             * @see this.CONTENT_TYPE
             * @type {string}
             */
            this.contentType = "";
            /**
             * Type of content's license: Commerce, Private, etc
             * @see this.LICENSE_TYPE
             * @type {string}
             */
            this.licenseType = "";

            this.INFO_POSITION = {
                TOP_LEFT: 1,
                TOP_RIGHT: 2,
                BOTTOM_RIGHT: 3,
                BOTTOM_LEFT: 4
            };

            this.CONTENT_TYPE = {
                IMAGE: "image",
                VIDEO: "video",
                AUDIO: "audio"
            };

            this.DISTRIBUTION_TYPE = {
                ORDER: "order", // available for order
                SALE: "sale", // unlimited sale
                LIMITED_SALE: "limited_sale", // for sale, but there is a limited quantity of a product
                FREE: "free", // free without limitations
                LIMITED_FREE: "limited_free" // free, but has a limited quantity of a product
            };

            this.LICENSE_TYPE = {
                NO_RESTRICTIONS: "no_restrictions", // can be used for commerce use without any restrictions
                LIMITED_COMMERCE: "limited_commerce", // can be used for commerce only by permit of the owner
                ONLY_PRIVATE: "only_private", // only for private use, commercial use restricted by owner
                LIMITED_PRIVATE: "limited_private" // can be used only for private and exclusively by permit of the owner
            };

            var wrapper, // jqlite object
                wrapperEl, // HTMLElement
                height,
                width,
                shiftUp = 0;

            // Lifecycle
            this._init = function(){
                this.id = data.id;
                this.title = data.title;
                this.category = data.category;
                this.description = data.description;
                this.author = data.author;
                this.pubDate = new Date(data.pubDate);
                this.contentSrc = data.contentSrc;
                this.aspectRatio = +data.aspectRatio;
                this.infoPosition = data.infoPosition ? +data.infoPosition : this.INFO_POSITION.BOTTOM_RIGHT;
                this.distributionType = data.distributionType;
                this.contentType = data.contentType;
                this.licenseType = data.licenseType;
            };

            this._create = function(template){
                wrapper = angular.element(template);
                wrapperEl = wrapper[0];
            };

            this._render = function(objectsToRender, animateShow){
                this.populate(); // populate view with data

                if(animateShow === true){
                    window.setTimeout(function(){
                        wrapper.addClass("show");
                    }, 1000);
                } else {
                    wrapper.addClass("show");
                }
                this.updateBounds();
            };

            /**
             * Populates view with data
             * @warn should be overridden by child objects
             */
            this.populate = function(){
            };

            this._resize = function(){
                this.updateBounds();
            };

            this.shiftUp = function(shiftValue){
                var cssValue = "translateY(-" + shiftValue + "em)";
                shiftUp = shiftValue;
                wrapper.css(this.ATTR._WEBKIT_TRANSFORM, cssValue);
                wrapper.css(this.ATTR.TRANSFORM, cssValue);
            };

            this.shiftLeft = function(shiftValue){
                var cssValue = "translate(-" + shiftValue + "em, -" + shiftUp + "em)";
                wrapper.css(this.ATTR._WEBKIT_TRANSFORM, cssValue);
                wrapper.css(this.ATTR.TRANSFORM, cssValue);
            };

            /**
             * Calculates width and height of the card and update values
             */
            this.updateBounds = function(){
                height = wrapperEl.offsetHeight;
                width = wrapperEl.offsetWidth;
            };

            this.populateInfoBox = function(){
                var infoBox = wrapperEl.querySelector(".info-box"),
                    positionClass;

                switch(this.infoPosition){
                    case this.INFO_POSITION.TOP_LEFT:
                        positionClass = this.CLASS.TOP_LEFT;
                        break;
                    case this.INFO_POSITION.TOP_RIGHT:
                        positionClass = this.CLASS.TOP_RIGHT;
                        break;
                    case this.INFO_POSITION.BOTTOM_RIGHT:
                        positionClass = this.CLASS.BOTTOM_RIGHT;
                        break;
                    case this.INFO_POSITION.BOTTOM_LEFT:
                        positionClass = this.CLASS.BOTTOM_LEFT;
                        break;
                }

                // set position of the info-box
                angular.element(infoBox).addClass(positionClass);

                if(this.title){
                    var splittedTitle = this.splitTitle(this.title);
                    infoBox.querySelector(".title .thin").innerHTML = splittedTitle.first;
                    infoBox.querySelector(".title .bold").innerHTML = splittedTitle.second;
                }
                if(this.category){
                    infoBox.querySelector(".credit .category").innerHTML = this.category;
                }
                if(this.author && this.author.firstName && this.author.lastName){
                    infoBox.querySelector(".credit .author").innerHTML = this.author.firstName + " " + this.author.lastName;
                }
            };

            this.populateDescription = function(){
                if(this.description){
                    wrapperEl.querySelector(".description").innerHTML = this.description;
                    wrapper.addClass(this.CLASS.HAS_DESCRIPTION);
                }
            };

            /**
             * Split a received title to two string (first half and second half)
             * @param title - string with title to split
             * @return {{first: string, second: string}}
             */
            this.splitTitle = function(title){
                var first, second = "",
                    words = title.split(this.VAL.SPACE),
                    len = words.length,
                    middleIndex;

                if(len > 1){
                    middleIndex = Math.floor(len/2);
                    first = words.slice(0, middleIndex).join(this.VAL.SPACE);
                    second = words.slice(middleIndex, len).join(this.VAL.SPACE);
                } else if (len === 1){
                    second = title;
                }

                return {first: first, second: second};
            };

            this.getWrapper = function(){
                return wrapper;
            };

            this.getWrapperEl = function(){
                return wrapperEl;
            };

            this.getWidth = function(){
                return width;
            };

            this.getHeight = function(){
                return height;
            };

            this.getShiftUp = function(){
                return shiftUp;
            };
        };

        irExtendService.extend(BaseCard, irExtendService.BaseElementComponent);


        /**
         * Card with image as a content
         * @extends BaseCard
         * @constructor
         */
        var ImageCard = function(data, templatePromise){
            // call of the parent constructor
            ImageCard.superclass.constructor.call(this, data, templatePromise);

            this.contentType = this.CONTENT_TYPE.IMAGE;

            this.populate = function(){
                var wrapper = this.getWrapper(),
                    wrapperEl = this.getWrapperEl(),
                    img = wrapperEl.querySelector("img");
                if(this.contentSrc && this.aspectRatio){
                    var h = this.aspectRatio*this.baseWidth + "em";
                    wrapper.css("height", h);
                    img.src = this.contentSrc;
                    if(this.description) img.alt = this.description;

                    this.populateInfoBox();
                    this.populateDescription();
                }
            };
        };

        irExtendService.extend(ImageCard, BaseCard);


        /**
         * Card with video as a content
         * @extends BaseCard
         * @constructor
         */
        var VideoCard = function(data, templatePromise){
            // call of the parent constructor
            VideoCard.superclass.constructor.call(this, data, templatePromise);

            this.contentType = this.CONTENT_TYPE.VIDEO;

            this.populate = function(){
                var wrapper = this.getWrapper(),
                    wrapperEl = this.getWrapperEl(),
                    img = wrapperEl.querySelector("img");
                if(this.contentSrc && this.aspectRatio){
                    var h = this.aspectRatio*this.baseWidth + "em";
                    wrapper.css("height", h);
                    img.src = this.contentSrc;
                    if(this.description) img.alt = this.description;

                    this.populateInfoBox();
                    this.populateDescription();
                }
            };
        };

        irExtendService.extend(VideoCard, BaseCard);


        /**
         * Card with video as a content
         * @extends BaseCard
         * @constructor
         */
        var AudioCard = function(data, templatePromise){
            // call of the parent constructor
            AudioCard.superclass.constructor.call(this, data, templatePromise);

            this.contentType = this.CONTENT_TYPE.AUDIO;

            this.populate = function(){
                this.populateInfoBox();
            };
        };

        irExtendService.extend(AudioCard, BaseCard);


        /**
         * Fabric method that creates and returns card instance with requested type
         * @param data - data from backend to initialize card with
         * @return Object - Card component
         */
        var createCard = function(data){
            switch (data.contentType){
                case CARD_TYPE.IMAGE:
                    return new ImageCard(data, imageTemplatePromise);
                    break;
                case CARD_TYPE.VIDEO:
                    return new VideoCard(data, videoTemplatePromise);
                    break;
                case CARD_TYPE.AUDIO:
                    return new AudioCard(data, audioTemplatePromise);
                    break;
            }
        };

        return {
            CARD_TYPE: CARD_TYPE,
            createCard: createCard
        };
    })();
});
