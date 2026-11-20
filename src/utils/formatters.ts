import { ReceivedItem } from '../types/receiving';

export function formatKg(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kg`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('pt-BR');
}

export function formatDateTimeBr(isoLocal: string): string {
  if (!isoLocal) return '—';
  const date = new Date(isoLocal);
  if (Number.isNaN(date.getTime())) return isoLocal;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNowLocalInput(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function generateProtocol(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(100 + Math.random() * 900));
  return `REC-${y}${m}${d}-${rand}`;
}

export function formatItemQuantity(item: ReceivedItem): string {
  if (item.category === 'arame') {
    if (item.packaging === 'caixa_20kg' && item.boxes !== null) {
      return `${formatNumber(item.boxes)} cx (${formatNumber(item.units)} un)`;
    }
    if (item.packaging === 'rolo' && item.rolls !== null) {
      return `${formatNumber(item.rolls)} ${item.rolls === 1 ? 'rolo' : 'rolos'}`;
    }
  }
  if (item.category === 'bobina' && item.units !== null) {
    return `${formatNumber(item.units)} ${item.units === 1 ? 'bobina' : 'bobinas'}`;
  }
  if (item.category === 'barra') {
    if (item.units !== null && item.units > 0) {
      return `${formatNumber(item.units)} ${item.units === 1 ? 'unidade' : 'unidades'}`;
    }
    return 'Por peso (kg)';
  }
  if (item.category === 'tela_pop' && item.units !== null) {
    return `${formatNumber(item.units)} ${item.units === 1 ? 'unidade' : 'unidades'}`;
  }
  if (item.category === 'prego') {
    if (item.boxes !== null && item.boxes > 0) {
      if (item.unitsPerBox) {
        return `${formatNumber(item.boxes)} cx × ${formatNumber(item.unitsPerBox)} un (${formatNumber(item.units)} un)`;
      }
      return `${formatNumber(item.boxes)} cx (${formatNumber(item.units)} un)`;
    }
    if (item.units !== null && item.units > 0) {
      return `${formatNumber(item.units)} ${item.units === 1 ? 'unidade' : 'unidades'}`;
    }
    return '—';
  }
  if (item.category === 'outros') {
    if (item.units !== null && item.units > 0) {
      return `${formatNumber(item.units)} ${item.units === 1 ? 'unidade' : 'unidades'}`;
    }
    return 'Por peso (kg)';
  }
  return '—';
}

export function getWeightDifference(item: ReceivedItem): number | null {
  if (item.category === 'bobina' && item.coilBatches && item.coilBatches.length > 0) {
    let diffSum = 0;
    let hasComparedBatch = false;
    for (const batch of item.coilBatches) {
      if (batch.totalLabelKg !== null && batch.scaleKg !== null) {
        diffSum += batch.scaleKg - batch.totalLabelKg;
        hasComparedBatch = true;
      }
    }
    return hasComparedBatch ? Number(diffSum.toFixed(2)) : null;
  }

  if (item.weightLabelKg !== null && item.weightScaleKg !== null) {
    return Number((item.weightScaleKg - item.weightLabelKg).toFixed(2));
  }
  return null;
}

export function computeRecordTotals(items: ReceivedItem[]) {
  const totalItems = items.length;
  let totalUnits = 0;
  let totalLabelKg = 0;
  let totalScaleKg = 0;
  let totalFinalKg = 0;
  let totalDiffKg = 0;
  let hasLabelWeight = false;
  let hasScaleWeight = false;
  let hasAnyWeight = false;
  let hasDiff = false;

  for (const item of items) {
    if (item.units !== null && Number.isFinite(item.units) && item.units > 0) {
      totalUnits += item.units;
    }
    if (item.weightLabelKg !== null && Number.isFinite(item.weightLabelKg)) {
      totalLabelKg += item.weightLabelKg;
      hasLabelWeight = true;
    }
    if (item.weightScaleKg !== null && Number.isFinite(item.weightScaleKg)) {
      totalScaleKg += item.weightScaleKg;
      hasScaleWeight = true;
    }
    if (item.finalWeightKg !== null && Number.isFinite(item.finalWeightKg)) {
      totalFinalKg += item.finalWeightKg;
      hasAnyWeight = true;
    }
    const itemDiff = getWeightDifference(item);
    if (itemDiff !== null && Number.isFinite(itemDiff)) {
      totalDiffKg += itemDiff;
      hasDiff = true;
    }
  }

  return {
    totalItems,
    totalUnits,
    totalLabelKg: hasLabelWeight ? Number(totalLabelKg.toFixed(2)) : null,
    totalScaleKg: hasScaleWeight ? Number(totalScaleKg.toFixed(2)) : null,
    totalFinalKg: hasAnyWeight ? Number(totalFinalKg.toFixed(2)) : null,
    totalDiffKg: hasDiff ? Number(totalDiffKg.toFixed(2)) : null,
  };
}
