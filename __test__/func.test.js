const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');

const run_compile = require ('../func.cjs');

jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    info: jest.fn(),
    setFailed: jest.fn(),
}));

jest.mock('@actions/exec', () => ({
    exec: jest.fn(),
}));

jest.mock('path', () => ({
     resolve: jest.fn(),
}));




describe('run', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('test exec calls', async () => {

        core.getInput.mockImplementation((name) => {
            if (name === 'ncc_args') return '';
            if (name === 'src') return './index.js';
        });
        path.resolve.mockReturnValue('/my/workdir/index.js');
        

        run_compile();

        expect(core.startGroup).toHaveBeenCalledWith('Compiling /my/workdir/index.js');
        expect(await exec.exec).toHaveBeenCalledTimes(2);
        expect(await exec.exec).toHaveBeenNthCalledWith (1,'yarn', ['install', "--no-save"]);
        expect(await exec.exec).toHaveBeenNthCalledWith (2,'npx', ['@vercel/ncc', 'build', '/my/workdir/index.js']);
        expect(core.endGroup).toHaveBeenCalledWith('Compiling /my/workdir/index.js');
        expect(core.info).toHaveBeenCalledWith('Compiled successfully 📦 🎉 ');
    });

    it('test handle errors', async () => {
        core.getInput.mockImplementation((name) => {
            if (name === 'ncc_args') return '--debug';
            if (name === 'src') return 'src/index.js';
        });

        path.resolve.mockReturnValue('/path/to/src/index.js');
        //path.join.mockReturnValue('src/index.js');

        const errorMessage = 'Test error';
        exec.exec.mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });

        await run_compile();
        
        expect(core.setFailed).toHaveBeenCalledWith(`ncc failed! ${errorMessage} (src: /path/to/src/index.js, ncc_args: --debug)`);
    });
});