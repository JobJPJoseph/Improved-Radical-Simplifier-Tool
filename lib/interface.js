const { User } = require('./userInput');
const { Tokenizer } = require('./tokenizer');
const { Parser } = require('./parser');
const { Simplifier } = require('./simplifier');
const { Renderer } = require('./renderer');

const userInput = new User();
let rule = /\d+|[a-z]|[A-Z]|[-/+//(/)/^/√/\/*]/g;
const tokenizer = new Tokenizer(rule);
const parser = new Parser();
const simplifier = new Simplifier();
const renderer = new Renderer();

async function interface() {
    let expression = await userInput.getInput();

    switch(expression) {
    case "quit":
        console.clear();
        console.log("Thanks for your time.");
        return false;
    case "":
        console.clear()
        console.log('Did not enter an expression.')
        break;
    default:
        let tokens = tokenizer.getTokens(expression);
        let ast = parser.parseExpression(tokens);
        let simplified = simplifier.traverseTree(ast);
        let rendered = renderer.prettyPrint(simplified);

        console.log("Your simplified expression: => ", rendered);
    }

    return true;
}


async function run() {
    let exit = true;
    while(exit) {
        exit = await interface();
    }
}

run();
