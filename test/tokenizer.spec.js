const chai = require('chai');
const expect = chai.expect;

const { Tokenizer } = require('../lib/tokenizer');

describe("Tokenizer", function () {

    it("should declare the Tokenizer class", function () {
        expect(Tokenizer).to.exist;
    });

    let tokenizer;

    before(function () {
        tokenizer = new Tokenizer();
    });

    describe('', function () {

    });

});
