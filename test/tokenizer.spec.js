const chai = require('chai');
const expect = chai.expect;

const { Tokenizer } = require('../lib/tokenizer');

describe("Tokenizer", function () {

    it("should declare the Tokenizer class", function () {
        expect(Tokenizer).to.exist;
    });

    let tokenizer;
    let rule = /\d+|[a-z]|[A-Z]|[-/+//(/)/^/√/\/*]/g;

    before(function () {
        tokenizer = new Tokenizer(rule);
    });

    describe('constructor', function () {

        it('should declare a search pattern using RegExp', function () {
            expect(Object.prototype.toString.call(tokenizer.rules)).to.equal("[object RegExp]");
        });

    });

    describe('getTokens', function () {

        it('should return an array type', function () {
            let input = "";
            let result = tokenizer.getTokens(input)
            expect(result).to.be.a('array');
        });

        it('should use RegExp to account for more the one digits in succession', function () {
            let input = "12";
            let result = tokenizer.getTokens(input);
            let expected = [
                { type: "NumberLiteral", value: "12"}
            ];

            expect(result.length).to.equal(expected.length);

            for (let i = 0; i < expected.length; i++) {
                let actual = result[i];
                let exp = expected[i];

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(exp));
            }
        });

        it('should use RegExp to account singular characters', function () {
            let input = "12xyz";
            let result = tokenizer.getTokens(input);
            let expected = [
                { type: "NumberLiteral", value: "12"},
                { type: "Identifier", value: "x"},
                { type: "Identifier", value: "y"},
                { type: "Identifier", value: "z"},
            ];

            expect(result.length).to.equal(expected.length);

            for (let i = 0; i < expected.length; i++) {
                let actual = result[i];
                let exp = expected[i];

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(exp));
            }
        });

        it('should use RegExp to account operators', function () {
            let input = "√(12) * xyz + 1^3";
            let result = tokenizer.getTokens(input);
            let expected = [
                { type: "Operator", value: "√"},
                { type: "Operator", value: "("},
                { type: "NumberLiteral", value: "12"},
                { type: "Operator", value: ")"},
                { type: "Operator", value: "*"},
                { type: "Identifier", value: "x"},
                { type: "Identifier", value: "y"},
                { type: "Identifier", value: "z"},
                { type: "Operator", value: "+"},
                { type: "NumberLiteral", value: "1"},
                { type: "Operator", value: "^"},
                { type: "NumberLiteral", value: "3"},
            ];

            expect(result.length).to.equal(expected.length);

            for (let i = 0; i < expected.length; i++) {
                let actual = result[i];
                let exp = expected[i];

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(exp));
            }
        });

    });

});
