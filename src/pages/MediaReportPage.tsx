import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useReport } from '../hooks/useReports';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { Button } from '../components/atoms/Button';

type MediaItem = { url: string; name: string };

const toMediaUrl = (item: any): MediaItem | null => {
  if (!item) return null;
  if (typeof item === 'string') {
    return { url: item, name: item.split('/').pop() || 'media' };
  }
  const raw = item.file_path || item.url;
  if (!raw) return null;
  const url = raw.startsWith('http') || raw.startsWith('/') ? raw : `/${raw}`;
  return {
    url,
    name: item.video_name || item.photo_name || item.original_name || item.filename || 'media',
  };
};

/** Same inspection content as the PDF, plus playable videos. The PDF download stays image-only. */
export const MediaReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useReport(id || '');
  const report = data?.data;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <p className="text-brand-red">Could not load the media report.</p>
      </DashboardLayout>
    );
  }

  const components = Array.isArray(report.components) ? report.components : [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white shadow-panel border border-slate-200 rounded-xl overflow-hidden">
        <div className="h-1.5 bg-brand-red" />
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
                Informe con videos
              </p>
              <h1 className="text-2xl font-display font-bold text-slate-900 mt-1">
                {report.client_name}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {report.machine_type} · {report.model} · S/N {report.serial_number}
              </p>
              <p className="text-sm text-slate-600">
                OTT {report.ott || '-'} · Horómetro {report.hourmeter ?? '-'} · {report.report_date || ''}
              </p>
            </div>
            <Link to={`/reports/${report.id}`}>
              <Button variant="outline" type="button">Back to report</Button>
            </Link>
          </div>

          {report.reason_of_service && (
            <section>
              <h2 className="font-display font-semibold text-slate-900">Reason of service</h2>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{report.reason_of_service}</p>
            </section>
          )}

          {components.map((component: any, index: number) => {
            const photos = (Array.isArray(component.photos) ? component.photos : [])
              .map(toMediaUrl)
              .filter((item: MediaItem | null): item is MediaItem => Boolean(item));
            const videos = (Array.isArray(component.videos) ? component.videos : [])
              .map(toMediaUrl)
              .filter((item: MediaItem | null): item is MediaItem => Boolean(item));

            return (
              <section key={component.id || index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h2 className="font-display font-semibold text-slate-900">
                  {index + 1}. {component.type || 'Component'}
                </h2>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{component.findings}</p>
                {component.suggestions && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    <span className="font-medium text-slate-800">Suggestions: </span>
                    {component.suggestions}
                  </p>
                )}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <img
                        key={photo.url}
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-32 object-cover rounded border border-slate-200"
                      />
                    ))}
                  </div>
                )}
                {videos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-800">Videos</p>
                    {videos.map((video) => (
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
            );
          })}

          {report.conclusions && (
            <section>
              <h2 className="font-display font-semibold text-slate-900">Conclusions</h2>
              <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{report.conclusions}</p>
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
