const chai = require('chai');
const expect = chai.expect;

const { Tokenizer } = require('../lib/tokenizer');
const { Parser } = require('../lib/parser');
const { Simplifier } = require('../lib/simplifier');
const { Renderer } = require('../lib/renderer');


describe('Renderer class', function () {

    it('should declare the Renderer class', function () {
        expect(Renderer).to.exist;
    });

    let tokenizer;
    let parser;
    let simplifier;

    before(function () {
        tokenizer = new Tokenizer(/\d+|[a-z]|[A-Z]|[-/+//(/)/^/√/\/*]/g);
        parser = new Parser();
        simplifier = new Simplifier();
    });

    describe("", function () {

    });

});
