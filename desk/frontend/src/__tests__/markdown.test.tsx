import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Markdown, { parseBlocks } from '../components/Markdown';

describe('guide markdown', () => {
  it('splits headings, paragraphs and lists', () => {
    const blocks = parseBlocks('## Title\n\nOne\ntwo\n\n- a\n- b\n\n1. x\n2. y\n### Small');
    expect(blocks.map((b) => b.type)).toEqual(['h', 'p', 'ul', 'ol', 'h']);
    expect(blocks[1]).toEqual({ type: 'p', text: 'One two' });
  });

  it('renders inline marks and only safe links', () => {
    const { container } = render(
      <MemoryRouter>
        <Markdown source={'**Bold** and *it* with `code`, [site](https://bis.org), [here](/landscape/nexus), [bad](javascript:alert(1)) <script>x</script>'} />
      </MemoryRouter>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('Bold');
    expect(container.querySelector('em')?.textContent).toBe('it');
    const links = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['https://bis.org', '/landscape/nexus']);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>x</script>');
  });
});

describe('ask answers', () => {
  it('turns [n] into links to the numbered sources, but leaves real links alone', () => {
    const { container } = render(
      <MemoryRouter>
        <Markdown source={'Nexus links systems [1][3]. See [BIS](https://bis.org).'} citeHref={(n) => `#source-${n}`} />
      </MemoryRouter>,
    );
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['#source-1', '#source-3', 'https://bis.org']);
  });
});

describe('search snippets', () => {
  it('marks the words the server highlighted, and nothing else', async () => {
    const { Highlighted } = await import('../pages/Search');
    const { container } = render(<Highlighted text={'Banks pre-fund the \u0002settlement\u0003 account <b>x</b>'} />);
    expect([...container.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['settlement']);
    expect(container.querySelector('b')).toBeNull();
  });
});
