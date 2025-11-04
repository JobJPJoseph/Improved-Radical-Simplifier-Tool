const chai = require('chai');
const expect = chai.expect;

const { User } = require('../lib/userInput');

describe("User", function () {

    it("should declare a class called User", function () {
        expect(User).to.exist;
    });

    let user;
    before(function () {
        user = new User();
    });

    describe('getInput', function () {
        // Make sure it works

        it("should return a string", async function () {
            this.timeout(20000);
            let input = await user.getInput();
            return expect(input).to.be.a('string');
        });

        it('should replce every instance of rad or sqrt with the symbol √ also know as 8730', async function () {
            this.timeout(20000);
            let input = await user.getInput();
            return expect(input).to.equal('√(2)');
        });

    });

});
