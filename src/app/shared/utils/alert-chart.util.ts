import { ChartConfiguration } from 'chart.js';
import { Alert, AlertSeverity } from '../../models/alert.model';

const TIME_BUCKETS = [
  { label: '00:00', start: 0, end: 6 },
  { label: '06:00', start: 6, end: 12 },
  { label: '12:00', start: 12, end: 18 },
  { label: '18:00', start: 18, end: 23 },
  { label: '23:59', start: 23, end: 24 }
] as const;

function countByBucket(alerts: Alert[], severities: AlertSeverity[]): number[] {
  return TIME_BUCKETS.map(({ start, end }) =>
    alerts.filter((alert) => {
      const hour = new Date(alert.fechaHora).getHours();
      const inBucket = end === 24 ? hour >= start : hour >= start && hour < end;
      return inBucket && severities.includes(alert.severidad);
    }).length
  );
}

export function buildAlertFrequencyChart(alerts: Alert[]): ChartConfiguration<'line'>['data'] {
  return {
    labels: TIME_BUCKETS.map((bucket) => bucket.label),
    datasets: [
      {
        label: 'Críticas',
        data: countByBucket(alerts, ['ALTA']),
        borderColor: '#0f2744',
        backgroundColor: 'rgba(15, 39, 68, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'Medias',
        data: countByBucket(alerts, ['MEDIA']),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3
      }
    ]
  };
}

export const ALERT_FREQUENCY_CHART_OPTIONS: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'end',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: false
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6c757d', font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        color: '#6c757d',
        font: { size: 11 }
      },
      grid: { color: 'rgba(15, 39, 68, 0.06)' }
    }
  }
};

export function severityLabel(severity: AlertSeverity): string {
  const labels: Record<AlertSeverity, string> = {
    ALTA: 'Crítica',
    MEDIA: 'Advertencia',
    BAJA: 'Informativa'
  };
  return labels[severity];
}

export function severityClass(severity: AlertSeverity): string {
  const classes: Record<AlertSeverity, string> = {
    ALTA: 'vg-severity-pill--alta',
    MEDIA: 'vg-severity-pill--media',
    BAJA: 'vg-severity-pill--baja'
  };
  return classes[severity];
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatAlertDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}:${seconds}`;
}
