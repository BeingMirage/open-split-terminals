# Open Split Terminals

A minimal VS Code extension allowing you to select multiple folders in Explorer and open them as split panes within the same Integrated Terminal.

## Features
Select 2 or more folders in the VS Code Explorer, right-click, and select "Open in Split Integrated Terminals".
This command splits your terminal pane sequentially into the selected folders using automated `cd` commands.

## Requirements
- VS Code `^1.74.0`
- Folder selections only.

## Dev Setup
Run the following in the project root:
```bash
npm install
npm run compile
```

To debug, press `F5` in VS Code to run in an Extension Development Host.

## Packging
Produced using the `vsce` packaging tool.
```bash
npm install -g @vscode/vsce
vsce package
```
