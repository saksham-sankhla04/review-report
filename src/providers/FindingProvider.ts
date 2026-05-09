import * as vscode from "vscode";
import { SEVERITIES } from "../constants";
import { Finding } from "../types";
import { getFilters } from "../state/filterState";

export class FindingsProvider
  implements vscode.TreeDataProvider<FindingTreeItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    FindingTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private findings: Finding[] = [];

  private getFilteredFindings() {
    const filters = getFilters();

    return this.findings.filter((finding) => {
      if (filters.severity && finding.severity !== filters.severity) {
        return false;
      }

      if (filters.type && finding.type !== filters.type) {
        return false;
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();

        return (
          finding.message.toLowerCase().includes(search) ||
          finding.file.toLowerCase().includes(search) ||
          finding.type.toLowerCase().includes(search) ||
          finding.severity.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }

  refresh(findings: Finding[]) {
    this.findings = findings;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FindingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FindingTreeItem): Thenable<FindingTreeItem[]> {
    const visibleFindings = this.getFilteredFindings();

    if (!element) {
      return Promise.resolve(
        SEVERITIES.map((severity) => {
          const count = visibleFindings.filter(
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
            visibleFindings.some((f) => f.severity === item.countKey)
        )
      );
    }

    if (element.countKey && !element.fileKey) {
      const files = Array.from(
        new Set(
          visibleFindings
            .filter((f) => f.severity === element.countKey)
            .map((f) => f.file)
        )
      );

      return Promise.resolve(
        files.map((file) => {
          const count = visibleFindings.filter(
            (f) => f.severity === element.countKey && f.file === file
          ).length;

          const item = new FindingTreeItem(
            `${file} (${count})`,
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            element.countKey,
            file
          );

          item.iconPath = new vscode.ThemeIcon("file-code");

          return item;
        })
      );
    }

    if (element.countKey && element.fileKey) {
      const items = visibleFindings
        .filter(
          (f) => f.severity === element.countKey && f.file === element.fileKey
        )
        .map((finding) => {
          const item = new FindingTreeItem(
            `${finding.type}: ${finding.message}`,
            vscode.TreeItemCollapsibleState.None,
            finding
          );

          item.description = `Line ${finding.line}`;
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
    public readonly countKey?: string,
    public readonly fileKey?: string
  ) {
    super(label, collapsibleState);

    if (countKey && !fileKey) {
      this.iconPath = getSeverityIcon(countKey);
    }

    if (fileKey) {
      this.iconPath = new vscode.ThemeIcon("file-code");
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
