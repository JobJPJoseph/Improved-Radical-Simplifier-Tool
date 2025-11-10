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

    describe('SimplifyExponent', function () {

        context('When base is a NumberLiteral type', function () {

            it('should return a 1 if the expoenent value is 0', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "NumberLiteral", value: "12" },
                    exponent: { type: "NumberLiteral", value: "0" },
                }

                let expected = { type: "NumberLiteral", value: "1" };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

            it('should return a node if when the exponent value is 1', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "NumberLiteral", value: "12" },
                    exponent: { type: "NumberLiteral", value: "1" },
                }

                let expected = { type: "NumberLiteral", value: "12" };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

            it('should return a node whose value is raised by the exponent value', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "NumberLiteral", value: "12" },
                    exponent: { type: "NumberLiteral", value: "2" },
                }

                let expected = { type: "NumberLiteral", value: "144" };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

        });

        context('When base is a Identifier type', function () {

            it('should return a node if the expoenent value is 1', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "Identifier", value: "y" },
                    exponent: { type: "NumberLiteral", value: "1" },
                }

                let expected = { type: "Identifier", value: "y" };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

            it('should return a 1 if when the exponent value is 0', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "Identifier", value: "y" },
                    exponent: { type: "NumberLiteral", value: "0" },
                }

                let expected = { type: "NumberLiteral", value: "1" };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

            it('should return the tree unchanged', function () {
                let tree = {
                    type: "Exponentiation",
                    base: { type: "Identifier", value: "y" },
                    exponent: { type: "NumberLiteral", value: "2" },
                }

                let expected = {
                    type: "Exponentiation",
                    base: { type: "Identifier", value: "y" },
                    exponent: { type: "NumberLiteral", value: "2" },
                };

                let actual = simplifier.simplifyExponent(tree);

                expect(actual.type).to.equal(expected.type);
                expect(actual.value).to.equal(expected.value);
            });

        });

    });

    describe('SimplifyRoot', function () {

        context('SquareNumberLiteral', function () {

            it('should accept a tree/node and square the value by 2 and return a tree/node', function () {
                let tree = { type: "NumberLiteral", value: "12" };
                let actual = simplifier.squareNumberLiteral(tree);
                let expected = {
                    type: "BinaryExpression",
                    operator: "*",
                    left: { type: "NumberLiteral", value: "2" },
                    right: {
                        type: "Root",
                        index: { type: "NumberLiteral", value: "2" },
                        radicand: { type: "NumberLiteral", value: "3" }
                    }
                }

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
            });

        });

        context('SquareVariable', function () {

            it('should accept a tree/node and square the value by 2 and return a tree/node', function() {
                let tree = { type: "Identifier", value: "x" }
                let expected = {
                    type: "Root",
                    index: { type: "NumberLiteral", value: "2" },
                    radicand: { type: "Identifier", value: "x" }
                 };

                let actual = simplifier.simplifyRoot(tree);

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
            });

        });

        context('SquareExponentiation', function () {

            context('When the base is an Identifier', function () {

                it('should divide the exponent by the index of the root', function () {
                    let tree = {
                        type: "Exponentiation",
                        base: { type: "Identifier", value: "x" },
                        exponent: { type: "NumberLiteral", value: "3" }
                    };

                    let expected = {
                        type: "BinaryExpression",
                        operator: "*",
                        left: { type: "Identifier", value: "x" },
                        right: {
                            type: "Root",
                            index: { type: "NumberLiteral", value: "2" },
                            radicand: { type: "Identifier", value: "x" }
                        }
                    };

                    let actual = simplifier.simplifyRoot(tree);

                    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                });

            });

        });

    });

    describe('NormalizeTerm', function () {

        context('NumberLiterals', function () {

            it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                let tokens = tokenizer.getTokens('12');
                let tree = parser.parseExpression(tokens);
                let flattenedMulti = simplifier.flattenMulti(tree);

                let expected = {
                    coeff: "12",
                    vars: new Map(),
                    root: { type: "NumberLiteral", value: "1" },
                }

                let actual = simplifier.normalizeTerm(flattenedMulti);

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));

            });

        });

        context('Identifiers', function () {

            it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                let tokens = tokenizer.getTokens('x');
                let tree = parser.parseExpression(tokens);
                let flattenedMulti = simplifier.flattenMulti(tree);
                let map = new Map();
                map.set('x', "1");

                let expected = {
                    coeff: "1",
                    vars: map,
                    root: { type: "NumberLiteral", value: "1" },
                }

                let actual = simplifier.normalizeTerm(flattenedMulti);

                expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
            });

        });

        context('Exponentiations', function () {

            context('NumberLiterals', function () {

                it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                    let tokens = tokenizer.getTokens('3^2');
                    let tree = parser.parseExpression(tokens);
                    let flattenedMulti = simplifier.flattenMulti(tree);

                    let expected = {
                        coeff: "9",
                        vars: new Map(),
                        root: { type: "NumberLiteral", value: "1" },
                    }

                    let actual = simplifier.normalizeTerm(flattenedMulti);

                    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                });

            });

            context('Identifiers', function () {

                it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                    let tokens = tokenizer.getTokens('x^3');
                    let tree = parser.parseExpression(tokens);
                    let flattenedMulti = simplifier.flattenMulti(tree);
                    let map = new Map();
                    map.set('x', "3");

                    let expected = {
                        coeff: "1",
                        vars: map,
                        root: { type: "NumberLiteral", value: "1" },
                    }

                    let actual = simplifier.normalizeTerm(flattenedMulti);

                    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                });

            });

        });

        context('Root', function () {

            context('NumberLiterals', function () {

                it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                    let tokens = tokenizer.getTokens('√(12)');
                    let tree = parser.parseExpression(tokens);
                    let flattenedMulti = simplifier.flattenMulti(tree);

                    let expected = {
                        coeff: "2",
                        vars: new Map(),
                        root: {
                            type: "Root",
                            index: { type: "NumberLiteral", value: "2" },
                            radicand: { type: "NumberLiteral", value: "3" }
                        }
                    }

                    let actual = simplifier.normalizeTerm(flattenedMulti);

                    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                });

            });

            context('Identifiers', function () {

                it('should return an object the is discriptive of the term in a form of {coeff, vars, root}', function () {
                    let tokens = tokenizer.getTokens('√(y)');
                    let tree = parser.parseExpression(tokens);
                    let flattenedMulti = simplifier.flattenMulti(tree);

                    let expected = {
                        coeff: "1",
                        vars: new Map(),
                        root: {
                            type: "Root",
                            index: { type: "NumberLiteral", value: "2" },
                            radicand: { type: "Identifier", value: "y" },
                        }
                    }

                    let actual = simplifier.normalizeTerm(flattenedMulti);

                    expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                });

            });

            context('Exponentiation', function () {

                context('When base is a NumberLiterals', function () {

                    it('should square the tree and any whole Number should be added to coefficients', function () {
                        let tokens = tokenizer.getTokens('√(3^3)');
                        let tree = parser.parseExpression(tokens);
                        let flattenedMulti = simplifier.flattenMulti(tree);

                        let expected = {
                            coeff: "3",
                            vars: new Map(),
                            root: {
                                type: "Root",
                                index: { type: "NumberLiteral", value: "2" },
                                radicand: { type: "NumberLiteral", value: "3" },
                            }
                        }

                        let actual = simplifier.normalizeTerm(flattenedMulti);

                        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                    });

                });

                context("When base is an Identifier", function () {

                    it('should square the tree and any whole variables should be added to vars', function () {
                        let tokens = tokenizer.getTokens('√(x^3)');
                        let tree = parser.parseExpression(tokens);
                        let flattenedMulti = simplifier.flattenMulti(tree);
                        let variables = new Map();
                        variables.set("x", "1");

                        let expected = {
                            coeff: "1",
                            vars: variables,
                            root: {
                                type: "Root",
                                index: { type: "NumberLiteral", value: "2" },
                                radicand: { type: "Identifier", value: "x" },
                            }
                        }

                        let actual = simplifier.normalizeTerm(flattenedMulti);

                        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
                    });

                });

            });

        });

    });

    describe('BuildTreeFromNorm', function () {

        it('should accept a normalizeTerm object and build an AST form it', function () {
            let tokens = tokenizer.getTokens('9xy');
            let astTree = parser.parseExpression(tokens);
            let flattenedMulti = simplifier.flattenMulti(astTree);
            let actualNorm = simplifier.normalizeTerm(flattenedMulti);
            let actual = simplifier.buildAstFromNorm(actualNorm);

            console.log(JSON.stringify(actual, null, 2))
            console.log("==================");
            console.log(JSON.stringify(astTree, null, 2))


            // expect(JSON.stringify(actual)).to.equal(JSON.stringify(astTree));
        });

    });

    describe('RebuildAstFromTree', function () {

    });

    describe('NormalizeTerm', function () {

        context('BinaryExpression', function () {

        });

    });

    describe('SimplifyMulti', function () {

    });

    describe('simplifyAdd', function () {

    });

});
