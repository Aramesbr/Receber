import React from 'react';
import { Pencil, Trash2, PackageOpen } from 'lucide-react';
import { MATERIAL_CATEGORIES } from '../data/materialCatalog';
import { ReceivedItem } from '../types/receiving';
import {
  computeRecordTotals,
  formatItemQuantity,
  formatKg,
  formatNumber,
  getWeightDifference,
} from '../utils/formatters';

interface ItemsTableProps {
  items: ReceivedItem[];
  editingItemId: string | null;
  onEditItem: (item: ReceivedItem) => void;
  onRemoveItem: (id: string) => void;
}

function formatDiffText(diff: number | null): string {
  if (diff === null) return '—';
  return `${diff > 0 ? '+' : ''}${diff.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kg`;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  editingItemId,
  onEditItem,
  onRemoveItem,
}) => {
  const totals = computeRecordTotals(items);

  const groupedCategories = MATERIAL_CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((item) => item.category === cat.id),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            03. Materiais Lançados na Carga
          </h2>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-600">
          {totals.totalItems} {totals.totalItems === 1 ? 'item lançado' : 'itens lançados'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <PackageOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Nenhum lançamento
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-200">
            {groupedCategories.map(({ category, items: catItems }) => {
              const catTotals = computeRecordTotals(catItems);
              const catDiff = catTotals.totalDiffKg;

              return (
                <div key={category.id}>
                  {/* Cabeçalho da Categoria */}
                  <div className="px-4 sm:px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {category.label}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-slate-600">
                      {catItems.length} {catItems.length === 1 ? 'lançamento' : 'lançamentos'}
                    </span>
                  </div>

                  {/* Telefone (Mobile Cards) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {catItems.map((item, idx) => {
                      const diff = getWeightDifference(item);
                      const isEditing = editingItemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`p-4 space-y-3 transition-colors ${
                            isEditing ? 'bg-blue-50/60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-mono tabular-nums text-xs text-slate-400">
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="font-semibold text-sm text-slate-900 break-words">
                                  {item.materialTitle}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 mt-0.5 break-words">
                                {item.gauge ? `Bitola ${item.gauge}` : item.specification}
                              </div>
                              {item.itemNotes && (
                                <div className="text-xs text-slate-500 mt-1 break-words">
                                  Obs: {item.itemNotes}
                                </div>
                              )}
                            </div>

                            <div className="inline-flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => onEditItem(item)}
                                title="Editar item"
                                aria-label="Editar item"
                                className="p-2 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                title="Remover item"
                                aria-label="Remover item"
                                className="p-2 text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div>
                              <div className="text-slate-500">Quantidade</div>
                              <div className="font-mono tabular-nums font-medium text-slate-900 mt-0.5">
                                {formatItemQuantity(item)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500">Diferencial kg</div>
                              <div className="font-mono tabular-nums font-medium text-slate-900 mt-0.5">
                                {formatDiffText(diff)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500">Etiqueta (kg)</div>
                              <div className="font-mono tabular-nums text-slate-700 mt-0.5">
                                {formatKg(item.weightLabelKg)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-500">Balança (kg)</div>
                              <div className="font-mono tabular-nums text-slate-700 mt-0.5">
                                {formatKg(item.weightScaleKg)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {catItems.length > 1 && (
                      <div className="p-4 bg-slate-50/80 border-t border-slate-200 text-xs space-y-1.5">
                        <div className="font-semibold text-slate-800">
                          Subtotal {category.label}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono tabular-nums text-slate-700">
                          <span>
                            Qtd:{' '}
                            {catTotals.totalUnits > 0
                              ? `${formatNumber(catTotals.totalUnits)} un`
                              : '—'}
                          </span>
                          <span>Dif: {formatDiffText(catDiff)}</span>
                          <span>Etiq: {formatKg(catTotals.totalLabelKg)}</span>
                          <span>Bal: {formatKg(catTotals.totalScaleKg)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PC (Desktop Table) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <th className="py-2.5 pl-6 pr-3 w-12">#</th>
                          <th className="py-2.5 px-3">Material</th>
                          <th className="py-2.5 px-3">Quantidade</th>
                          <th className="py-2.5 px-3 text-right">Etiqueta (kg)</th>
                          <th className="py-2.5 px-3 text-right">Balança (kg)</th>
                          <th className="py-2.5 px-3 text-right">Diferencial kg</th>
                          <th className="py-2.5 pl-3 pr-6 text-right w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {catItems.map((item, idx) => {
                          const diff = getWeightDifference(item);
                          const isEditing = editingItemId === item.id;
                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${
                                isEditing ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="py-3.5 pl-6 pr-3 font-mono tabular-nums text-xs text-slate-500 align-top">
                                {String(idx + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3.5 px-3 align-top">
                                <div className="font-semibold text-slate-900">
                                  {item.materialTitle}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">
                                  {item.gauge ? `Bitola ${item.gauge}` : item.specification}
                                </div>
                                {item.itemNotes && (
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    Obs: {item.itemNotes}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-3 font-mono tabular-nums text-slate-800 align-top whitespace-nowrap">
                                {formatItemQuantity(item)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                {formatKg(item.weightLabelKg)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600 align-top whitespace-nowrap">
                                {formatKg(item.weightScaleKg)}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-800 align-top whitespace-nowrap">
                                {formatDiffText(diff)}
                              </td>
                              <td className="py-3.5 pl-3 pr-6 text-right align-top whitespace-nowrap">
                                <div className="inline-flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onEditItem(item)}
                                    title="Editar item"
                                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id)}
                                    title="Remover item"
                                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {catItems.length > 1 && (
                        <tfoot>
                          <tr className="bg-slate-50/70 border-t border-slate-200 text-xs font-semibold text-slate-700">
                            <td className="py-2.5 pl-6 pr-3" />
                            <td className="py-2.5 px-3">Subtotal {category.label}</td>
                            <td className="py-2.5 px-3 font-mono tabular-nums whitespace-nowrap">
                              {catTotals.totalUnits > 0
                                ? `${formatNumber(catTotals.totalUnits)} un`
                                : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {formatKg(catTotals.totalLabelKg)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {formatKg(catTotals.totalScaleKg)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {formatDiffText(catDiff)}
                            </td>
                            <td className="py-2.5 pl-3 pr-6" />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Strip */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-500">Total de Unidades</div>
              <div className="text-base font-semibold font-mono tabular-nums text-slate-900 mt-0.5">
                {totals.totalUnits > 0 ? `${formatNumber(totals.totalUnits)} un` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Etiqueta</div>
              <div className="text-base font-semibold font-mono tabular-nums text-slate-700 mt-0.5">
                {formatKg(totals.totalLabelKg)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Total Balança</div>
              <div className="text-base font-semibold font-mono tabular-nums text-slate-700 mt-0.5">
                {formatKg(totals.totalScaleKg)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Peso Total Consolidado</div>
              <div className="text-base font-bold font-mono tabular-nums text-blue-800 mt-0.5">
                {formatKg(totals.totalFinalKg)}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
