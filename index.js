#!/usr/bin/env node

const program = require('caporal');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const RequiredQuestion = require('./requiredQuestion');

const configFilePath = path.join(process.cwd(), 'config.json');

const printTitle = () => {
  const bar = '************************************';
  const spaces = '                   ';
  const version = 'v0.1.1';

  console.log(chalk.green(bar));
  console.log(
    chalk.green('*'),
    chalk.bold.green('Ninit'),
    version,
    spaces,
    chalk.green('*')
  );
  console.log(chalk.green(bar));
};

const getConfig = async () =>
  JSON.parse(await fs.promises.readFile(configFilePath));

const checkConfig = async () => {
  try {
    await fs.promises.access(configFilePath);
    return true;
  } catch (err) {
    console.log(
      `Couldn't find a configuration file, please run`,
      chalk.bgGreen.black('ninit --config'),
      'to configurate',
      chalk.bold.green('Ninit')
    );
    return false;
  }
};

const initializeProject = async ({ workspace, customEditorScript }) => {
  const requiredQuestion = new RequiredQuestion();

  const projectName = await requiredQuestion.askQuestion('Project name: ');
  const projectPath = path.join(workspace, projectName);
  console.log(projectPath);
  try {
    await fs.promises.access(projectPath);
  } catch (err) {
    await fs.promises.mkdir(projectPath, { recursive: true });
  }

  requiredQuestion.close();

  spawnSync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['init'], {
    cwd: projectPath,
    stdio: 'inherit',
  });

  const { main } = JSON.parse(
    await fs.promises.readFile(path.join(projectPath, 'package.json'))
  );

  await fs.promises.writeFile(path.join(projectPath, main), '');

  console.clear();
  console.log(
    chalk.blueBright(projectName),
    'has been created',
    chalk.green('successfully!'),
    'Opening code editor...'
  );

  spawn(/^win/.test(process.platform) ? 'code.cmd' : 'code', [projectPath], {
    detached: true,
  });
};

program
  .version('0.1.0')
  .argument('[workspace]', 'Workspace directory to set up project')
  .option('--config', 'Enters into the configuration mode', program.BOOLEAN)
  .action(async ({ workspace }, { config }, logger) => {
    console.clear();

    printTitle();

    if (config) {
      const config = require('./config.js');
      await config();

      return;
    }

    if (!checkConfig()) return;

    initializeProject(await getConfig());
  });

program.parse(process.argv);
