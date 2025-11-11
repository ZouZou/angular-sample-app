import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: false
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Simple markdown to HTML conversion
    let html = value;

    // Code blocks with language support - do this FIRST before other replacements
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      const language = lang || 'plaintext';
      // Escape HTML in code
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return `<pre class="code-block language-${language}"><code>${escapedCode}</code></pre>`;
    });

    // Inline code - do this before other replacements
    html = html.replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Tables - basic support
    const tableRegex = /\n\|(.+)\|\n\|([-:\s|]+)\|\n((?:\|.+\|\n?)+)/gim;
    html = html.replace(tableRegex, (match) => {
      const rows = match.trim().split('\n');
      let table = '<table class="markdown-table"><thead><tr>';

      // Header row
      const headers = rows[0].split('|').filter(h => h.trim());
      headers.forEach(header => {
        table += `<th>${header.trim()}</th>`;
      });
      table += '</tr></thead><tbody>';

      // Body rows (skip the separator row)
      for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].split('|').filter(c => c.trim());
        if (cells.length > 0) {
          table += '<tr>';
          cells.forEach(cell => {
            table += `<td>${cell.trim()}</td>`;
          });
          table += '</tr>';
        }
      }
      table += '</tbody></table>';
      return table;
    });

    // Lists - unordered
    html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Lists - ordered
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" class="markdown-link">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Line breaks - do this last
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }
}
