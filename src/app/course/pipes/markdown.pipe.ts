import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: false
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Split content into paragraphs first (by double newlines)
    const paragraphs = value.split(/\n\n+/);
    const htmlBlocks: string[] = [];

    for (let para of paragraphs) {
      let html = para;

      // Code blocks with language support - do this FIRST before other replacements
      if (html.match(/```/)) {
        html = html.replace(/```(\w+)?\n?([\s\S]*?)```/gim, (match, lang, code) => {
          const language = lang || 'plaintext';
          const displayLang = language === 'progress' ? 'OpenEdge 4GL' : language.toUpperCase();
          // Escape HTML in code
          const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
          return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-language-label">${displayLang}</span></div><pre class="code-block language-${language}"><code>${escapedCode}</code></pre></div>`;
        });
        htmlBlocks.push(html);
        continue;
      }

      // Tables - check if this paragraph is a table
      if (html.match(/^\|(.+)\|/m)) {
        const rows = html.trim().split('\n');
        if (rows.length >= 2 && rows[1].match(/^\|[-:\s|]+\|$/)) {
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
          htmlBlocks.push(table);
          continue;
        }
      }

      // Lists - unordered
      if (html.match(/^[\-\*]\s/m)) {
        const lines = html.split('\n');
        let listHtml = '<ul>';
        for (const line of lines) {
          if (line.match(/^[\-\*]\s(.+)/)) {
            const content = line.replace(/^[\-\*]\s/, '');
            listHtml += `<li>${this.processInlineMarkdown(content)}</li>`;
          }
        }
        listHtml += '</ul>';
        htmlBlocks.push(listHtml);
        continue;
      }

      // Lists - ordered
      if (html.match(/^\d+\.\s/m)) {
        const lines = html.split('\n');
        let listHtml = '<ol>';
        for (const line of lines) {
          if (line.match(/^\d+\.\s(.+)/)) {
            const content = line.replace(/^\d+\.\s/, '');
            listHtml += `<li>${this.processInlineMarkdown(content)}</li>`;
          }
        }
        listHtml += '</ol>';
        htmlBlocks.push(listHtml);
        continue;
      }

      // Horizontal rules
      if (html.match(/^---+$/)) {
        htmlBlocks.push('<hr>');
        continue;
      }

      // Headers
      if (html.match(/^#{1,3}\s/)) {
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        htmlBlocks.push(html);
        continue;
      }

      // Blockquotes
      if (html.match(/^>/m)) {
        const lines = html.split('\n');
        let quoteHtml = '<blockquote>';
        for (const line of lines) {
          if (line.startsWith('>')) {
            quoteHtml += this.processInlineMarkdown(line.replace(/^>\s?/, '')) + '<br>';
          }
        }
        quoteHtml = quoteHtml.replace(/<br>$/, '') + '</blockquote>';
        htmlBlocks.push(quoteHtml);
        continue;
      }

      // Regular paragraphs - process inline markdown
      if (html.trim()) {
        // Handle multi-line paragraphs by replacing single newlines with <br>
        const lines = html.split('\n').map(line => this.processInlineMarkdown(line));
        htmlBlocks.push('<p>' + lines.join('<br>') + '</p>');
      }
    }

    return htmlBlocks.join('\n');
  }

  private processInlineMarkdown(text: string): string {
    let html = text;

    // Inline code - do this first before other replacements
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic (but not if it's part of bold or in middle of word)
    html = html.replace(/\*([^*\s](?:[^*]*[^*\s])?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="markdown-link">$1</a>');

    return html;
  }
}
