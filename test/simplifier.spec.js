const chai = require('chai');
const expect = chai.expect;

const { Tokenizer } = require('../lib/tokenizer');
const { Parser } = require('../lib/parser');
const { Simplifier } = require('../lib/simplifier');


describe("Simplifier", function () {

    it('should declare the Simplifier class', function () {
        expect(Simplifier).to.exist;
    });

    let tokenizer;
    let parser;
    let simplifier;

    before(function () {
        tokenizer = new Tokenizer();
        parser = new Parser();
        simplifier = new Simplifier();
    });

    context('Flattening Trees', function () {

        let tokens = tokenizer.getTokens('12 + x * 3');
        let tree = parser.parseExpression(tokens);

        describe('flattenAdd', function () {

            it('should decompose the input on the addition operator', function () {
                let flattenedAdd = simplifier.flattenedAdd(tree);
                let expFlattenedAdd = [

                ]
            });

        });

        describe('flattenMulti', function () {

        });

    });

});
