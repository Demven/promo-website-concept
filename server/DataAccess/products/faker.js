var faker = require("faker"),
    _ = require("lodash");

module.exports = {
    getList: function(){
        var data = {
            total: 10,
            list: []
        };
        _.times(data.total, function(){
            data.list.push({

            });
        });
        return data;
    }
};