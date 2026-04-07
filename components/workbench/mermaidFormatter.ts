const INDENT = "  ";
const BLOCK_START_REGEX = /^(subgraph|loop\b|alt\b|opt\b|par\b|critical\b|break\b|rect\b|box\b|class\s+\w+\s*\{|state\s+\w+\s*\{|\{)\b/i;
const BLOCK_END_REGEX = /^(end|else\b|and\b|option\b|\})\b/i;

function formatRelationLine(line: string): string {
  let next = line.trim();
  if (!next) return "";

  next = next.replace(/\s*([-x=o.]?-{1,2}[x=o.]?>{1,2})\s*/g, " $1 ");
  next = next.replace(/\s*(<{1,2}[-x=o.]?-{1,2}[-x=o.]?)\s*/g, " $1 ");
  next = next.replace(/\s+\|([^|]+)\|\s*/g, "|$1| ");
  next = next.replace(/\s*:\s*/g, ": ");
  next = next.replace(/\s{2,}/g, " ");

  return next.trimEnd();
}

function normalizeLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return "";

  const startsComment = trimmed.startsWith("%%");
  if (startsComment) {
    return trimmed.replace(/\s{2,}/g, " ");
  }

  const hasRelation = /-{1,2}|<{1,2}|>{1,2}|\|.+\|/.test(trimmed);
  if (hasRelation) {
    return formatRelationLine(trimmed);
  }

  return trimmed.replace(/\s{2,}/g, " ");
}

export function formatMermaidCode(input: string): string {
  const normalized = input.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");

  const formatted: string[] = [];
  let indentLevel = 0;
  let previousWasBlank = false;

  for (const rawLine of lines) {
    const cleanedLine = normalizeLine(rawLine);

    if (!cleanedLine) {
      if (!previousWasBlank && formatted.length > 0) {
        formatted.push("");
      }
      previousWasBlank = true;
      continue;
    }

    const lowersIndentBefore = BLOCK_END_REGEX.test(cleanedLine);
    if (lowersIndentBefore) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push(`${INDENT.repeat(indentLevel)}${cleanedLine}`);

    const raisesIndentAfter = BLOCK_START_REGEX.test(cleanedLine) && !cleanedLine.endsWith("}");
    if (raisesIndentAfter) {
      indentLevel += 1;
    }

    if (/\{$/.test(cleanedLine) && !BLOCK_START_REGEX.test(cleanedLine)) {
      indentLevel += 1;
    }

    previousWasBlank = false;
  }

  return formatted.join("\n").trimEnd();
}
