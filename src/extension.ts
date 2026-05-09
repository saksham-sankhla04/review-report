import * as vscode from "vscode";
import { addReviewFinding } from "./commands/addReviewFinding";
import { FindingsProvider, FindingTreeItem } from "./providers/FindingProvider";
import { generateReport } from "./reportGenertaor";
import { scanFindings } from "./scanner";
import { SEVERITIES, TYPES } from "./constants";
import {
  clearFilters,
  setSearchFilter,
  setSeverityFilter,
  setTypeFilter,
} from "./state/filterState";

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

  const addFindingCommand = vscode.commands.registerCommand(
    "tracereview.addFinding",
    async () => {
      await addReviewFinding(refreshFindingsAndReport);
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

  const filterBySeverityCommand = vscode.commands.registerCommand(
    "tracereview.filterBySeverity",
    async () => {
      const selected = await vscode.window.showQuickPick(
        ["All", ...SEVERITIES],
        {
          placeHolder: "Filter by severity",
        }
      );

      if (!selected) {
        return;
      }

      setSeverityFilter(selected === "All" ? undefined : selected);
      await refreshFindingsAndReport();
    }
  );

  const filterByTypeCommand = vscode.commands.registerCommand(
    "tracereview.filterByType",
    async () => {
      const selected = await vscode.window.showQuickPick(["All", ...TYPES], {
        placeHolder: "Filter by type",
      });

      if (!selected) {
        return;
      }

      setTypeFilter(selected === "All" ? undefined : selected);
      await refreshFindingsAndReport();
    }
  );

  const searchFindingsCommand = vscode.commands.registerCommand(
    "tracereview.searchFindings",
    async () => {
      const search = await vscode.window.showInputBox({
        prompt: "Search review findings",
        placeHolder: "Example: payment, navbar, security",
      });

      setSearchFilter(search || undefined);
      await refreshFindingsAndReport();
    }
  );

  const clearFiltersCommand = vscode.commands.registerCommand(
    "tracereview.clearFilters",
    async () => {
      clearFilters();
      await refreshFindingsAndReport();
    }
  );

  context.subscriptions.push(
    generateReportCommand,
    openFindingCommand,
    addFindingCommand,
    filterBySeverityCommand,
    filterByTypeCommand,
    searchFindingsCommand,
    clearFiltersCommand,
    autoGenerateOnSave
  );

  refreshFindingsAndReport();
}

async function refreshFindingsAndReport() {
  const findings = await scanFindings();
  findingsProvider.refresh(findings);
  await generateReport(findings);
}

export function deactivate() {}
