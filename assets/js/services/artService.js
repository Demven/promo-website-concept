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
            {id: "100"},{id: "101"},{id: "102"},{id: "103"},{id: "104"},{id: "105"},{id: "106"},{id: "107"},{id: "108"},{id: "109"},
            {id: "110"}, {id: "111"},{id: "112"},{id: "113"},{id: "114"},{id: "115"},{id: "116"},{id: "117"},{id: "118"},{id: "119"},
            {id: "120"},{id: "121"},{id: "122"},{id: "123"},{id: "124"},{id: "125"},{id: "126"},{id: "127"},{id: "128"},{id: "129"},
            {id: "130"},{id: "131"},{id: "132"},{id: "133"},{id: "134"},{id: "135"},{id: "136"},{id: "137"},{id: "138"},{id: "139"},
            {id: "140"},{id: "141"},{id: "142"},{id: "143"},{id: "144"},{id: "145"},{id: "146"},{id: "147"},{id: "148"},{id: "149"}
        ];
    }

    irExtendService.extend(ArtService, irExtendService.BaseListJsonService);

    if(!IR.SRV.ART){
        IR.SRV.ART = new ArtService();
    }

    return IR.SRV.ART;
});
