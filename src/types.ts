import * as vscode from "vscode";

export type Finding = {
  file: string;
  line: number;
  type: string;
  severity: string;
  message: string;
  uri: vscode.Uri;
};
