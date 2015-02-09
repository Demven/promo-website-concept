/**
 * Created by Dzmitry_Salnikau on 2/9/2015.
 * Service, that contains all global events definitions
 */
IR.MODULE.UTIL.factory("eventsService", function(){
    return {
        WISH: {
            /** request to change page title using data send with this event */
            SET_PAGE_TITLE: "WISH_SET_PAGE_TITLE", // data = "pageTitle"
            /** request to change page subtitle using data send with this event */
            SET_PAGE_SUBTITLE: "WISH_SET_PAGE_SUBTITLE" // data = "pageSubtitle"
        },
        OCCURRED: {
            WINDOW_RESIZE: "OCCURRED_WINDOW_RESIZE"
        }
    }
});
