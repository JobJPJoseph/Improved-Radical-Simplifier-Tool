const chai = require('chai');
const expect = chai.expect;

const { Tokenizer } = require('../lib/tokenizer');
const { Parser } = require('../lib/parser');

describe("Parser", function () {

    it('should declare the Parser class', function () {
        expect(Parser).to.exist;
    });

    let rule = /\d+|[a-z]|[A-Z]|[-/+//(/)/^/√/\/*]/g;
    let tokenizer;
    let tokens;
    let parser;

    before(function () {
        tokenizer = new Tokenizer(rule);
        tokens = tokenizer.getTokens('√(12x) + 5');
        parser = new Parser();
    });

    describe('Match', function () {

        context('Numbers', function () {

            it('should return a tree ', function () {

            });

        });

        context('Identifier', function () {

        });

    });

    describe("Subtraction", function () {

    });

    describe('Addition', function () {

    });

    describe('Division', function () {

    });

    describe('Multiplication', function () {

    });

    describe('Root', function () {

    });

    describe('Exponentiation', function () {

    });

    describe('Parenthesis', function () {

    });

});
