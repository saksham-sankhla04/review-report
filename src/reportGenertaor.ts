import * as vscode from "vscode";
import { SEVERITIES } from "./constants";
import { Finding } from "./types";

export async function generateReport(findings: Finding[]) {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    vscode.window.showErrorMessage("Open a workspace first.");
    return;
  }

  const report = buildMarkdownReport(findings);
  const reportUri = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    "REVIEW_REPORT.md"
  );

  await vscode.workspace.fs.writeFile(reportUri, Buffer.from(report, "utf8"));

  vscode.window.setStatusBarMessage(
    `TraceReview: ${findings.length} findings synced`,
    3000
  );
}

function buildMarkdownReport(findings: Finding[]) {
  let md = `# Code Review Report\n\n`;
  md += `Generated: ${new Date().toLocaleString()}\n\n`;

  md += `## Summary\n\n`;
  md += `- Total Findings: ${findings.length}\n`;

  for (const severity of SEVERITIES) {
    const count = findings.filter((f) => f.severity === severity).length;
    md += `- ${severity}: ${count}\n`;
  }

  md += `\n---\n\n`;

  const grouped = new Map<string, Finding[]>();

  for (const finding of findings) {
    if (!grouped.has(finding.file)) {
      grouped.set(finding.file, []);
    }

    grouped.get(finding.file)!.push(finding);
  }

  for (const [file, items] of grouped) {
    md += `## ${file}\n\n`;

    for (const item of items) {
      md += `### ${item.type} - ${item.severity}\n\n`;
      md += `- Line: ${item.line}\n`;
      md += `- Finding: ${item.message}\n\n`;
    }

    md += `---\n\n`;
  }

  return md;
}
