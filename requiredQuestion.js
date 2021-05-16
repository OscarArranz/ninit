const readline = require('readline');

class RequiredQuestion {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  askQuestion = (query, callback, options = { customRequirement: () => true }) => {
    const { customRequirement } = options;

    const recursiveQuestion = resolve => {
      this.rl.question(query, answer => {
        if (answer && customRequirement(answer.toUpperCase())) {
          if (callback) callback(answer);

          resolve(answer);
          return;
        }

        recursiveQuestion(resolve);
      });
    };

    return new Promise(recursiveQuestion);
  };

  close = () => this.rl.close();

}

module.exports = RequiredQuestion;
