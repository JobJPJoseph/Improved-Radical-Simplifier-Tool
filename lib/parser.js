class Parser {
    constructor() {}

    parseExpression(tokens) {
        let i = 0;

        function subtraction() {
            if (i >= tokens.length) return null;

            let node = addition();

            // Left associative
            while(i < tokens.length && /[-]/.test(tokens[i].value)) {
                // This fills from left to right
                // When the stack is filled we reassign node creating a stack effect
                i++;
                let nodeR = addition();
                node = { type: "BinaryExpression", operator: "-", left: node, right: nodeR };
            }

            return node;
        }

        function addition() {
            let node = division();

            // Left associative
            while(i < tokens.length && /[+]/.test(tokens[i].value)) {
                // This fills from left to right
                // When the stack is filled we reassign node creating a stack effect
                i++;
                let nodeR = division();
                node = { type: "BinaryExpression", operator: "+", left: node, right: nodeR };
            }

            return node;
        }


        function division() {
            let node = mulitplication();

            // Left associative
            while(i < tokens.length && /[/]/.test(tokens[i].value)) {
                // This fills from left to right
                // When the stack is filled we reassign node creating a stack effect
                i++;
                let nodeR = mulitplication();
                node = { type: "BinaryExpression", operator: "/", left: node, right: nodeR };
            }

            return node;
        }

        function mulitplication() {
            let node = root();

            // Left associative
            while (i < tokens.length) {
                let operator = "*";

                if (/[*]/.test(tokens[i].value)) {
                    i++;
                    let nodeR = root();
                    node = { type: "BinaryExpression", operator: operator, left: node, right: nodeR };
                } else if (/[a-z]/.test(tokens[i].value) ||
                    /[A-Z]/.test(tokens[i].value) ||
                    /[(]/.test(tokens[i].value)) {
                    // Don't increment bc we will confirm the the value on the way down the stack
                    let nodeR = root();
                    node = { type: "BinaryExpression", operator: operator, left: node, right: nodeR };
                } else {
                    return node;
                }

            }

            return node;
        }

        function root() {
            let node = exponent();

            // Right associative
            // Will check the depth of the tree before unstacking
            if (i < tokens.length) {
                // There are two sithuations here
                // Implicit and non-implicit
                if (tokens[i].value === "√") {
                    i++;
                    let nodeR = root();

                    if (node) {
                        node = { type: "BinaryExpression", operator: "*", left: node, right: { type: "Root", index: { type: "NumberLiteral", value: "2" }, radicand: nodeR } };
                    } else {
                        node = { type: "Root", index: { type: "NumberLiteral", value: "2" }, radicand: nodeR };
                    }

                }

            }


            return node;
        }

        function exponent() {
            let node = match();

            // Right associative
            // Will check the depth of the tree before unstacking
            if (i < tokens.length) {

                if (tokens[i].value === "^") {
                    i++;
                    let nodeR = exponent();
                    node = { type: "Exponentiation", base: node, exponent: nodeR };
                }

            }
            return node;
        }

        function match() {

            if (i < tokens.length && tokens[i].type === "NumberLiteral") {
                i++;
                return tokens[i - 1];
            }

            if (i < tokens.length && tokens[i].type === "Identifier") {
                i++;
                return tokens[i - 1];
            }

            if (i < tokens.length && tokens[i].type === "Operator") {

                if (tokens[i].value === "(") {
                    i++;
                    let tree = subtraction();

                    if (tokens[i].value === ")") {
                        i++;
                        return tree;
                    } else {
                        return new Error("Missing closing parenthesis: )")
                    }

                }

            }

            return null;
        }

        return subtraction();
    }

}


module.exports = {
    Parser,
}
