'use strict'

function activate(context) {
    return {
        extendMarkdownIt(md) {
            return md.use(require('brewdown'));
        }
    };
}
exports.activate = activate;