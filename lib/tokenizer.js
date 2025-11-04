class Tokenizer {

    constructor(pattern) {
        this.rules = pattern;
    }

    getTokens(input) {
        let tokens = [];
        let match;

        // exec remembers where we left off
        while ((match = this.rules.exec(input)) !== null) {

            // Note: "-" always needs to be first or last to be declared for it to work properly
            if (/\d+/.test(match[0])) {
                tokens.push({ type: 'NumberLiteral', value: match[0] });
            } else if (/[a-z]|[A-Z]/.test(match[0])) {
                tokens.push({ type: 'Identifier', value: match[0] });
            } else if (/[-/√/^/-/+/(/)/\/*]/.test(match[0])) {
                tokens.push({ type: "Operator", value: match[0] });
            }
        }

        return tokens;
    }

}

module.exports = {
    Tokenizer
}
