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
  }
}
