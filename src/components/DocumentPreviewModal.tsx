import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { MATERIAL_CATEGORIES } from '../data/materialCatalog';
import { ReceivingRecord } from '../types/receiving';
import {
  computeRecordTotals,
  formatDateTimeBr,
  formatItemQuantity,
  formatKg,
  formatNumber,
  getWeightDifference,
} from '../utils/formatters';

interface DocumentPreviewModalProps {
  record: ReceivingRecord;
  onClose: () => void;
}

function formatDiffKg(diff: number | null): string {
  if (diff === null) return '—';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kg`;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  record,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const totals = computeRecordTotals(record.items);

  const groupedCategories = MATERIAL_CATEGORIES.map((cat) => ({
    category: cat,
    items: record.items.filter((it) => it.category === cat.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className="print-modal-root fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="print-modal-card bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-xl">
        {/* Top bar */}
        <div className="no-print px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Pré-visualização para Impressão
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confira o comprovante abaixo antes de imprimir.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir Agora
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar pré-visualização"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="print-modal-body p-3 sm:p-10 overflow-y-auto bg-slate-50/50">
          <div className="print-sheet bg-white border border-slate-200 rounded-lg p-4 sm:p-9 max-w-[760px] mx-auto text-slate-900 space-y-6">
            {/* Cabeçalho Simples */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-3 border-b-2 border-slate-900">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                RECEBIMENTO DE MATERIAL
              </h1>
              <div className="text-xs font-mono tabular-nums text-slate-600">
                {record.header.protocol} · {formatDateTimeBr(record.header.receivedAt)}
              </div>
            </div>

            {/* Identificação em 4 colunas simples */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200 text-xs">
              <div>
                <div className="text-slate-500">Nota Fiscal / Série</div>
                <div className="font-semibold font-mono text-slate-900 mt-0.5">
                  {record.header.invoiceNumber || '—'}
                  {record.header.invoiceSeries ? ` · Série ${record.header.invoiceSeries}` : ''}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Fornecedor</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {record.header.driverName || '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Veículo</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {record.header.vehiclePlate || '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Recebido por</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {record.header.receiverName || '—'}
                </div>
              </div>
            </div>

            {/* Tabelas separadas por categoria */}
            {groupedCategories.map(({ category, items: catItems }) => {
              const catTotals = computeRecordTotals(catItems);

              if (category.id === 'bobina') {
                const coilDiffTotal = catTotals.totalDiffKg;

                return (
                  <div key={category.id} className="print-avoid-break">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-2">
                      {category.label}
                    </div>
                    <div className="overflow-x-auto print:overflow-visible">
                      <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                          <th className="py-2 pr-2">Material</th>
                          <th className="py-2 px-2">Qtd.</th>
                          <th className="py-2 px-2 text-right">Etiqueta</th>
                          <th className="py-2 px-2 text-right">Balança</th>
                          <th className="py-2 pl-2 text-right">Diferencial kg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {catItems.map((item) => {
                          const hasMultiBatches = item.coilBatches && item.coilBatches.length > 1;
                          if (hasMultiBatches && item.coilBatches) {
                            return item.coilBatches.map((batch, bIdx) => {
                              const bDiff =
                                batch.totalLabelKg !== null && batch.scaleKg !== null
                                  ? Number((batch.scaleKg - batch.totalLabelKg).toFixed(2))
                                  : null;
                              return (
                                <tr key={`${item.id}-${batch.id}`}>
                                  <td className="py-2.5 pr-2 align-top">
                                    <span className="font-semibold text-slate-900">
                                      Bobina {item.gauge}
                                    </span>
                                    <span className="text-slate-600"> · Pesagem {bIdx + 1}</span>
                                    {bIdx === 0 && item.itemNotes && (
                                      <div className="text-[11px] text-slate-500 mt-0.5">
                                        Obs: {item.itemNotes}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 font-mono tabular-nums text-slate-800 align-top whitespace-nowrap">
                                    {batch.units} {batch.units === 1 ? 'bobina' : 'bobinas'}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                    {formatKg(batch.totalLabelKg)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                    {formatKg(batch.scaleKg)}
                                  </td>
                                  <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-semibold text-slate-900 align-top whitespace-nowrap">
                                    {formatDiffKg(bDiff)}
                                  </td>
                                </tr>
                              );
                            });
                          }

                          const diff = getWeightDifference(item);
                          return (
                            <tr key={item.id}>
                              <td className="py-2.5 pr-2 align-top">
                                <div className="font-semibold text-slate-900">
                                  Bobina{' '}
                                  <span className="font-normal text-slate-600">· {item.gauge}</span>
                                </div>
                                {item.itemNotes && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Obs: {item.itemNotes}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-2 font-mono tabular-nums text-slate-800 align-top whitespace-nowrap">
                                {formatItemQuantity(item)}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                {formatKg(item.weightLabelKg)}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                {formatKg(item.weightScaleKg)}
                              </td>
                              <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-semibold text-slate-900 align-top whitespace-nowrap">
                                {formatDiffKg(diff)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-900 font-semibold text-slate-900">
                          <td className="py-2.5 pr-2">Total Bobinas</td>
                          <td className="py-2.5 px-2 font-mono tabular-nums whitespace-nowrap">
                            {catTotals.totalUnits > 0
                              ? `${formatNumber(catTotals.totalUnits)} un`
                              : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {formatKg(catTotals.totalLabelKg)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {formatKg(catTotals.totalScaleKg)}
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                            {formatDiffKg(coilDiffTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    </div>
                  </div>
                );
              }

              return (
                <div key={category.id} className="print-avoid-break">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-2">
                    {category.label}
                  </div>
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600 font-semibold">
                        <th className="py-2 pr-2">Material</th>
                        <th className="py-2 px-2">Qtd.</th>
                        <th className="py-2 px-2 text-right">Etiqueta</th>
                        <th className="py-2 px-2 text-right">Balança</th>
                        <th className="py-2 pl-2 text-right">Total (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {catItems.map((item) => {
                        const diff = getWeightDifference(item);
                        const extraLine = [
                          diff !== null ? `Dif.: ${formatDiffKg(diff)}` : null,
                          item.itemNotes ? `Obs: ${item.itemNotes}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ');

                        return (
                          <tr key={item.id}>
                            <td className="py-2.5 pr-2 align-top">
                              <div className="font-semibold text-slate-900">
                                {item.materialTitle}
                                <span className="font-normal text-slate-600">
                                  {' '}
                                  · {item.gauge ? `Bitola ${item.gauge}` : item.specification}
                                </span>
                              </div>
                              {extraLine && (
                                <div className="text-[11px] font-mono tabular-nums text-slate-500 mt-0.5">
                                  {extraLine}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-2 font-mono tabular-nums text-slate-800 align-top whitespace-nowrap">
                              {formatItemQuantity(item)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                              {formatKg(item.weightLabelKg)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                              {formatKg(item.weightScaleKg)}
                            </td>
                            <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-semibold text-slate-900 align-top whitespace-nowrap">
                              {formatKg(item.finalWeightKg)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-900 font-semibold text-slate-900">
                        <td className="py-2.5 pr-2">
                          Total {category.label} ({catTotals.totalItems}{' '}
                          {catTotals.totalItems === 1 ? 'item' : 'itens'})
                        </td>
                        <td className="py-2.5 px-2 font-mono tabular-nums whitespace-nowrap">
                          {catTotals.totalUnits > 0
                            ? `${formatNumber(catTotals.totalUnits)} un`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {formatKg(catTotals.totalLabelKg)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                          {formatKg(catTotals.totalScaleKg)}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                          {formatKg(catTotals.totalFinalKg)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  </div>
                </div>
              );
            })}

            {/* Resumo geral em 1 linha quando houver mais de 1 categoria */}
            {groupedCategories.length > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs font-semibold text-slate-900 font-mono tabular-nums">
                <span>
                  Resumo Geral: {totals.totalItems} itens ·{' '}
                  {totals.totalUnits > 0 ? `${formatNumber(totals.totalUnits)} un` : '—'}
                </span>
                <span>Peso Total Recebido: {formatKg(totals.totalFinalKg)}</span>
              </div>
            )}

            {/* Observações (somente se houver) */}
            {record.header.notes.trim() && (
              <div className="text-xs text-slate-700 pt-1">
                <span className="font-semibold text-slate-900">Observações:</span>{' '}
                {record.header.notes}
              </div>
            )}

            {/* Assinaturas */}
            <div className="print-avoid-break pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-8 sm:gap-10 print:gap-10">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-1.5 text-xs font-semibold text-slate-900">
                  {record.header.driverName || 'Fornecedor'}
                </div>
                <div className="text-[11px] text-slate-500">Fornecedor</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-1.5 text-xs font-semibold text-slate-900">
                  {record.header.receiverName || 'Conferente'}
                </div>
                <div className="text-[11px] text-slate-500">Conferente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
