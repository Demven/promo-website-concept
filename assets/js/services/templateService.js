/**
 * Created by Dzmitry_Salnikau on 3/27/2015.
 */
IR.MODULE.UTIL.service("irTemplateService", function TemplateService($rootScope, $http, $q, irLog) {
    this.NAME = "TemplateService";
    this.BASE_URL = "/templates/";
    this.COMPONENTS_URL = this.BASE_URL + "components/";

    /**
     * Cache for objects {url, content}
     * @type {Array}
     */
    var templateCache = [],
        NAME = this.NAME;

    /**
     * Loads template from server or returns it from cache if exists
     * @param url
     * @return promise
     */
    this.getTemplate = function(url){
        var len = templateCache.length,
            t,
            result,
            deferred = $q.defer();

        // search in cache
        for( ; len--; ){
            t = templateCache[len];
            if(t.url === url){
                deferred.resolve(t.content);
                break;
            }
        }

        // if no in cache - load from server
        if(!result){
            $http
                .get(url)
                .success(function(data, status, headers, config) {
                    templateCache.push({
                        url: url,
                        content: data
                    });
                    deferred.resolve(data);
                    irLog.info(NAME + " :successful load of " + url);
                })
                .error(function(data, status, headers, config) {
                    deferred.reject(data + " with status " + status);
                    irLog.error(NAME + " :failed to load " + url);
                });
        }

        return deferred.promise;
    };
});
