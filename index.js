const core = import('@actions/core');
const { exec } = import('@actions/exec');
const path = import('path');
import process from 'process'

async function run() {
  try {
    // get input
    const nccArgs = core.getInput('ncc_args');
    const src = path.resolve(path.join(process.cwd(), core.getInput('src')));
 

    core.startGroup(`Compiling ${src}`);

    // install dependencies
    await exec('npm', ['install']);

    // compile code
    const compileArgs = ['@vercel/ncc', 'build', src];

    if (nccArgs) {
      const args = nccArgs.split(',').map(c => c.trim());
      compileArgs.push(...args);
    }

    await exec('npx', compileArgs);

    core.endGroup(`Compiling ${src}`);

    core.info('Compiled successfully 📦 🎉 ');
  } catch (error) {
    core.setFailed(`ncc failed! ${error.message}`);
  }
}

run();
