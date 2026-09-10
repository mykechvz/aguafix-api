export interface ReportEmailData {
  address: string;
  description: string;
  severity: string;
  reporterPhone: string;
}

const SEVERITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#2e7d32',
  medium: '#f9a825',
  high: '#c62828',
};

export function generateReportTemplate(dto: ReportEmailData): string {
  const severityLabel = SEVERITY_LABELS[dto.severity] ?? dto.severity;
  const severityColor = SEVERITY_COLORS[dto.severity] ?? '#455a64';

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
        <tr>
          <td style="background-color: #0277bd; padding: 20px 24px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 18px;">Nuevo reporte de fuga de agua</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px; color: #333333; font-size: 14px;">
              Se registró un nuevo reporte ciudadano. Estos son los detalles:
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #333333;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 140px;">Dirección</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">${dto.address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold;">Descripción</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">${dto.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; font-weight: bold;">Severidad</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                  <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; background-color: ${severityColor}; color: #ffffff; font-size: 12px; font-weight: bold;">
                    ${severityLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Teléfono de contacto</td>
                <td style="padding: 8px 0;">${dto.reporterPhone}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f4f6f8; padding: 16px 24px; font-size: 12px; color: #757575;">
            AguaFix &mdash; Aviso automático para la cuadrilla de mantenimiento.
          </td>
        </tr>
      </table>
    </div>
  `;
}
