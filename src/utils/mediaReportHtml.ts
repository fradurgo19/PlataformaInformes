export type MediaReportFile = {
  clientName: string;
  machineType: string;
  model: string;
  serialNumber: string;
  ott: string;
  hourmeter: string;
  reportDate: string;
  reasonOfService: string;
  conclusions: string;
  overallSuggestions: string;
  sections: Array<{
    title: string;
    findings: string;
    suggestions: string;
    photos: Array<{ url: string; name: string }>;
    videos: Array<{ url: string; name: string }>;
  }>;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const absoluteUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${path}`;
};

const mediaBlock = (items: Array<{ url: string; name: string }>, kind: 'img' | 'video'): string => {
  if (items.length === 0) return '';
  const label = kind === 'video' ? 'Videos' : 'Fotos / Photos';
  const nodes = items
    .map((item) => {
      const src = escapeHtml(absoluteUrl(item.url));
      const name = escapeHtml(item.name);
      if (kind === 'video') {
        return `<video controls playsinline preload="metadata" src="${src}" style="width:100%;max-height:420px;background:#000;border-radius:8px;"></video><p style="font-size:12px;color:#50504f;margin:4px 0 12px;">${name}</p>`;
      }
      return `<img src="${src}" alt="${name}" style="width:180px;height:120px;object-fit:cover;border:1px solid #e2e2e1;border-radius:8px;" />`;
    })
    .join('');
  const wrap = kind === 'img'
    ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">${nodes}</div>`
    : `<div style="margin-top:8px;">${nodes}</div>`;
  return `<p style="font-weight:600;margin:12px 0 0;">${label}</p>${wrap}`;
};

/** Standalone HTML the user can email. Videos play from their public Supabase URL. */
export const buildMediaReportHtml = (report: MediaReportFile): string => {
  const sections = report.sections
    .map((section) => {
      return `<section style="border:1px solid #e2e2e1;border-radius:10px;padding:16px;margin-top:16px;">
        <h2 style="margin:0 0 8px;font-size:18px;">${escapeHtml(section.title)}</h2>
        <p style="white-space:pre-wrap;margin:0;">${escapeHtml(section.findings)}</p>
        ${section.suggestions ? `<p style="white-space:pre-wrap;color:#50504f;"><strong>Suggestions: </strong>${escapeHtml(section.suggestions)}</p>` : ''}
        ${mediaBlock(section.photos, 'img')}
        ${mediaBlock(section.videos, 'video')}
      </section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Informe con videos - ${escapeHtml(report.clientName)}</title>
</head>
<body style="margin:0;background:#f7f7f7;color:#1f1f1e;font-family:Segoe UI,Arial,sans-serif;">
  <main style="max-width:860px;margin:24px auto;background:#fff;border:1px solid #e2e2e1;border-radius:12px;overflow:hidden;">
    <div style="height:6px;background:#cf1b22;"></div>
    <div style="padding:28px;">
      <p style="margin:0;color:#cf1b22;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;">Informe con videos</p>
      <h1 style="margin:8px 0 4px;font-size:28px;">${escapeHtml(report.clientName)}</h1>
      <p style="margin:0;color:#50504f;">${escapeHtml(report.machineType)} · ${escapeHtml(report.model)} · S/N ${escapeHtml(report.serialNumber)}</p>
      <p style="margin:4px 0 0;color:#50504f;">OTT ${escapeHtml(report.ott)} · Horómetro ${escapeHtml(report.hourmeter)} · ${escapeHtml(report.reportDate)}</p>
      <p style="margin-top:16px;font-size:13px;color:#50504f;">Abra este archivo en Chrome o Edge con internet. Los videos se reproducen desde el almacenamiento del informe.</p>
      ${report.reasonOfService ? `<h2>Reason of service</h2><p style="white-space:pre-wrap;">${escapeHtml(report.reasonOfService)}</p>` : ''}
      ${sections}
      ${report.conclusions ? `<h2>Conclusions</h2><p style="white-space:pre-wrap;">${escapeHtml(report.conclusions)}</p>` : ''}
      ${report.overallSuggestions ? `<h2>Overall suggestions</h2><p style="white-space:pre-wrap;">${escapeHtml(report.overallSuggestions)}</p>` : ''}
    </div>
  </main>
</body>
</html>`;
};
