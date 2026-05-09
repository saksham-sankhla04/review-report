import * as vscode from "vscode";
import { SEVERITIES, TYPES } from "../constants";

export async function addReviewFinding(onComplete: () => Promise<void>) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("Open a file first.");
    return;
  }

  const type = await vscode.window.showQuickPick(TYPES, {
    placeHolder: "Select review finding type",
  });

  if (!type) {
    return;
  }

  const severity = await vscode.window.showQuickPick(SEVERITIES, {
    placeHolder: "Select severity",
  });

  if (!severity) {
    return;
  }

  const message = await vscode.window.showInputBox({
    prompt: "Enter review finding",
    placeHolder: "Example: Button breaks on mobile screen",
  });

  if (!message) {
    return;
  }

  const currentLine = editor.selection.active.line;
  const insertPosition = new vscode.Position(currentLine, 0);
  const commentText = getCommentText(
    editor.document.languageId,
    type,
    severity,
    message
  );

  await editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, commentText);
  });

  await editor.document.save();
  await onComplete();

  vscode.window.showInformationMessage("TraceReview finding added.");
}

function getCommentText(
  languageId: string,
  type: string,
  severity: string,
  message: string
) {
  const text = `${type}[${severity}]: ${message}`;

  if (languageId === "typescriptreact" || languageId === "javascriptreact") {
    return `{/* ${text} */}\n`;
  }

  return `// ${text}\n`;
}
