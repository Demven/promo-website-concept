/**
 * Created by Dzmitry_Salnikau on 3/23/2015.
 */
IR.MODULE.CONTENT.factory("irArtService", function($rootScope, irExtendService){

    function ArtService() {
        // call of the parent constructor
        ArtService.superclass.constructor.call(this);

        this.NAME = "ArtService";
        this.isUsingFakeData = true;
        this.isDestroyOnPageChange = true;
        this.TIMEOUT_TO_UPDATE = 0;
        this.CONFIG.PORTION_SIZE = 10;
        this.dataJSON = [
            {id: "100", contentType: "image"},{id: "101", contentType: "image"},{id: "102", contentType: "video"},{id: "103", contentType: "image"},{id: "104", contentType: "audio"},{id: "105", contentType: "image"},{id: "106", contentType: "image"},{id: "107", contentType: "video"},{id: "108", contentType: "image"},{id: "109", contentType: "audio"},
            {id: "110", contentType: "image"}, {id: "111", contentType: "audio"},{id: "112", contentType: "image"},{id: "113", contentType: "audio"},{id: "114", contentType: "image"},{id: "115", contentType: "audio"},{id: "116", contentType: "video"},{id: "117", contentType: "image"},{id: "118", contentType: "image"},{id: "119", contentType: "audio"},
            {id: "120", contentType: "video"},{id: "121", contentType: "audio"},{id: "122", contentType: "image"},{id: "123", contentType: "image"},{id: "124", contentType: "video"},{id: "125", contentType: "image"},{id: "126", contentType: "image"},{id: "127", contentType: "audio"},{id: "128", contentType: "video"},{id: "129", contentType: "image"},
            {id: "130", contentType: "video"},{id: "131", contentType: "video"},{id: "132", contentType: "audio"},{id: "133", contentType: "image"},{id: "134", contentType: "image"},{id: "135", contentType: "image"},{id: "136", contentType: "image"},{id: "137", contentType: "image"},{id: "138", contentType: "video"},{id: "139", contentType: "audio"},
            {id: "140", contentType: "image"},{id: "141", contentType: "image"},{id: "142", contentType: "image"},{id: "143", contentType: "image"},{id: "144", contentType: "audio"},{id: "145", contentType: "video"},{id: "146", contentType: "image"},{id: "147", contentType: "image"},{id: "148", contentType: "audio"},{id: "149", contentType: "image"}
        ];
    }

    irExtendService.extend(ArtService, irExtendService.BaseListJsonService);

    if(!IR.SRV.ART){
        IR.SRV.ART = new ArtService();
    }

    return IR.SRV.ART;
});
