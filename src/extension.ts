import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Shell-safe path quoting for sending commands to terminals.
 * Encloses the path in quotes to handle spaces and special characters.
 */
function quotePath(dirPath: string): string {
    // Basic quote wrapper; if the path contains double quotes itself, escape them.
    return `"${dirPath.replace(/"/g, '\\"')}"`;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'open-split-terminals.openSplitTerminals',
        async (uri: vscode.Uri, selectedUris?: vscode.Uri[]) => {
            
            // Check if selected elements are sufficient
            if (!selectedUris || selectedUris.length < 2) {
                vscode.window.showInformationMessage('Please select 2 or more folders to open in split terminals.');
                return;
            }

            // Verify they are actually directories
            const folders: vscode.Uri[] = [];
            for (const u of selectedUris) {
                try {
                    const stat = await vscode.workspace.fs.stat(u);
                    if (stat.type === vscode.FileType.Directory) {
                        folders.push(u);
                    }
                } catch (e) {
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
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
