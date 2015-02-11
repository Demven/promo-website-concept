var superagent = require("superagent"),
    expect = require("expect.js"),
    fs = require("fs");

describe("Express rest api server", function () {
    it("Categories GET", function (done) {
        superagent.get("http://127.0.0.1:4002/api/v1/products")
            .end(function(e, res){
                expect(e).to.eql(null);
                done()
            });
    });
});
