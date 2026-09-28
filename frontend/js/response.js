/**
 * CodeArena — Response UI & Rich Markdown Streaming Component
 * Compatible with React/Next.js `@/components/ui/response` behavior
 * Renders Markdown, GFM Data Tables, Blockquotes, Syntax-Highlighted Code,
 * and LaTeX Math (Inline $...$ and Display $$...$$ via KaTeX or stylized fallback).
 */

(function (global) {
  'use strict';

  // ── 1. TOKENS SEQUENCE (As defined in React showcase) ──
  const TOKENS = [
    "### Welcome",
    "\n\n",
    "This",
    " is",
    " a",
    " **rich",
    " markdown",
    "**",
    " showcase",
    " with",
    " multiple",
    " features.",
    "\n\n",
    "---",
    "\n\n",
    "## Data Table",
    "\n\n",
    "| Name",
    " | Role",
    " | Status",
    " |",
    "\n",
    "|------|------|--------|",
    "\n",
    "| Alice",
    " | Engineer",
    " | Active",
    " |",
    "\n",
    "| Bob",
    " | Designer",
    " | Active",
    " |",
    "\n",
    "| Carol",
    " | PM",
    " | Active",
    " |",
    "\n\n",
    "## Inspiration",
    "\n\n",
    "> *Simplicity",
    " is",
    " the",
    " ultimate",
    " sophistication.*",
    "\n",
    "> —",
    " Leonardo",
    " da",
    " Vinci",
    "\n\n",
    "## Inline",
    " and",
    " Block",
    " Code",
    "\n\n",
    "Use",
    " `let",
    " total",
    " =",
    " items.length`",
    " to",
    " count",
    " elements.",
    "\n\n",
    "```",
    "python",
    "\n",
    "def",
    " greet(name):",
    "\n",
    "    return",
    ' f"Hello, {name}!"',
    "\n",
    'print(greet("World"))',
    "\n",
    "```",
    "\n\n",
    "## Math",
    "\n\n",
    "Inline",
    " math:",
    " $a^2",
    " +",
    " b^2",
    " =",
    " c^2$",
    ".",
    "\n\n",
    "Displayed",
    " equation:",
    "\n\n",
    "$$",
    "\n",
    "\\int_0^1",
    " x^2",
    " dx",
    " =",
    " \\frac{1}{3}",
    "\n",
    "$$",
    "\n\n",
  ];

  // ── 2. SYNTAX HIGHLIGHTER HELPER ──
  function highlightCode(code, lang) {
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (lang === 'python' || lang === 'py') {
      // Comments
      escaped = escaped.replace(/(#[^\n]*)/g, '<span class="tok-comment">$1</span>');
      // Strings
      escaped = escaped.replace(/(f?&quot;.*?&quot;|f?'.*?'|f?".*?")/g, '<span class="tok-string">$1</span>');
      // Keywords
      escaped = escaped.replace(/\b(def|return|import|from|class|if|elif|else|for|while|in|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|True|False|None)\b/g, '<span class="tok-keyword">$1</span>');
      // Builtins & Functions
      escaped = escaped.replace(/\b(print|len|range|enumerate|int|str|float|list|dict|set|tuple)\b/g, '<span class="tok-builtin">$1</span>');
      escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="tok-fn">$1</span>');
    } else if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
      escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');
      escaped = escaped.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="tok-string">$1</span>');
      escaped = escaped.replace(/\b(const|let|var|function|return|import|export|from|if|else|for|while|class|new|async|await|try|catch|switch|case|default|null|undefined|true|false)\b/g, '<span class="tok-keyword">$1</span>');
      escaped = escaped.replace(/\b(console|Math|Array|Object|String|Number|JSON|Promise|document|window)\b/g, '<span class="tok-builtin">$1</span>');
      escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="tok-fn">$1</span>');
    } else if (lang === 'cpp' || lang === 'c') {
      escaped = escaped.replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');
      escaped = escaped.replace(/(".*?"|'.*?')/g, '<span class="tok-string">$1</span>');
      escaped = escaped.replace(/\b(int|void|char|double|float|bool|long|auto|const|static|struct|class|public|private|protected|template|typename|return|if|else|for|while|switch|case|break|continue|using|namespace|vector|unordered_map|map|string|cin|cout|endl)\b/g, '<span class="tok-keyword">$1</span>');
      escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\()/g, '<span class="tok-fn">$1</span>');
    }
    return escaped;
  }

  // ── 3. LATEX MATH RENDERER (KaTeX or Semantic Fallback) ──
  function renderMath(latex, displayMode) {
    if (typeof global.katex !== 'undefined') {
      try {
        return global.katex.renderToString(latex.trim(), {
          displayMode: displayMode,
          throwOnError: false,
        });
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }

    // High quality stylized HTML math fallback if KaTeX is loading
    const clean = latex.trim();
    if (displayMode) {
      // Format integral: \int_0^1 x^2 dx = \frac{1}{3}
      let html = clean
        .replace(/\\int_0\^1\s*x\^2\s*dx\s*=\s*\\frac\{1\}\{3\}/g,
          '<span class="math-int">∫</span><sub style="margin-left:-4px">0</sub><sup style="margin-left:-2px">1</sup> <i>x</i>² <i>dx</i> = <span class="math-frac"><span class="math-num">1</span><span class="math-den">3</span></span>')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="math-frac"><span class="math-num">$1</span><span class="math-den">$2</span></span>')
        .replace(/\\int_([0-9a-zA-Z]+)\^([0-9a-zA-Z]+)/g, '<span class="math-int">∫</span><sub>$1</sub><sup>$2</sup>')
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³');
      return `<div class="response-math-display">${html}</div>`;
    } else {
      let html = clean
        .replace(/a\^2\s*\+\s*b\^2\s*=\s*c\^2/g, '<i>a</i>² + <i>b</i>² = <i>c</i>²')
        .replace(/\^2/g, '²')
        .replace(/\^([0-9]+)/g, '<sup>$1</sup>');
      return `<span class="response-math-inline">${html}</span>`;
    }
  }

  // ── 4. MARKDOWN TO RICH HTML PARSER ──
  function renderMarkdown(md, isStreaming = false) {
    if (!md && md !== '') return '';

    let text = md;

    // 1. Math Block: $$ ... $$
    const mathBlocks = [];
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const idx = mathBlocks.length;
      mathBlocks.push(renderMath(formula, true));
      return `%%MATHBLOCK_${idx}%%`;
    });

    // 2. Code Blocks: ```lang ... ```
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const idx = codeBlocks.length;
      const cleanLang = (lang || 'code').toLowerCase();
      const highlighted = highlightCode(code, cleanLang);
      const html = `
        <div class="response-code-card">
          <div class="response-code-header">
            <div class="response-code-lang">
              <span class="code-lang-dot"></span>
              ${cleanLang.toUpperCase()}
            </div>
            <button class="response-copy-btn" onclick="navigator.clipboard.writeText(this.closest('.response-code-card').querySelector('code').innerText); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='Copy', 2000)">
              Copy
            </button>
          </div>
          <pre class="response-pre"><code class="response-code">${highlighted}</code></pre>
        </div>`;
      codeBlocks.push(html);
      return `%%CODEBLOCK_${idx}%%`;
    });

    // Handle unclosed code block during streaming
    if (isStreaming && text.includes('```')) {
      text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*)$/g, (match, lang, code) => {
        const cleanLang = (lang || 'code').toLowerCase();
        const highlighted = highlightCode(code, cleanLang);
        return `
          <div class="response-code-card streaming-code">
            <div class="response-code-header">
              <div class="response-code-lang">
                <span class="code-lang-dot"></span>
                ${cleanLang.toUpperCase()}
              </div>
              <span class="diff-pill dp-Easy" style="font-size:0.7rem;padding:0.15rem 0.5rem">Streaming...</span>
            </div>
            <pre class="response-pre"><code class="response-code">${highlighted}</code></pre>
          </div>`;
      });
    }

    // 3. Inline Math: $...$ (ensure not escaping currency)
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      return renderMath(formula, false);
    });

    // 4. Tables (GFM Markdown Table parser)
    text = text.replace(/(?:(?:^|\n)\|[^\n]+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, (tableMatch) => {
      const lines = tableMatch.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return tableMatch;

      const parseRow = (rowStr) => {
        return rowStr
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim());
      };

      const headerCells = parseRow(lines[0]);
      // line[1] is delimiter |---|---|---|
      const bodyRows = lines.slice(2).map(parseRow);

      let tableHtml = '<div class="response-table-wrapper"><table class="response-table"><thead><tr>';
      headerCells.forEach(cell => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      bodyRows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          let cellContent = cell;
          if (cellContent.toLowerCase() === 'active') {
            cellContent = '<span class="status-pill-active"><span class="status-dot"></span>Active</span>';
          }
          tableHtml += `<td>${cellContent}</td>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</tbody></table></div>';
      return tableHtml;
    });

    // 5. Blockquotes: > ...
    text = text.replace(/(?:^|\n)(>[ \t]?[^\n]*(?:\n>[ \t]?[^\n]*)*)/g, (match, quoteContent) => {
      const cleanLines = quoteContent
        .split('\n')
        .map(line => line.replace(/^>[ \t]?/, ''))
        .join('<br />');
      return `<blockquote class="response-blockquote">${cleanLines}</blockquote>`;
    });

    // 6. Headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="response-h3">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="response-h2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="response-h1">$1</h1>');

    // 7. Horizontal Rule
    text = text.replace(/^---$/gim, '<hr class="response-hr" />');

    // 8. Inline Code: `...`
    text = text.replace(/`([^`\n]+)`/g, '<code class="response-inline-code">$1</code>');

    // 9. Bold & Italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="response-bold">$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em class="response-italic">$1</em>');

    // 10. Paragraphs & Line Breaks
    text = text.replace(/\n\n+/g, '<div class="response-spacer"></div>');
    text = text.replace(/\n/g, '<br />');

    // Restore Code Blocks
    codeBlocks.forEach((block, i) => {
      text = text.replace(`%%CODEBLOCK_${i}%%`, block);
    });

    // Restore Math Blocks
    mathBlocks.forEach((block, i) => {
      text = text.replace(`%%MATHBLOCK_${i}%%`, block);
    });

    // Append streaming cursor if streaming
    if (isStreaming) {
      text += '<span class="response-cursor"></span>';
    }

    return text;
  }

  // ── 5. RESPONSE STREAMER COMPONENT CONTROLLER ──
  class ResponseStreamer {
    constructor(options = {}) {
      this.container = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : options.container;
      this.tokens = options.tokens || TOKENS;
      this.intervalMs = options.intervalMs || 100;
      this.onProgress = options.onProgress || null;
      this.onComplete = options.onComplete || null;

      this.currentIndex = 0;
      this.accumulatedContent = '';
      this.timer = null;
      this.isPaused = false;
      this.isFinished = false;
    }

    start() {
      this.stop();
      this.currentIndex = 0;
      this.accumulatedContent = '';
      this.isPaused = false;
      this.isFinished = false;
      this.tick();
      this.timer = setInterval(() => this.tick(), this.intervalMs);
    }

    tick() {
      if (this.isPaused) return;

      if (this.currentIndex < this.tokens.length) {
        this.accumulatedContent += this.tokens[this.currentIndex];
        this.currentIndex++;
        this.render(true);

        if (this.onProgress) {
          this.onProgress(this.currentIndex, this.tokens.length, this.accumulatedContent);
        }
      } else {
        this.finish();
      }
    }

    finish() {
      this.stop();
      this.isFinished = true;
      this.render(false);
      if (this.onComplete) {
        this.onComplete(this.accumulatedContent);
      }
    }

    render(isStreaming) {
      if (!this.container) return;
      this.container.innerHTML = renderMarkdown(this.accumulatedContent, isStreaming);
    }

    pause() {
      this.isPaused = true;
    }

    resume() {
      this.isPaused = false;
    }

    togglePause() {
      if (this.isFinished) {
        this.start();
        return false;
      }
      this.isPaused = !this.isPaused;
      return this.isPaused;
    }

    setSpeed(intervalMs) {
      this.intervalMs = intervalMs;
      if (this.timer && !this.isFinished) {
        clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), this.intervalMs);
      }
    }

    showInstant() {
      this.stop();
      this.currentIndex = this.tokens.length;
      this.accumulatedContent = this.tokens.join('');
      this.finish();
    }

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }

  // Export globally
  global.CodeArenaResponse = {
    TOKENS: TOKENS,
    renderMarkdown: renderMarkdown,
    renderMath: renderMath,
    highlightCode: highlightCode,
    ResponseStreamer: ResponseStreamer,
  };

})(typeof window !== 'undefined' ? window : this);
