const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

const configFile = path.join(process.cwd(), 'config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const requiredQuestion = (query, callback, options = { customRequirement: () => true }) => {
  const { customRequirement } = options;

  const recursiveQuestion = resolve => {
    rl.question(query, answer => {
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

const yesOrNoRequirement = answer => (
  answer === 'Y'.toUpperCase() ||
  answer === 'YES'.toUpperCase() ||
  answer === 'N'.toUpperCase() ||
  answer === 'NO'.toUpperCase()
);

const config = async () => {
  const config = {}

  config.workspace = await requiredQuestion(
    'Workspace directory (you can drag your folder here and the path will be copied): ',
    undefined,
    {
      customRequirement: async answer => {
        try {
          await fs.promises.access(answer);
          return true;
        } catch (err) {
          return false;
        }
      }
    }
  );

  const customEditor = await requiredQuestion(
    `\nNinit runs ${chalk.blueBright('Visual Studio Code')} by default\nDo you want to set up a different code editor? (Y/N): `,
    undefined,
    { customRequirement: yesOrNoRequirement }
  );

  const configCustomEditor =
    customEditor.toUpperCase() === 'Y'.toUpperCase() ||
    customEditor.toUpperCase() === 'YES'.toUpperCase();

  if (configCustomEditor) {
    config.customEditorScript = await requiredQuestion(
      `\nEnter your editor's run script: `
    );
  }

  rl.close();

  fs.writeFile(
    configFile,
    JSON.stringify(config, undefined, 2),
    () => console.log(chalk.bold.green('\nNinit ') + chalk.greenBright('has been correctly configurated!'))
  );
}


module.exports = config;
