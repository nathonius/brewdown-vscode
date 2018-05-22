'use strict'

const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('brewdown');

function activate(context) {
    const options = {
        "pageSize": config.get('pageSize')
    };
    if(config.get('twoCol')) {
        options.style = 'two-col';
    }
    return {
        extendMarkdownIt(md) {
            return md.use(require('brewdown'), options);
        }
    };
}
exports.activate = activate;