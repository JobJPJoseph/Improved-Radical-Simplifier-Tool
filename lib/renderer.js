class Renderer {
  constructor() {}

  prettyPrint(tree) {
    let expression = "";

    function traverseTree(branch) {
      if (!branch) return null;

      if (branch.type === "NumberLiteral" || branch.type === "Identifier") expression += branch.value;

      // BinaryExpressions
      if (branch.type === "BinaryExpression") {

        traverseTree(branch.left);
        addBinaryExpression(branch);
        traverseTree(branch.right);

        return;
      }

      // Exponents
      if (branch.type === "Exponentiation") {
        expression += branch.base.value;
        expression += "^";
        // traverse on the exponent
        traverseTree(branch.exponent);
      }

      // Roots
      if (branch.type === "Root") {
        // Don't for get add the (
        expression += "√(";
        traverseTree(branch.radicand);


        // closing parenthesis )
        expression += ")";
        return ;
      }

    }

    function addBinaryExpression(branch) {

      if (branch && /[+]/.test(branch.operator)) {
        expression += " + ";
      }

      if (branch && /[*]/.test(branch.operator)) {
        // We are using implicits
        // let symbol = " * "; not needed
        return;
      }

    }

    traverseTree(tree);

    return expression;
  }

}

module.exports = {
    Renderer,
}
