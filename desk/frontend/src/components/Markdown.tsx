// A small, safe Markdown renderer for guides: builds React elements, never raw HTML.
// Supports #/##/### headings, paragraphs, - and 1. lists, **bold**, *italic*, `code`, [text](url).
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Markdown.css';

type Block =
  | { type: 'h'; level: 2 | 3; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] };

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    para = [];
    if (list) blocks.push(list);
    list = null;
  };
  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      blocks.push({ type: 'h', level: heading[1].length >= 3 ? 3 : 2, text: heading[2] });
    } else if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (para.length || (list && list.type !== type)) flush();
      list = list ?? { type, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (list && /^\s{2,}/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line}`; // continuation of a list item
    } else {
      if (list) flush();
      para.push(line);
    }
  }
  flush();
  return blocks;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[\d{1,2}\](?!\())/g;

// citeHref turns [n] into a link to source n (used by Ask answers).
export function inline(text: string, citeHref?: (n: number) => string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    const cite = /^\[(\d{1,2})\]$/.exec(part);
    if (cite) {
      return citeHref ? (
        <a key={i} href={citeHref(Number(cite[1]))} className="markdown__cite">
          {cite[1]}
        </a>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) return <Link key={i} to={href}>{label}</Link>;
      if (/^https?:\/\//.test(href))
        return (
          <a key={i} href={href} target="_blank" rel="noreferrer">
            {label}
          </a>
        );
      return <Fragment key={i}>{label}</Fragment>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function Markdown({ source, citeHref }: { source: string; citeHref?: (n: number) => string }) {
  const md = (text: string) => inline(text, citeHref);
  return (
    <div className="markdown">
      {parseBlocks(source).map((b, i) => {
        if (b.type === 'h') return b.level === 2 ? <h2 key={i}>{md(b.text)}</h2> : <h3 key={i}>{md(b.text)}</h3>;
        if (b.type === 'p') return <p key={i}>{md(b.text)}</p>;
        const items = b.items.map((it, j) => <li key={j}>{md(it)}</li>);
        return b.type === 'ul' ? <ul key={i}>{items}</ul> : <ol key={i}>{items}</ol>;
      })}
    </div>
  );
}
