import * as vscode from "vscode";

type Finding = {
  file: string;
  line: number;
  type: string;
  severity: string;
  message: string;
  uri: vscode.Uri;
};

const TYPES = [
  "REVIEW",
  "BUG",
  "IMPROVE",
  "REFACTOR",
  "OPTIMIZE",
  "RISK",
  "TODO",
  "FIXME",
  "SECURITY",
  "UI",
  "PERFORMANCE",
  "ACCESSIBILITY",
];

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Info"];

const FINDING_REGEX = new RegExp(
  `\\/\\/\\s*(${TYPES.join("|")})(?:\\[(${SEVERITIES.join("|")})\\])?:\\s*(.+)`,
  "i"
);

let findingsProvider: FindingsProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log("TraceReview is now active");

  findingsProvider = new FindingsProvider();

  vscode.window.registerTreeDataProvider(
    "tracereview.findingsView",
    findingsProvider
  );

  const generateReportCommand = vscode.commands.registerCommand(
    "tracereview.generateReport",
    async () => {
      await refreshFindingsAndReport();
    }
  );

  const openFindingCommand = vscode.commands.registerCommand(
    "tracereview.openFinding",
    async (finding: FindingTreeItem) => {
      if (!finding.finding) {
        return;
      }

      const document = await vscode.workspace.openTextDocument(
        finding.finding.uri
      );
      const editor = await vscode.window.showTextDocument(document);

      const position = new vscode.Position(finding.finding.line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    }
  );

  const autoGenerateOnSave = vscode.workspace.onDidSaveTextDocument(
    async (document) => {
      const allowedLanguages = [
        "typescript",
        "typescriptreact",
        "javascript",
        "javascriptreact",
      ];

      if (!allowedLanguages.includes(document.languageId)) {
        return;
      }

      await refreshFindingsAndReport();
    }
  );

  context.subscriptions.push(
    generateReportCommand,
    openFindingCommand,
    autoGenerateOnSave
  );

  refreshFindingsAndReport();
}

async function refreshFindingsAndReport() {
  const findings = await scanFindings();
  findingsProvider.refresh(findings);
  await generateReport(findings);
}

async function scanFindings(): Promise<Finding[]> {
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

async function generateReport(findings: Finding[]) {
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
  const critical = findings.filter((f) => f.severity === "Critical").length;
  const high = findings.filter((f) => f.severity === "High").length;
  const medium = findings.filter((f) => f.severity === "Medium").length;
  const low = findings.filter((f) => f.severity === "Low").length;
  const info = findings.filter((f) => f.severity === "Info").length;

  let md = `# Code Review Report\n\n`;
  md += `Generated: ${new Date().toLocaleString()}\n\n`;

  md += `## Summary\n\n`;
  md += `- Total Findings: ${findings.length}\n`;
  md += `- Critical: ${critical}\n`;
  md += `- High: ${high}\n`;
  md += `- Medium: ${medium}\n`;
  md += `- Low: ${low}\n`;
  md += `- Info: ${info}\n\n`;
  md += `---\n\n`;

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

class FindingsProvider implements vscode.TreeDataProvider<FindingTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    FindingTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private findings: Finding[] = [];

  refresh(findings: Finding[]) {
    this.findings = findings;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FindingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FindingTreeItem): Thenable<FindingTreeItem[]> {
    if (!element) {
      const severities = ["Critical", "High", "Medium", "Low", "Info"];

      return Promise.resolve(
        severities
          .map((severity) => {
            const count = this.findings.filter(
              (f) => f.severity === severity
            ).length;
            return new FindingTreeItem(
              `${severity} (${count})`,
              vscode.TreeItemCollapsibleState.Collapsed,
              undefined,
              severity
            );
          })
          .filter(
            (item) =>
              item.countKey &&
              this.findings.some((f) => f.severity === item.countKey)
          )
      );
    }

    if (element.countKey) {
      const items = this.findings
        .filter((f) => f.severity === element.countKey)
        .map((finding) => {
          const item = new FindingTreeItem(
            `${finding.type}: ${finding.message}`,
            vscode.TreeItemCollapsibleState.None,
            finding
          );

          item.description = `${finding.file}:${finding.line}`;
          item.tooltip = `${finding.file}:${finding.line}\n${finding.message}`;
          item.command = {
            command: "tracereview.openFinding",
            title: "Open Finding",
            arguments: [item],
          };

          return item;
        });

      return Promise.resolve(items);
    }

    return Promise.resolve([]);
  }
}

class FindingTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly finding?: Finding,
    public readonly countKey?: string
  ) {
    super(label, collapsibleState);
  }
}

export function deactivate() {}
