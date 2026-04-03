"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Shell-safe path quoting for sending commands to terminals.
 * Encloses the path in quotes to handle spaces and special characters.
 */
function quotePath(dirPath) {
    // Basic quote wrapper; if the path contains double quotes itself, escape them.
    return `"${dirPath.replace(/"/g, '\\"')}"`;
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('open-split-terminals.openSplitTerminals', async (uri, selectedUris) => {
        // Check if selected elements are sufficient
        if (!selectedUris || selectedUris.length < 2) {
            vscode.window.showInformationMessage('Please select 2 or more folders to open in split terminals.');
            return;
        }
        // Verify they are actually directories
        const folders = [];
        for (const u of selectedUris) {
            try {
                const stat = await vscode.workspace.fs.stat(u);
                if (stat.type === vscode.FileType.Directory) {
                    folders.push(u);
                }
            }
            catch (e) {
                // Ignore elements we can't stat
            }
        }
        if (folders.length < 2) {
            vscode.window.showInformationMessage('Please select 2 or more folders to open in split terminals.');
            return;
        }
        // 1. Create the base (first) terminal with the proper cwd
        const firstFolderUri = folders[0];
        const firstFolderName = path.basename(firstFolderUri.fsPath);
        let currentTerminal = vscode.window.createTerminal({
            name: firstFolderName,
            cwd: firstFolderUri.fsPath
        });
        currentTerminal.show(false);
        // 2. Open split terminals for remaining selected folders
        for (let i = 1; i < folders.length; i++) {
            const folderUri = folders[i];
            const folderName = path.basename(folderUri.fsPath);
            // Execute VS Code's built-in terminal split command
            await vscode.commands.executeCommand('workbench.action.terminal.split');
            // The newly split terminal becomes the active one
            const newTerminal = vscode.window.activeTerminal;
            if (!newTerminal) {
                continue;
            }
            // Wait briefly so the split terminal is fully initialized and ready
            await new Promise(resolve => setTimeout(resolve, 500));
            // Send a generic cd command instead of relying on TerminalLocation.parentTerminal
            // per the requirements "wait briefly... cd into the correct folder".
            newTerminal.sendText(`cd ${quotePath(folderUri.fsPath)}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map