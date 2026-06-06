export function buildSparklinePoints(
  values: number[],
  width: number,
  height: number,
  padding = 2
): string {
  if (values.length === 0) {
    return '';
  }

  if (values.length === 1) {
    const y = height / 2;
    return `M${padding},${y} L${width - padding},${y}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const innerHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = padding + innerHeight - ((value - min) / range) * innerHeight;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export type VitalLevel = 'normal' | 'warning' | 'critical';

export function getFcLevel(frecuenciaCardiaca: number): VitalLevel {
  if (frecuenciaCardiaca > 120 || frecuenciaCardiaca < 50) {
    return 'critical';
  }
  if (frecuenciaCardiaca > 100 || frecuenciaCardiaca < 60) {
    return 'warning';
  }
  return 'normal';
}

export function getSpo2Level(saturacionOxigeno: number): VitalLevel {
  if (saturacionOxigeno < 90) {
    return 'critical';
  }
  if (saturacionOxigeno < 92) {
    return 'warning';
  }
  return 'normal';
}
