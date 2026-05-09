export const TYPES = [
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

export const SEVERITIES = ["Critical", "High", "Medium", "Low", "Info"];

export const FINDING_REGEX = new RegExp(
  `\\/\\/\\s*(${TYPES.join("|")})(?:\\[(${SEVERITIES.join("|")})\\])?:\\s*(.+)`,
  "i"
);
