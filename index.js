const core = require('@actions/core');
const { exec } = require('@actions/exec');
const github = require('@actions/github');
const path = require('path');

async function run() {
  try {
    const { pusher: { email, name } } = github.context.payload;

    // get input
    const inputBranch = core.getInput('branch');
    const commitMsg = core.getInput('commit_msg');
    const nccArgs = core.getInput('ncc_args');
    const src = path.resolve(path.join(__dirname, core.getInput('src')));

    // install dependencies
    await exec('npm', ['install']);

    // compile code
    const compileArgs = ['@zeit/ncc', 'build', src];

    if (nccArgs) {
      const args = nccArgs.split(',');
      compileArgs.push(args);
    }

    await exec('npx', compileArgs);
    
    // push dist
    await exec('git', ['config', '--local', 'user.name', name]);
    await exec('git', ['config', '--local', 'user.email', email]);
    await exec('git', ['add', 'dist/index.js']);
    await exec('git', ['commit', '-a', '-m',  commitMsg]);
    await exec('git', ['push', 'origin', `HEAD:${inputBranch}`]);

  } catch (error) {
    core.setFailed(`Failed to publish ${error.message}`);
  }
}

run();
