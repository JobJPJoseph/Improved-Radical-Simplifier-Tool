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
        tokenizer = new Tokenizer(/\d+|[a-z]|[A-Z]|[-/+//(/)/^/√/\/*]/g);
        parser = new Parser();
        simplifier = new Simplifier();
    });

    context('Flattening Trees', function () {

        describe('flattenAdd', function () {

            it('should decompose the input on the addition operator', function () {
                let tokens = tokenizer.getTokens('12 + x');
                let tree = parser.parseExpression(tokens);
                let flattenedAdd = simplifier.flattenAdd(tree);
                let expected = [
                   { type: "NumberLiteral", value: "12" },
                   { type: "Identifier", value: "x" }
                ];

                expect(flattenedAdd.length).to.equal(expected.length);

                for (let i = 0; i < expected.length; i++) {
                    expect(JSON.stringify(flattenedAdd[i])).to.equal(JSON.stringify(expected[i]));
                }

            });

        });

        describe('flattenMulti', function () {

            it('should decompose the input on the multiplication operator', function () {
                let tokens = tokenizer.getTokens('12 * x');
                let tree = parser.parseExpression(tokens);
                let flattenedMulti = simplifier.flattenMulti(tree);
                let expected = [
                   { type: "NumberLiteral", value: "12" },
                   { type: "Identifier", value: "x" }
                ];

                expect(flattenedMulti.length).to.equal(expected.length);

                for (let i = 0; i < expected.length; i++) {
                    expect(JSON.stringify(flattenedMulti[i])).to.equal(JSON.stringify(expected[i]));
                }

            });

        });

    });

    describe('Power', function () {

        it('should return the result of raising the base to the exponent', function () {
            let actual = simplifier.power(2, 3);
            let expected = 8;

            expect(actual).to.equal(expected);
        });

    });

    describe('CollectValuesUnderRadical', function () {

        it('should traverse through the tree under the Root and collect all the values into a single string', function () {
            let radical = {
                type: "BinaryExpression",
                operator: "*",
                left: { type: "NumberLiteral", value: "3" },
                right: { type: "Identifier", value: "x" },
            };

            let actual = simplifier.collectValuesUnderRadical(radical);
            let expected = "3x";

            expect(actual).to.equal(expected);
        });

    });

    describe('ConvertObjectIntoKey', function () {

        it('should callect all variables and values under the Root and convert it into a string', function () {
            let variables = new Map();
            variables.set("x", "2");
            variables.set("y", "1");

            let radical = {
                type: "BinaryExpression",
                operator: "*",
                left: { type: "NumberLiteral", value: "3" },
                right: { type: "Identifier", value: "x" },
            };

            let obj = { coeff: "2", vars: variables, root: radical };

            let actual = simplifier.convertObjectIntoKey(obj);
            let expected = "x^2y^1√3x";

            expect(actual).to.equal(expected);
        });

    })

    describe('SortVars', function () {

        it('should return a array where the indices are sort in lexigraphical order', function () {
            let variables = new Map();
            variables.set("y", "2");
            variables.set("x", "1");

            let result = simplifier.sortVars(variables.entries());
            let expected = [
                [ "x", "1" ],
                [ "y", "2" ],
            ];

            expect(result.length).to.equal(expected.length);

            for (let i = 0; i < expected.length; i++) {
                expect(result[i][0]).to.equal(expected[i][0]);
                expect(result[0][i]).to.equal(expected[0][i]);
            }

        });

    });

});
