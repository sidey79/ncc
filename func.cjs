const core = require('@actions/core');
const { exec } = require('@actions/exec');
const path = require('path');
const process = require('process');

async function run_compile() {
    // initialize src
    let src = '';
    let nccArgs = '';
    try {
      // get input
      nccArgs = core.getInput('ncc_args');
      src = path.resolve(process.cwd(), core.getInput('src'));
      
      core.startGroup(`Compiling ${src}`);
  
      // install dependencies
      await exec('npm', ['install', "--no-save"]);
  
      // compile code
      const compileArgs = ['@vercel/ncc', 'build', src];
  
      if (nccArgs) {
        const args = nccArgs.split(',').map(arg => arg.trim());
        compileArgs.push(...args);
      }
  
      await exec('npx', compileArgs);
  
      core.endGroup(`Compiling ${src}`);
  
      core.info('Compiled successfully 📦 🎉 ');
    } catch (error) {
      core.setFailed(`ncc failed! ${error.message} (src: ${src}, ncc_args: ${nccArgs})`);
      //core.setFailed(`ncc failed! ${error.message}`);
    }
  }

  module.exports = run_compile;
