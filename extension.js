'use strict'

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const Markdown = require('markdown-it');
const brewdown = require('brewdown');
const ncp = require('ncp').ncp;

ncp.limit = 2;

const config = vscode.workspace.getConfiguration('brewdown');

function activate(context) {
    const options = {
        "pageSize": config.get('pageSize')
    };
    if(config.get('twoCol')) {
        options.style = 'two-col';
    }

    function brew() {
        const editor = vscode.window.activeTextEditor;
        const doc = editor.document;

        if(!editor || doc.languageId != 'markdown') {
            vscode.window.showErrorMessage('Brewdown: No valid Markdown file');
            return;
        }

        else if(doc.isUntitled) {
            vscode.window.showErrorMessage('Brewdown: Please save the file first');
            return;
        }

        if(doc.isDirty) {
            doc.save();
        }

        vscode.window.setStatusBarMessage(`Printing '${path.basename(doc.fileName)}' to HTML ...`, 1000);
        let outPath = doc.fileName.replace(/\.\w+?$/, `.html`);
        outPath = outPath.replace(/^([cdefghij]):\\/, function (match, p1) {
            return `${p1.toUpperCase()}:\\`; // Capitalize drive letter
        });
        if(!outPath.endsWith('.html')) {
            outPath += '.html';
        }

        const md = new Markdown().use(brewdown, options);
        const body = md.render(doc.getText());
        const html = `<!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            ${body}
        </body>
        </html>`;

        fs.writeFile(outPath, html, 'utf-8', function (err) {
            if (err) { console.log(err); }
        });

        const assetPath = path.join(vscode.extensions.getExtension('officerhalf.brewdown-vscode').extensionPath, 'brewdown-assets');
        ncp(assetPath, path.dirname(outPath), (err) => {
            if(err) {
                console.error(err);
            }
        });
    }

    context.subscriptions.push(vscode.commands.registerCommand('brewdown.render', brew));

    return {
        extendMarkdownIt(md) {
            return md.use(brewdown, options);
        }
    };
}
exports.activate = activate;