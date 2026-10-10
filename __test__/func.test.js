import { jest } from '@jest/globals';

jest.unstable_mockModule('@actions/core', () => ({
    getInput: jest.fn(),
    startGroup: jest.fn(),
    endGroup: jest.fn(),
    info: jest.fn(),
    setFailed: jest.fn(),
}));

jest.unstable_mockModule('@actions/exec', () => ({
    exec: jest.fn(),
}));

jest.unstable_mockModule('path', () => ({
    default: { resolve: jest.fn() },
}));

const core = await import('@actions/core');
const exec = await import('@actions/exec');
const { default: path } = await import('path');
const { default: run_compile } = await import('../func.js');

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

    it('test args', async () => {
        core.getInput.mockImplementation((name) => {
            if (name === 'ncc_args') return '-o testdist, --debug, --no-cache';
            if (name === 'src') return 'src/index.js';
        });

        path.resolve.mockReturnValue('/path/to/src/index.js');

        run_compile();

        expect(await exec.exec).toHaveBeenNthCalledWith (2,'npx', ['@vercel/ncc', 'build', '/path/to/src/index.js', '-o testdist', '--debug', '--no-cache']);
    });
});