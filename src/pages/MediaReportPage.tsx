import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReport } from '../hooks/useReports';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { Button } from '../components/atoms/Button';
import { buildMediaReportHtml, MediaReportFile } from '../utils/mediaReportHtml';
import { sanitizeFilename } from '../utils/filenameSanitizer';

type MediaItem = { url: string; name: string };

const toMediaUrl = (item: unknown): MediaItem | null => {
  if (!item) return null;
  if (typeof item === 'string') {
    return { url: item, name: item.split('/').pop() || 'media' };
  }
  if (typeof item !== 'object') return null;
  const record = item as {
    file_path?: string;
    url?: string;
    video_name?: string;
    photo_name?: string;
    original_name?: string;
    filename?: string;
  };
  const raw = record.file_path || record.url;
  if (!raw) return null;
  const url = raw.startsWith('http') || raw.startsWith('/') ? raw : `/${raw}`;
  return {
    url,
    name: record.video_name || record.photo_name || record.original_name || record.filename || 'media',
  };
};

const collectMedia = (value: unknown): MediaItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map(toMediaUrl).filter((item): item is MediaItem => item !== null);
};

/** Full-screen report (opened in a new tab). PDF download is unchanged. */
export const MediaReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useReport(id || '');
  const report = data?.data;

  const documentModel = useMemo<MediaReportFile | null>(() => {
    if (!report) return null;
    const components = Array.isArray(report.components) ? report.components : [];
    return {
      clientName: report.client_name || '',
      machineType: report.machine_type || '',
      model: report.model || '',
      serialNumber: report.serial_number || '',
      ott: report.ott || '-',
      hourmeter: report.hourmeter != null ? String(report.hourmeter) : '-',
      reportDate: report.report_date || '',
      reasonOfService: report.reason_of_service || '',
      conclusions: report.conclusions || '',
      overallSuggestions: report.overall_suggestions || '',
      sections: components.map((component, index) => ({
        title: `${index + 1}. ${component.type || 'Component'}`,
        findings: component.findings || '',
        suggestions: component.suggestions || '',
        photos: collectMedia(component.photos),
        videos: collectMedia(component.videos),
      })),
    };
  }, [report]);

  const downloadHtml = () => {
    if (!documentModel) return;
    const html = buildMediaReportHtml(documentModel);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = sanitizeFilename(documentModel.clientName || 'informe');
    link.href = url;
    link.download = `Informe_videos_${safeName}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-mute flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !report || !documentModel) {
    return (
      <div className="min-h-screen bg-brand-mute flex items-center justify-center p-6">
        <p className="text-brand-red">Could not load the media report.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-mute py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-panel border border-slate-200 rounded-xl overflow-hidden">
        <div className="h-1.5 bg-brand-red" />
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
                Informe con videos
              </p>
              <h1 className="text-2xl font-display font-bold text-slate-900 mt-1">
                {documentModel.clientName}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {documentModel.machineType} · {documentModel.model} · S/N {documentModel.serialNumber}
              </p>
              <p className="text-sm text-slate-600">
                OTT {documentModel.ott} · Horómetro {documentModel.hourmeter} · {documentModel.reportDate}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={downloadHtml}>
                Descargar para enviar
              </Button>
              <Link to={`/reports/${report.id}`}>
                <Button variant="outline" type="button">Volver al informe</Button>
              </Link>
            </div>
          </div>

          <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            El archivo HTML se abre en el navegador y reproduce los videos. Quien lo reciba necesita internet porque los videos están en el almacenamiento del informe.
          </p>

          {documentModel.reasonOfService && (
            <section>
              <h2 className="font-display font-semibold text-slate-900">Reason of service</h2>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{documentModel.reasonOfService}</p>
            </section>
          )}

          {documentModel.sections.map((section) => (
            <section key={section.title} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <h2 className="font-display font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.findings}</p>
              {section.suggestions && (
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  <span className="font-medium text-slate-800">Suggestions: </span>
                  {section.suggestions}
                </p>
              )}
              {section.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {section.photos.map((photo) => (
                    <img
                      key={photo.url}
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded border border-slate-200"
                    />
                  ))}
                </div>
              )}
              {section.videos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">Videos</p>
                  {section.videos.map((video) => (
                    <video
                      key={video.url}
                      src={video.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-80 rounded border border-slate-200 bg-black"
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          {documentModel.conclusions && (
            <section>
              <h2 className="font-display font-semibold text-slate-900">Conclusions</h2>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{documentModel.conclusions}</p>
            </section>
          )}
          {documentModel.overallSuggestions && (
            <section>
              <h2 className="font-display font-semibold text-slate-900">Overall suggestions</h2>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{documentModel.overallSuggestions}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
