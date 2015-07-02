"use strict";
var request = require("request");
var assert = require("assert");
var helpers = require("./helpers.js");
var jsonApiTestServer = require("../example/server.js");


describe("Testing jsonapi-server", function() {
  describe("Adding to a relation", function() {
    it("errors with invalid type", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/foobar/someId/relationships/author"
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "404", "Expecting 404");

        done();
      });
    });

    it("errors with invalid id", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/articles/foobar/relationships/author",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "data": { "type": "people", "id": "ad3aa89e-9c5b-4ac9-a652-6670f9f27587" }
        })
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "404", "Expecting 404");

        done();
      });
    });

    it("errors with invalid type", function(done) {
      var data = {
        method: "post",
        url: "http://localhost:16006/rest/articles/fa2a073f-8c64-4cbb-9158-b8f67a4ab9f5/relationships/comments",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "data": { "type": "people", "id": "6b017640-827c-4d50-8dcc-79d766abb408" }
        })
      };
      request(data, function(err, res, json) {
        assert.equal(err, null);
        json = helpers.validateError(json);
        assert.equal(res.statusCode, "403", "Expecting 403");

        done();
      });
    });

    describe("adding", function() {
      it("updates the resource", function(done) {
        var data = {
          method: "post",
          url: "http://localhost:16006/rest/articles/de305d54-75b4-431b-adb2-eb6b9e546014/relationships/comments",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "data": { "type": "comments", "id": "6b017640-827c-4d50-8dcc-79d766abb408" }
          })
        };
        request(data, function(err, res, json) {
          assert.equal(err, null);
          json = helpers.validateJson(json);

          var keys = Object.keys(json);
          assert.deepEqual(keys, [ "meta", "links", "data" ], "Should have meta, links and data");
          assert.equal(res.statusCode, "201", "Expecting 201");

          done();
        });
      });

      it("new resource has changed", function(done) {
        var url = "http://localhost:16006/rest/articles/de305d54-75b4-431b-adb2-eb6b9e546014/relationships/comments";
        request.get(url, function(err, res, json) {
          assert.equal(err, null);
          json = helpers.validateJson(json);

          var keys = Object.keys(json);
          assert.deepEqual(keys, [ "meta", "links", "data" ], "Should have meta, links, data and included");
          assert.equal(res.statusCode, "200", "Expecting 200");

          assert.deepEqual(json.data, [
            {
              "type": "comments",
              "id": "3f1a89c2-eb85-4799-a048-6735db24b7eb"
            },
            {
              "type": "comments",
              "id": "6b017640-827c-4d50-8dcc-79d766abb408"
            }
          ]);

          done();
        });
      });
    });
  });

  before(function() {
    jsonApiTestServer.start();
  });
  after(function() {
    jsonApiTestServer.close();
  });
});
