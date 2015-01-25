var Faker = require("Faker"),
    _ = require("lodash");

module.exports = {
    getList: function(){
        var data = {
            total: 10,
            list: []
        };
        _.times(data.total, function(){
            data.list.push({
                id: Math.round(Math.random()*1000),
                name: Faker.company.companyName(),
                image: Faker.image.fashion(),
                user: Faker.internet.userName(),
                description: Faker.lorem.sentence(),
                category: Faker.internet.domainWord(),
                favorites: Math.round(Math.random()*1000),
                isFavoriteAllow: !!Math.round(Math.random())
            });
        });
        return data;
    }
};