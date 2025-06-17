import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { LoadingSpinner } from './LoadingSpinner';
import { apiService } from '../../services/api';

interface ReportActionsProps {
  reportId: string;
  reportName: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  reportId,
  reportName,
  onSuccess,
  onError
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${apiService.getBaseUrl()}/reports/${reportId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${reportName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onSuccess?.('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      onError?.('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emails.trim()) {
      onError?.('Por favor ingrese al menos un email');
      return;
    }

    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    
    setIsSendingEmail(true);
    try {
      const response = await fetch(`${apiService.getBaseUrl()}/reports/${reportId}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: emailList,
          subject: subject || `Reporte de Inspección - ${reportName}`,
          message: message || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        const { totalSent, totalFailed } = result.data;
        const message = `Email enviado a ${totalSent} destinatarios${totalFailed > 0 ? `, ${totalFailed} fallidos` : ''}`;
        onSuccess?.(message);
        setShowEmailForm(false);
        setEmails('');
        setSubject('');
        setMessage('');
      } else {
        onError?.('Error al enviar el email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      onError?.('Error al enviar el email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" />
              Descargando...
            </>
          ) : (
            <>
              📄 Descargar PDF
            </>
          )}
        </Button>

        <Button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          📧 Enviar por Email
        </Button>
      </div>

      {showEmailForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Enviar Reporte por Email</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emails (separados por comas)
              </label>
              <Input
                type="text"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="email1@ejemplo.com, email2@ejemplo.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto (opcional)
              </label>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Reporte de Inspección - ${reportName}`}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje personalizado (opcional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensaje personalizado para el destinatario..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSendingEmail ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Email'
                )}
              </Button>

              <Button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmails('');
                  setSubject('');
                  setMessage('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 