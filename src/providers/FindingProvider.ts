import * as vscode from "vscode";
import { SEVERITIES } from "../constants";
import { Finding } from "../types";

export class FindingsProvider
  implements vscode.TreeDataProvider<FindingTreeItem>
{
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
      return Promise.resolve(
        SEVERITIES.map((severity) => {
          const count = this.findings.filter(
            (f) => f.severity === severity
          ).length;

          return new FindingTreeItem(
            `${severity} (${count})`,
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            severity
          );
        }).filter(
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

export class FindingTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly finding?: Finding,
    public readonly countKey?: string
  ) {
    super(label, collapsibleState);

    if (countKey) {
      this.iconPath = getSeverityIcon(countKey);
    }

    if (finding) {
      this.iconPath = getTypeIcon(finding.type);
    }
  }
}

function getSeverityIcon(severity: string): vscode.ThemeIcon {
  switch (severity) {
    case "Critical":
      return new vscode.ThemeIcon(
        "error",
        new vscode.ThemeColor("errorForeground")
      );
    case "High":
      return new vscode.ThemeIcon(
        "warning",
        new vscode.ThemeColor("editorWarning.foreground")
      );
    case "Medium":
      return new vscode.ThemeIcon(
        "info",
        new vscode.ThemeColor("charts.yellow")
      );
    case "Low":
      return new vscode.ThemeIcon(
        "circle-outline",
        new vscode.ThemeColor("charts.blue")
      );
    case "Info":
      return new vscode.ThemeIcon(
        "comment-discussion",
        new vscode.ThemeColor("descriptionForeground")
      );
    default:
      return new vscode.ThemeIcon("circle-outline");
  }
}

function getTypeIcon(type: string): vscode.ThemeIcon {
  switch (type) {
    case "BUG":
    case "FIXME":
      return new vscode.ThemeIcon(
        "bug",
        new vscode.ThemeColor("errorForeground")
      );

    case "SECURITY":
      return new vscode.ThemeIcon(
        "shield",
        new vscode.ThemeColor("editorWarning.foreground")
      );

    case "PERFORMANCE":
    case "OPTIMIZE":
      return new vscode.ThemeIcon(
        "dashboard",
        new vscode.ThemeColor("charts.green")
      );

    case "REFACTOR":
      return new vscode.ThemeIcon(
        "tools",
        new vscode.ThemeColor("charts.blue")
      );

    case "UI":
    case "ACCESSIBILITY":
      return new vscode.ThemeIcon(
        "symbol-color",
        new vscode.ThemeColor("charts.purple")
      );

    case "RISK":
      return new vscode.ThemeIcon(
        "warning",
        new vscode.ThemeColor("editorWarning.foreground")
      );

    case "IMPROVE":
      return new vscode.ThemeIcon(
        "lightbulb",
        new vscode.ThemeColor("charts.yellow")
      );

    case "REVIEW":
      return new vscode.ThemeIcon(
        "comment",
        new vscode.ThemeColor("descriptionForeground")
      );

    case "TODO":
      return new vscode.ThemeIcon(
        "checklist",
        new vscode.ThemeColor("charts.blue")
      );

    default:
      return new vscode.ThemeIcon("circle-outline");
  }
}
