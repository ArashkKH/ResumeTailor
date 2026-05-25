// Browser-only — uses DOMParser and XMLSerializer. Never import from server components.
import JSZip from 'jszip';
import type { ParsedParagraph, Change } from './types';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function isInDel(node: Node, boundary: Node): boolean {
  let ancestor = node.parentNode;
  while (ancestor && ancestor !== boundary) {
    if ((ancestor as Element).localName === 'del') return true;
    ancestor = ancestor.parentNode;
  }
  return false;
}

export async function extractParagraphs(arrayBuffer: ArrayBuffer): Promise<ParsedParagraph[]> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlStr = await zip.file('word/document.xml')!.async('text');
  const doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
  const body = doc.getElementsByTagNameNS(W, 'body')[0];
  const paras = Array.from(body.getElementsByTagNameNS(W, 'p'));

  return paras.map((p, i) => {
    const pStyle = p.getElementsByTagNameNS(W, 'pStyle')[0];
    const style = pStyle?.getAttribute('w:val') ?? 'Normal';
    let text = '';
    for (const t of Array.from(p.getElementsByTagNameNS(W, 't'))) {
      if (!isInDel(t, p)) text += t.textContent ?? '';
    }
    return { idx: i, text, style, isEmpty: !text.trim() };
  });
}

export async function applyChanges(arrayBuffer: ArrayBuffer, changes: Change[]): Promise<Blob> {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlStr = await zip.file('word/document.xml')!.async('text');
  const doc = new DOMParser().parseFromString(xmlStr, 'application/xml');
  const body = doc.getElementsByTagNameNS(W, 'body')[0];
  const paras = Array.from(body.getElementsByTagNameNS(W, 'p'));

  for (const change of changes) {
    if (change.action === 'keep') continue;
    const p = paras[change.para_idx];
    if (!p) continue;

    const liveRuns = Array.from(p.getElementsByTagNameNS(W, 'r')).filter(
      r => !isInDel(r, p)
    ) as Element[];
    if (!liveRuns.length) continue;

    let placed = false;
    for (const run of liveRuns) {
      const tNodes = Array.from(run.getElementsByTagNameNS(W, 't'));
      if (!tNodes.length) continue;
      if (!placed) {
        tNodes[0].textContent = change.new_text;
        if (change.new_text.startsWith(' ') || change.new_text.endsWith(' ')) {
          tNodes[0].setAttribute('xml:space', 'preserve');
        }
        tNodes.slice(1).forEach(t => (t.textContent = ''));
        placed = true;
      } else {
        tNodes.forEach(t => (t.textContent = ''));
      }
    }
  }

  const newXml = new XMLSerializer().serializeToString(doc);
  zip.file('word/document.xml', newXml);
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
