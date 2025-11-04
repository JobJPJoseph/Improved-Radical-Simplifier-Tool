const readline = require('readline');

class User {
    constructor() {}

    async getInput() {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return await new Promise((resolve) => {

            let cb = async () => {

                rl.question("Enter: => ", (input) => {
                    rl.close();

                    // we have to do a test her to search for the string rad or sqrt
                    if (input.match("rad")) {
                        resolve(input.replace(/rad/, "√"));
                    }

                    if (input.match("sqrt")) {
                        resolve(input.replace(/sqrt/, "√"));
                    }

                });

            }

            cb();
        });
    }

}

module.exports = {
    User
}
