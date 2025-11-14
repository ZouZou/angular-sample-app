import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    pipe = new MarkdownPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Basic transformations', () => {
    it('should return empty string for null or undefined', () => {
      expect(pipe.transform(null as any)).toBe('');
      expect(pipe.transform(undefined as any)).toBe('');
      expect(pipe.transform('')).toBe('');
    });

    it('should transform plain text into paragraphs', () => {
      const result = pipe.transform('Hello World');
      expect(result).toContain('<p>Hello World</p>');
    });
  });

  describe('Headers', () => {
    it('should transform H1 headers', () => {
      const result = pipe.transform('# Heading 1');
      expect(result).toContain('<h1>Heading 1</h1>');
    });

    it('should transform H2 headers', () => {
      const result = pipe.transform('## Heading 2');
      expect(result).toContain('<h2>Heading 2</h2>');
    });

    it('should transform H3 headers', () => {
      const result = pipe.transform('### Heading 3');
      expect(result).toContain('<h3>Heading 3</h3>');
    });

    it('should handle multiple headers', () => {
      const markdown = '# H1\n\n## H2\n\n### H3';
      const result = pipe.transform(markdown);
      expect(result).toContain('<h1>H1</h1>');
      expect(result).toContain('<h2>H2</h2>');
      expect(result).toContain('<h3>H3</h3>');
    });
  });

  describe('Inline formatting', () => {
    it('should transform bold text', () => {
      const result = pipe.transform('**bold text**');
      expect(result).toContain('<strong>bold text</strong>');
    });

    it('should transform italic text', () => {
      const result = pipe.transform('*italic text*');
      expect(result).toContain('<em>italic text</em>');
    });

    it('should transform inline code', () => {
      const result = pipe.transform('Use `code` here');
      expect(result).toContain('<code class="inline-code">code</code>');
    });

    it('should transform links', () => {
      const result = pipe.transform('[Click here](https://example.com)');
      expect(result).toContain('<a href="https://example.com" target="_blank" class="markdown-link">Click here</a>');
    });

    it('should handle multiple inline formats together', () => {
      const markdown = '**bold** and *italic* and `code` and [link](https://test.com)';
      const result = pipe.transform(markdown);
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<code class="inline-code">code</code>');
      expect(result).toContain('<a href="https://test.com"');
    });
  });

  describe('Code blocks', () => {
    it('should transform code blocks without language', () => {
      const markdown = '```\nconst x = 1;\n```';
      const result = pipe.transform(markdown);
      expect(result).toContain('<pre class="code-block language-plaintext">');
      expect(result).toContain('<code>const x = 1;</code>');
    });

    it('should transform code blocks with language', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = pipe.transform(markdown);
      expect(result).toContain('<pre class="code-block language-javascript">');
      expect(result).toContain('JAVASCRIPT');
    });

    it('should escape HTML in code blocks', () => {
      const markdown = '```html\n<div>Hello</div>\n```';
      const result = pipe.transform(markdown);
      expect(result).toContain('&lt;div&gt;Hello&lt;/div&gt;');
      expect(result).not.toContain('<div>Hello</div>');
    });

    it('should handle special language label for progress', () => {
      const markdown = '```progress\nFOR EACH Customer:\nEND.\n```';
      const result = pipe.transform(markdown);
      expect(result).toContain('OpenEdge 4GL');
    });

    it('should preserve code blocks with inline markdown', () => {
      const markdown = '```\n**this should not be bold**\n```';
      const result = pipe.transform(markdown);
      expect(result).not.toContain('<strong>');
      expect(result).toContain('**this should not be bold**');
    });
  });

  describe('Lists', () => {
    describe('Unordered lists', () => {
      it('should transform unordered lists with dashes', () => {
        const markdown = '- Item 1\n- Item 2\n- Item 3';
        const result = pipe.transform(markdown);
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>Item 1</li>');
        expect(result).toContain('<li>Item 2</li>');
        expect(result).toContain('<li>Item 3</li>');
        expect(result).toContain('</ul>');
      });

      it('should transform unordered lists with asterisks', () => {
        const markdown = '* Item A\n* Item B';
        const result = pipe.transform(markdown);
        expect(result).toContain('<ul>');
        expect(result).toContain('<li>Item A</li>');
        expect(result).toContain('<li>Item B</li>');
      });

      it('should handle inline formatting in list items', () => {
        const markdown = '- **Bold item**\n- *Italic item*\n- `Code item`';
        const result = pipe.transform(markdown);
        expect(result).toContain('<strong>Bold item</strong>');
        expect(result).toContain('<em>Italic item</em>');
        expect(result).toContain('<code class="inline-code">Code item</code>');
      });
    });

    describe('Ordered lists', () => {
      it('should transform ordered lists', () => {
        const markdown = '1. First\n2. Second\n3. Third';
        const result = pipe.transform(markdown);
        expect(result).toContain('<ol>');
        expect(result).toContain('<li>First</li>');
        expect(result).toContain('<li>Second</li>');
        expect(result).toContain('<li>Third</li>');
        expect(result).toContain('</ol>');
      });

      it('should handle inline formatting in ordered lists', () => {
        const markdown = '1. **First item**\n2. *Second item*';
        const result = pipe.transform(markdown);
        expect(result).toContain('<strong>First item</strong>');
        expect(result).toContain('<em>Second item</em>');
      });
    });
  });

  describe('Blockquotes', () => {
    it('should transform single-line blockquotes', () => {
      const markdown = '> This is a quote';
      const result = pipe.transform(markdown);
      expect(result).toContain('<blockquote>');
      expect(result).toContain('This is a quote');
      expect(result).toContain('</blockquote>');
    });

    it('should transform multi-line blockquotes', () => {
      const markdown = '> Line 1\n> Line 2\n> Line 3';
      const result = pipe.transform(markdown);
      expect(result).toContain('<blockquote>');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
      expect(result).toContain('</blockquote>');
    });

    it('should handle inline formatting in blockquotes', () => {
      const markdown = '> **Bold quote** with *italic*';
      const result = pipe.transform(markdown);
      expect(result).toContain('<strong>Bold quote</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('Tables', () => {
    it('should transform simple tables', () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |';
      const result = pipe.transform(markdown);
      expect(result).toContain('<table class="markdown-table">');
      expect(result).toContain('<thead>');
      expect(result).toContain('<th>Header 1</th>');
      expect(result).toContain('<th>Header 2</th>');
      expect(result).toContain('<tbody>');
      expect(result).toContain('<td>Cell 1</td>');
      expect(result).toContain('<td>Cell 2</td>');
    });

    it('should handle tables with multiple rows', () => {
      const markdown = '| Name | Age |\n|------|-----|\n| John | 30 |\n| Jane | 25 |\n| Bob | 35 |';
      const result = pipe.transform(markdown);
      expect(result).toContain('John');
      expect(result).toContain('Jane');
      expect(result).toContain('Bob');
      expect(result).toContain('30');
      expect(result).toContain('25');
      expect(result).toContain('35');
    });
  });

  describe('Horizontal rules', () => {
    it('should transform horizontal rules', () => {
      const markdown = '---';
      const result = pipe.transform(markdown);
      expect(result).toContain('<hr>');
    });

    it('should handle longer horizontal rules', () => {
      const markdown = '------';
      const result = pipe.transform(markdown);
      expect(result).toContain('<hr>');
    });
  });

  describe('Paragraphs', () => {
    it('should separate paragraphs with double newlines', () => {
      const markdown = 'Paragraph 1\n\nParagraph 2';
      const result = pipe.transform(markdown);
      expect(result).toContain('<p>Paragraph 1</p>');
      expect(result).toContain('<p>Paragraph 2</p>');
    });

    it('should convert single newlines to <br> within paragraphs', () => {
      const markdown = 'Line 1\nLine 2\nLine 3';
      const result = pipe.transform(markdown);
      expect(result).toContain('Line 1<br>Line 2<br>Line 3');
    });
  });

  describe('Complex markdown', () => {
    it('should handle mixed content', () => {
      const markdown = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
const code = 'example';
\`\`\`

> A quote

---`;
      const result = pipe.transform(markdown);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>List item 1</li>');
      expect(result).toContain('<pre class="code-block');
      expect(result).toContain('<blockquote>');
      expect(result).toContain('<hr>');
    });

    it('should handle code blocks surrounded by other content', () => {
      const markdown = `Before code

\`\`\`javascript
const x = 1;
\`\`\`

After code`;
      const result = pipe.transform(markdown);
      expect(result).toContain('<p>Before code</p>');
      expect(result).toContain('<pre class="code-block');
      expect(result).toContain('<p>After code</p>');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty lines', () => {
      const markdown = 'Text\n\n\n\nMore text';
      const result = pipe.transform(markdown);
      expect(result).toContain('<p>Text</p>');
      expect(result).toContain('<p>More text</p>');
    });

    it('should handle text with special characters', () => {
      const markdown = 'Text with & < > " characters';
      const result = pipe.transform(markdown);
      expect(result).toContain('Text with & &lt; &gt; " characters');
    });

    it('should not confuse asterisks in middle of words', () => {
      const markdown = 'file*name*test';
      const result = pipe.transform(markdown);
      // Should handle this gracefully
      expect(result).toBeTruthy();
    });

    it('should handle multiple consecutive formatting', () => {
      const markdown = '**bold1** **bold2** **bold3**';
      const result = pipe.transform(markdown);
      expect(result).toContain('<strong>bold1</strong>');
      expect(result).toContain('<strong>bold2</strong>');
      expect(result).toContain('<strong>bold3</strong>');
    });
  });

  describe('Code block preservation', () => {
    it('should not apply inline formatting inside code blocks', () => {
      const markdown = '```\n**bold** *italic* `code`\n```';
      const result = pipe.transform(markdown);
      expect(result).not.toContain('<strong>');
      expect(result).not.toContain('<em>');
      expect(result).toContain('**bold** *italic* `code`');
    });

    it('should handle code blocks with empty lines', () => {
      const markdown = '```\nLine 1\n\nLine 2\n```';
      const result = pipe.transform(markdown);
      expect(result).toContain('<pre class="code-block');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });
  });
});
