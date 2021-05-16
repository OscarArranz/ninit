#!/usr/bin/env node

const program = require('caporal');
const chalk = require('chalk');

const printTitle = () => {
  console.log(`${chalk.green('************************************')}
${chalk.green('*')} ${chalk.bold.green('Ninit')} v0.0.1                     ${chalk.green('*')}
${chalk.green('************************************')}\n`);
}

program
  .version('0.0.1')
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

    console.clear();
  });

program.parse(process.argv);