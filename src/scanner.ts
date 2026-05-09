import * as vscode from "vscode";
import { FINDING_REGEX } from "./constants";
import { Finding } from "./types";

export async function scanFindings(): Promise<Finding[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return [];
  }

  const files = await vscode.workspace.findFiles(
    "**/*.{ts,tsx,js,jsx}",
    "**/{node_modules,dist,build,.next,out}/**"
  );

  const findings: Finding[] = [];

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);

    for (let i = 0; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      const match = text.match(FINDING_REGEX);

      if (match) {
        findings.push({
          file: vscode.workspace.asRelativePath(file),
          line: i + 1,
          type: match[1].toUpperCase(),
          severity: match[2] || "Medium",
          message: match[3].trim(),
          uri: file,
        });
      }
    }
  }

  return findings;
}
