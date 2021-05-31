const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const RequiredQuestion = require('./requiredQuestion');

const configFile = path.join(process.cwd(), 'config.json');

const yesOrNoRequirement = answer => (
  answer === 'Y'.toUpperCase() ||
  answer === 'YES'.toUpperCase() ||
  answer === 'N'.toUpperCase() ||
  answer === 'NO'.toUpperCase()
);

const config = async () => {
  const config = {}
  const requiredQuestion = new RequiredQuestion();

  config.workspace = (await requiredQuestion.askQuestion(
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
  )).replace(/'/g, '').replace(/\\/g, '');

  const customEditor = await requiredQuestion.askQuestion(
    `\nNinit runs ${chalk.blueBright('Visual Studio Code')} by default\nDo you want to set up a different code editor? (Y/N): `,
    undefined,
    { customRequirement: yesOrNoRequirement }
  );

  const configCustomEditor =
    customEditor.toUpperCase() === 'Y'.toUpperCase() ||
    customEditor.toUpperCase() === 'YES'.toUpperCase();

  if (configCustomEditor) {
    config.customEditorScript = await requiredQuestion.askQuestion(
      `\nEnter your editor's run script: `
    );
  }

  requiredQuestion.close();

  fs.writeFile(
    configFile,
    JSON.stringify(config, undefined, 2),
    () => {
      console.log(
        chalk.bold.green('\nNinit'),
        chalk.greenBright('has been correctly configurated!')
        );
    }
  );
}


module.exports = config;
