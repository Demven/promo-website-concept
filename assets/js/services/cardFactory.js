/**
 * Created by Dzmitry_Salnikau on 3/26/2015.
 */
IR.MODULE.CONTENT.factory("irCardFactory", function($rootScope, $window, irExtendService, irTemplateService, irLog){
    return (function(){

        var CARD_TYPE = {
            IMAGE: "image",
            VIDEO: "video",
            AUDIO: "audio"
        };

        var imageTemplate,
            videoTemplate,
            audioTemplate;

        (function initTemplates(){
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "image-card.html")
                .then(function(content){
                    imageTemplate = content;
                    window.console.log(content);
                });
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "video-card.html")
                .then(function(content){
                    videoTemplate = content;
                    window.console.log(content);
                });
            irTemplateService
                .getTemplate(irTemplateService.COMPONENTS_URL + "audio-card.html")
                .then(function(content){
                    audioTemplate = content;
                    window.console.log(content);
                });
        })();

        /**
         * Abstract class for Card component
         * Used as parent object for implementation of Card (Image, Video, etc)
         * @extends BaseElementComponent
         * @constructor
         */
        var BaseCard = function(data){
            // call of the parent constructor
            BaseCard.superclass.constructor.call(this);

            // settings of the BaseElementComponent
            this.isTriggerResize = true;
            this.isDestroyOnPageChange = true;

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

            // Lifecycle
            this._init = function(){
                this.title = data.title;
                this.category = data.category;
                this.description = data.description;
                this.author = data.author;
                this.pubDate = new Date(data.pubDate);
                this.contentSrc = data.contentSrc;
                this.distributionType = data.distributionType;
                this.contentType = data.contentType;
                this.licenseType = data.licenseType;
            };

            this._create = function(){

            };
        };

        irExtendService.extend(BaseCard, irExtendService.BaseElementComponent);

        /**
         * Card with image as a content
         * @extends BaseCard
         * @constructor
         */
        var ImageCard = function(data){
            // call of the parent constructor
            ImageCard.superclass.constructor.call(this, data);

            this.contentType = this.CONTENT_TYPE.IMAGE;
        };

        irExtendService.extend(ImageCard, BaseCard);


        /**
         * Card with video as a content
         * @extends BaseCard
         * @constructor
         */
        var VideoCard = function(data){
            // call of the parent constructor
            VideoCard.superclass.constructor.call(this, data);

            this.contentType = this.CONTENT_TYPE.VIDEO;
        };

        irExtendService.extend(VideoCard, BaseCard);

        /**
         * Card with video as a content
         * @extends BaseCard
         * @constructor
         */
        var AudioCard = function(data){
            // call of the parent constructor
            AudioCard.superclass.constructor.call(this, data);

            this.contentType = this.CONTENT_TYPE.AUDIO;
        };

        irExtendService.extend(AudioCard, BaseCard);

        /**
         * Fabric method that creates and returns card instance with requested type
         * @param type - (String) type of the card (image, video, audio)
         * @param data - data from backend to initialize card with
         * @return Object - Card component
         */
        var createCard = function(type, data){
            switch (type){
                case CARD_TYPE.IMAGE:
                    return new ImageCard(data);
                    break;
                case CARD_TYPE.VIDEO:
                    return new VideoCard(data);
                    break;
                case CARD_TYPE.AUDIO:
                    return new AudioCard(data);
                    break;
            }
        };

        return {
            CARD_TYPE: CARD_TYPE,
            createCard: createCard
        };
    })();
});
