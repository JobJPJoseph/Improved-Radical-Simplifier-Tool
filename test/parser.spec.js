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
    let parser;

    before(function () {
        tokenizer = new Tokenizer(rule);
        parser = new Parser();
    });

    describe('Match', function () {

        context('Numbers', function () {

            it('should return a node that should be a NumberLiteral type', function () {
                let tokens = tokenizer.getTokens("12");
                let tree = parser.parseExpression(tokens);
                expect(tree.type).to.equal("NumberLiteral");
                expect(tree.value).to.equal('12');
            });

        });

        context('Identifier', function () {

            it('should return a node that should be an Identifier type', function () {
                let tokens = tokenizer.getTokens("x");
                let tree = parser.parseExpression(tokens);
                expect(tree.type).to.equal("Identifier");
                expect(tree.value).to.equal('x');
            });

        });

    });

    describe("Subtraction", function () {

        it('should a return a tree where the root is an subtraction operator', function () {
            let tokens = tokenizer.getTokens('12 - x');
            let tree = parser.parseExpression(tokens);
            expect(tree.operator).to.equal("-");
            expect(tree.type).to.equal('BinaryExpression');

            expect(tree.left.type).to.equal("NumberLiteral");
            expect(tree.left.value).to.equal("12");

            expect(tree.right.type).to.equal('Identifier');
            expect(tree.right.value).to.equal('x');
        });

    });

    describe('Addition', function () {

        it('should a return a tree where the root is an addition operator', function () {
            let tokens = tokenizer.getTokens('12 + x');
            let tree = parser.parseExpression(tokens);
            expect(tree.operator).to.equal("+");
            expect(tree.type).to.equal('BinaryExpression');

            expect(tree.left.type).to.equal("NumberLiteral");
            expect(tree.left.value).to.equal("12");

            expect(tree.right.type).to.equal('Identifier');
            expect(tree.right.value).to.equal('x');
        });

    });

    describe('Division', function () {

        it('should a return a tree where the root is an Division operator', function () {
            let tokens = tokenizer.getTokens('12 / x');
            let tree = parser.parseExpression(tokens);
            expect(tree.operator).to.equal("/");
            expect(tree.type).to.equal('BinaryExpression');

            expect(tree.left.type).to.equal("NumberLiteral");
            expect(tree.left.value).to.equal("12");

            expect(tree.right.type).to.equal('Identifier');
            expect(tree.right.value).to.equal('x');
        });

    });

    describe('Multiplication', function () {

        it('should a return a tree where the root is an Multiplication operator', function () {
            let tokens = tokenizer.getTokens('12 * x');
            let tree = parser.parseExpression(tokens);
            expect(tree.operator).to.equal("*");
            expect(tree.type).to.equal('BinaryExpression');

            expect(tree.left.type).to.equal("NumberLiteral");
            expect(tree.left.value).to.equal("12");

            expect(tree.right.type).to.equal('Identifier');
            expect(tree.right.value).to.equal('x');
        });

    });

    describe('Root', function () {

        it('should a return a tree where the root is a Root type', function () {
            let tokens = tokenizer.getTokens('√x');
            let tree = parser.parseExpression(tokens);
            expect(tree.type).to.equal('Root');

            expect(tree.index.type).to.equal("NumberLiteral");
            expect(tree.index.value).to.equal("2");

            expect(tree.radicand.type).to.equal('Identifier');
            expect(tree.radicand.value).to.equal('x');
        });

    });

    describe('Exponentiation', function () {

        it('should return a tree where the root is a Exponentiation type', function () {
            let tokens = tokenizer.getTokens('x^3');
            let tree = parser.parseExpression(tokens);
            expect(tree.type).to.equal('Root');

            expect(tree.index.type).to.equal("NumberLiteral");
            expect(tree.index.value).to.equal("2");

            expect(tree.radicand.type).to.equal('Identifier');
            expect(tree.radicand.value).to.equal('x');
        });


    });

    describe('Parenthesis', function () {

        it('parenthesis should start a new context', function () {
            let tokens1 = tokenizer.getTokens('x^(3 + 2)');
            let tokens2 = tokenizer.getTokens('x^3 + 2');

            let tree1 = parser.parseExpression(tokens1);
            let tree2 = parser.parseExpression(tokens2);

            expect(tree1.type).to.equal("Root");
            expect(tree2.type).to.equal("BinaryExpression");

            expect(tree1.base.value).to.equal('x');
            expect(tree1.exponent.type).to.equal('BinaryExpression');
            expect(tree1.exponent.left.type).to.equal('NumberLiteral');
            expect(tree1.exponent.right.type).to.equal('NumberLiteral');

            expect(tree2.left.type).to.equal("Exponentiation");
            expect(tree2.left.index.type).to.equal("NumberLiteral");
            expect(tree2.left.exponent.type).to.equal('NumberLiterl');
            expect(tree2.left.exponent.value).to.equal('3');

            expect(tree2.right.type).to.equal('NumberLiteral');
            expect(tree2.right.value).to.equal('2');
        });

    });

});
