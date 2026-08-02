"use client";
import React from "react";

/**
 * Custom light-weight Markdown & Table Parser component for Sanduka Chat UI.
 * Parses markdown tables (| col | col |), bold text (**bold**), bullet points (- ), and line breaks cleanly.
 */
export default function FormattedMessage({ text, className = "" }) {
  if (!text) return null;

  // Helper to parse inline bolding (**text**)
  const renderInlineText = (rawText) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-emerald-900 dark:text-emerald-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Split content by lines to process blocks (tables vs paragraphs)
  const lines = text.split("\n");
  const blocks = [];
  let currentTable = null;
  let currentParagraph = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is part of a markdown table (starts and ends or contains |)
    if (line.startsWith("|") && line.endsWith("|")) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: "paragraph", lines: [...currentParagraph] });
        currentParagraph = [];
      }

      // Check if it's a separator line like |---|---|
      if (line.replace(/[\s|\-:]/g, "").length === 0) {
        continue; // Skip table header separator line
      }

      if (!currentTable) {
        currentTable = [];
      }
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      currentTable.push(cells);
    } else {
      if (currentTable) {
        blocks.push({ type: "table", rows: currentTable });
        currentTable = null;
      }
      currentParagraph.push(lines[i]);
    }
  }

  if (currentTable) {
    blocks.push({ type: "table", rows: currentTable });
  }
  if (currentParagraph.length > 0) {
    blocks.push({ type: "paragraph", lines: currentParagraph });
  }

  return (
    <div className={`space-y-2 text-xs sm:text-sm leading-relaxed ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === "table") {
          if (block.rows.length === 0) return null;
          const [headers, ...bodyRows] = block.rows;

          return (
            <div key={bIdx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 font-bold whitespace-nowrap">
                        {renderInlineText(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition-colors odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-900 dark:even:bg-slate-800/40"
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {renderInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        const paragraphText = block.lines.join("\n");
        return (
          <p key={bIdx} className="whitespace-pre-wrap">
            {renderInlineText(paragraphText)}
          </p>
        );
      })}
    </div>
  );
}
