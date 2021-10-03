/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 630:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 429:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(630);
const { exec } = __nccwpck_require__(429);
const path = __nccwpck_require__(622);

async function run() {
  try {
    // get input
    const nccArgs = core.getInput('ncc_args');
    const allowUnrelated = core.getInput('allow_unrelated');
    const src = path.resolve(path.join(process.cwd(), core.getInput('src')));
 
    // pull latest
    await exec('git', ['pull', 'origin', inputBranch, allowUnrelated ? '--allow-unrelated-histories' : '']);

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

})();

module.exports = __webpack_exports__;
/******/ })()
;