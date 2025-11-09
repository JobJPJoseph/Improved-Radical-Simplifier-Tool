class Simplifier {
  constructor() {}

  traverseTree(tree=null) {
    if (!tree) return null;

    if (tree.type === "NumberLiteral" || tree.type === "Identifier") return tree;

    if (tree.type && tree.type === "BinaryExpression") {
      // Decompose into NumberLiteral or Identifier first
      tree.left = this.traverseTree(tree.left);
      tree.right = this.traverseTree(tree.right);
      let node = this.simplifyBinary(tree);
      return node;
    }

    if (tree.type && tree.type === "Exponentiation") {
      // Our base will always be either a NumberLiteral || Identifier
      tree.base = this.traverseTree(tree.base);

      // We need to cover for chaining context
      tree.exponent = this.traverseTree(tree.exponent);
      return this.simplifyExponent(tree);
    }

    if (tree.type && tree.type === "Root") {
      // simplifiy the radicand
      tree.radicand = this.traverseTree(tree.radicand);
      return this.simplifyRoot(tree.radicand);
    }

  }

  simplifyBinary(tree) {
    if (/[-]/.test(tree.operator)) {
      // a - b => a + (-1 * b);
      let neg = { type: "NumberLiteral", value: String(-1) };
      let branch = { type: "BinaryExpression", operator: "*", left: neg, right: tree.right };
      let newTree = { type: "BinaryExpression", operator: "+", left: tree.left, right: branch };
      return this.traverseTree(newTree);
    }

    if (/[*]/.test(tree.operator)) {
      return this.simplifyMulti(tree);
    }

    if (/[+]/.test(tree.operator)) {
      return this.simplifyAdd(tree);
    }

  }

  simplifyMulti(tree) {
    // Flatten the node
    let flattenedTree = this.flattenMulti(tree);
    // Next we got to make an object that is descriptive of the node
    let norm = this.normalizeTerm(flattenedTree);
    if (!norm) return this.traverseTree(this.rebuildAstFromTree(tree));

    // // Now we need to build an ast from norm
    let ast = this.buildAstFromNorm(norm);

    return ast;
  }

  flattenMulti(tree) {
    if (tree && /[*]/.test(tree.operator)) {
      return [...this.flattenMulti(tree.left), ...this.flattenMulti(tree.right)];
    } else {
      return [tree];
    }

  }

  normalizeTerm(nodes) {
    let norm = new Map();
    norm.coeff = String(1);
    norm.vars = new Map();
    norm.root = { type: "NumberLiteral", value: String(1) };

    for (let i = 0; i < nodes.length; i++) {
      let obj = nodes[i];

      if (obj.type === "NumberLiteral") {
        norm.coeff = String(Number(norm.coeff) * Number(obj.value));
      }

      if (obj.type === "Identifier") {

        if (norm.vars.get(obj.value)) {
          norm.vars.set(obj.value, String(Number(norm.vars.get(obj.value)) + 1));
        } else {
          norm.vars.set(obj.value, "1");
        }

      }

      if (obj.type === "Exponentiation") {

        if (obj.base.type === "NumberLiteral") {
          norm.coeff = String(Number(norm.coeff) * this.simplifyExponent(obj));
        }

        if (obj.base.type === "Identifier") {
          if (norm.vars.get(obj.base.value)) {
            norm.vars.set(obj.base.value, String(Number(norm.vars.get(obj.base.value)) + Number(obj.exponent.value)));
          } else {
            norm.vars.set(obj.base.value, obj.exponent.value);
          }

        }

      }

      if (obj.type === "Root") {
        let l;

        if (norm.root && norm.root.type === "NumberLiteral" && norm.root.value === "1") {
          l = norm.root;
        } else {
          l = norm.root.radicand;
        };

        let binExp = {
          type: "BinaryExpression",
          operator: "*",
          left: l,
          right: obj.radicand
        };

        let flattenedRoot = this.flattenMulti(binExp);
        let tempNorm = this.normalizeTerm(flattenedRoot);
        let num = this.simplifyRoot({ type: "NumberLiteral", value: tempNorm.coeff });
        let leftOvers = [];

        if (num) {
          if (num.type === "NumberLiteral") norm.coeff = String( Number(norm.coeff) * Number(num.value) );

          if (num.type === "BinaryExpression") {
            norm.coeff = String( Number(norm.coeff) * Number(num.left.value) );
            leftOvers.push(num.right.radicand);
          }

          if (num.type === "Root") {
            if (num.radicand.value !== "1") leftOvers.push(num.radicand);
          }
        }

        for (let variables of tempNorm.vars) {
          let squaredNode = this.squareVariable({type: "Exponentiation", base: { type: "Identifier", value: variables[0] }, exponent: { type: "NumberLiteral", value: variables[1] } });

          if (variables[1] === "1") {
            leftOvers.push({ type: "Identifier", value: variables[0] });
          } else {
            if (squaredNode.type === "Identifier") {

              if (norm.vars.get(variables[0])) {
                norm.vars.set(variables[0], String( Number(norm.vars.get(variables[0])) + Number("1") ) );
              } else {
                norm.vars.set(variables[0], "1");
              }

            }

            if (squaredNode.type === "BinaryExpression") {

              // √x^n => x√x
              if (squaredNode.left.type === "Identifier") {
                if (norm.vars.get(variables[0])) {
                  norm.vars.set(variables[0], String ( Number(norm.vars.get(variables[0])) + Number("1") ));
                } else {
                  norm.vars.set(variables[0], "1");
                }

                leftOvers.push(squaredNode.right.radicand);
              }

              // √x^n => x^n√x
              if (squaredNode.left.type === "Exponentiation") {
                if (norm.vars.get(variables[0])) {
                  norm.vars.set(variables[0], String( Number(norm.vars.get(variables[0])) + Number(squaredNode.left.exponent.value) ));
                } else {
                  norm.vars.set(variables[0], squaredNode.left.exponent.value);
                }

                leftOvers.push(squaredNode.right.radicand);
              }
            }

            // x^n
            if (squaredNode.type === "Exponentiation") {
              if (norm.vars.get(variables[0])) {
                norm.vars.set(variables[0], String( Number(norm.vars.get(variables[0])) + Number(squaredNode.exponent.value) ));
              } else {
                norm.vars.set(variables[0], squaredNode.exponent.value);
              }

            }

          }

        }

        if (!leftOvers.length) {
          norm.root = { type: "NumberLiteral", value: 1 };
        } else {
          let arr = leftOvers.reduce((l, r) => {
            return {
              type: "BinaryExpression",
              operator: "*",
              left: l,
              right: r
            }
          });

          let rad = {
            type: "Root",
            index: { type: "NumberLiteral", value: "2" },
            radicand: arr
          }

          norm.root = rad;
        }

      }

      if (obj.type === "BinaryExpression") {
        return null;
      }

    }

    return norm;
  }

  rebuildAstFromTree(tree) {
    let flattenL = this.flattenAdd(tree.left);
    let flattenR = this.flattenAdd(tree.right);

    let termsL = [];
    let termsR = [];

    // Flatten Implicits!!!

    // Now splits it by term
    for (let i = 0; i < flattenL.length; i++) {
      termsL.push(this.flattenMulti(flattenL[i]));
    }

    for (let j = 0; j < flattenR.length; j++) {
      termsR.push(this.flattenMulti(flattenR[j]));
    }

    let terms = [];

    for (let k = 0; k < termsR.length; k++) {
      let nodeR = termsR[k];

      for (let p =  0; p < termsL.length; p++) {
        let nodeL = termsL[p];

        terms.push(this.buildAstFromNorm(this.normalizeTerm([...nodeL, ...nodeR])));
      }

    }

    return terms.reduce((l, r) => {
      return {
        type: "BinaryExpression",
        operator: "+",
        left: l,
        right: r
      }
    });
  }

  buildAstFromNorm(tree) {
    if (tree.coeff === 0) return { type: "NumberLiteral", value: "0" };

    let pieces = [];

    if (Number(tree.coeff) !== 1) {
      pieces.push({ type: "NumberLiteral", value: tree.coeff });
    }

    let identifiers = tree.vars.entries()

    for (let i of identifiers) {
      let [key, exp] = i;
      if (Number(exp) === 1) {
        pieces.push({ type: "Identifier", value: key });
      }

      if (Number(exp) > 1) {
        let node = { type: "Exponentiation", base: { type: "Identifier", value: key }, exponent: { type: "NumberLiteral", value: String(exp) } };
        pieces.push(node);
      }

    }

    if (tree && tree.root && tree.root.type === "Root") {
      pieces.push(tree.root);
    }

    // When the coefficient is 1 and no variables
    if (pieces.length === 0) return { type: "NumberLiteral", value: "1" };

    if (pieces.length === 1) return pieces[0];

    return pieces.reduce((l, r) => {
      return { type: "BinaryExpression", operator: "*", left: l, right: r };
    });
  }

  simplifyAdd(tree) {
    let flattenedTree = this.flattenAdd(tree);

    let map = new Map();
    let forRebuilding = [];

    // Note: This strat is specifically for simplifyAdd
      // Based on the rules, we add up the coefficients if the variable and radicals are the same.
    for (let i = 0; i < flattenedTree.length; i++) {
      let term = flattenedTree[i];
      let flattenedMulttTree = this.flattenMulti(term);

      let norm = this.normalizeTerm(flattenedMulttTree);

      let key = this.convertObjectIntoKey(norm);

      if (map.get(key)) {
        let num = Number(map.get(key).coeff);
        map.get(key).coeff = String(num + Number(norm.coeff));
      } else {
        map.set(key, { coeff: norm.coeff,  node: norm });
      }

    }

    for (let n of map) {
      forRebuilding.push({ coeff: n[1].coeff, vars: n[1].node.vars, root: n[1].node.root });
    }

    let ast = forRebuilding.map((node) => {
      return this.buildAstFromNorm(node);
    });

    if (ast.length === 1) return ast[0];

    if (ast[1].type === "NumberLiteral" && ast[1].value === "0") return ast[0];
    if (ast[0].type === "NumberLiteral" && ast[0].value === "0") return ast[1];


    return ast.reduce((l, r) => {
      return { type: "BinaryExpression", operator: "+", left: l, right: r };
    });
  }

  flattenAdd(tree) {
    if (tree && /[+]/.test(tree.operator)) {
      return [...this.flattenAdd(tree.left), ...this.flattenAdd(tree.right)];
    } else {
      return [tree];
    }
  }

  convertObjectIntoKey(tree) {
    let keys = [];

    let variables = this.sortVars(tree.vars.entries());

    for (let i = 0; i < variables.length; i++) {
      let v = variables[i];
      keys.push(`${v[0]}^${String(v[1])}`);
    }

    keys.push(`√${this.collectValuesUnderRadical(tree.root)}`);

    let key = keys.join("");
    return key;
  }

  sortVars(variables) {
    let vars = [...variables];

    let wall = 0;

    while (wall < vars.length) {
      let i = wall;
      let temp = vars[i];

      while (i > 0 && vars[i - 1][0] > temp[0][0]) {
        vars[i] = vars[i - 1];
        i--;
      }

      vars[i] = temp;
      wall++;
    }

    return vars;
  }

  simplifyExponent(tree) {
    if (tree.base.type === "NumberLiteral") {

      let b = Number(tree.base.value);
      let e = Number(tree.exponent.value);

      if (e === 0) return { type: "NumberLiteral", value: String(1) };
      if (e === 1) return { type: "NumberLiteral", value: tree.base.value };

      let num = this.power(b, e);

      return { type: "NumberLiteral", value: String(num) };
    }

    if (tree.base.type === "Identifier") {

      let e = Number(tree.exponent.value);

      if (e === 0) return { type: "NumberLiteral", value: String(1) };
      if (e === 1) return { type: "Identifier", value: tree.base.value };

    }

    return tree;
  }

  power(base, exp) {
    let result = base

    while (exp > 1) {
      result = result * base;
      exp--;
    }

    return result;
  }

  simplifyRoot(tree) {
    if (tree && tree.type === "Identifier") {
      // We can't actually do anything with this.
      return {
        type: "Root",
        index: { type: "NumberLiteral", value: "2" },
        radicand: { type: "Identifier", value: tree.value }
      };
    }

    if (tree && tree.type === "NumberLiteral") {
      return this.squareNumberLiteral(tree);
    }

    if (tree && tree.type === "Exponentiation") {

      if (tree.base.type === "NumberLiteral") {
        let num = this.power(Number(tree.base.value), Number(tree.exponent.value));
        return this.simplifyRoot({ type: "NumberLiteral", value: String(num) });
      }

      if (tree.base.type === "Identifier") {
        return this.squareVariable(tree);
      }

    }

    let binExp = {
      type: "BinaryExpression",
      operator: "*",
      left: { type: "NumberLiteral", value: "1" },
      right: {
        type: "Root",
        index: { type: "NumberLiteral", value: "2" },
        radicand: tree,
      }
    }

    return this.simplifyMulti(binExp);
  }

  squareNumberLiteral(node) {
    let num = Number(node.value);

    let coefficient = 1;

    for (let i = 1; i <= Math.sqrt(num); i++) {
      if (num % (i * i) === 0) {
        coefficient = i * i;
      }
    }

    let wholeNumber = Math.sqrt(coefficient);
    let leftOver = num / coefficient;

    if (leftOver <= 1 && wholeNumber > 1) {
      // num => num
      // Means we successfully squared it
      return { type: "NumberLiteral", value: String(wholeNumber)};
    } else if (wholeNumber === 1) {
      // num => √num
      // Means we unsuccessfully squared it
      return { type: "Root", index: { type: "NumberLiteral", value: String(2) }, radicand: { type: "NumberLiteral", value: String(leftOver)} };
    } else {
      // num => num√num
      return {
        type: "BinaryExpression",
        operator: "*",
        left: { type: "NumberLiteral", value: String(wholeNumber) },
        right: { type: "Root", index: { type: "NumberLiteral", value: String(2) }, radicand: { type: "NumberLiteral", value: String(leftOver)} }
      }
    }

  }

  squareVariable(tree) {
    let num = Number(tree.exponent.value);
    let wholeNumber = 0;

    while (num >= 2) {
      num = num - 2;
      wholeNumber++;
    }

    if (num === 1) {
      // A variable under the radical
      if (wholeNumber === 1) {
        // A single variable
        return {
          type: "BinaryExpression",
          operator: "*",
          left: { type: "Identifier", value: tree.base.value },
          right: {
            type: "Root",
            index: { type: "NumberLiteral", value: String(2) },
            radicand: { type: "Identifier", value: tree.base.value }
          }
        }
      } else if (wholeNumber > 1) {
        //
        return {
          type: "BinaryExpression",
          operator: "*",
          left: {
            type: "Exponentiation",
            base: { type: "Identifier", value: tree.base.value },
            exponent: { type: "NumberLiteral", value: String(wholeNumber) }
          },
          right: {
            type: "Root",
            index: { type: "NumberLiteral", value: String(2) },
            radicand: { type: "Identifier", value: tree.base.value }
          }
        }

      } else {
        // Already simplified
        return tree;
      }

    } else {
      // num is 0 so no x under the radical
      if (wholeNumber === 0) {
        // no x, already simplified
        return tree;
      } else if (wholeNumber === 1) {
        // x is not raised to anything
        return { type: "Identifier", value: tree.base.value };
      } else {
        // x raised to a number
        return {
          type: "Exponentiation",
          base: { type: "Identifier", value: tree.base.value },
          exponent: {
            type: "NumberLiteral",
            value: String(wholeNumber)
          }
        }
      }
    }
  }

  collectValuesUnderRadical(tree) {
    // We are essentially traversing the tree
    let str = "";

    function collect(branch) {
      if (!branch) return null;

      if (branch.type === "NumberLiteral" || branch.type === "Identifier") str += branch.value;

      if (branch.type === "BinaryExpression") {
        collect(branch.left);
        collect(branch.right);
      }

      if (branch.type === "Root") {
        collect(branch.radicand);
      }
    }

    collect(tree);

    return str;
  }

}

module.exports = {
    Simplifier
}
