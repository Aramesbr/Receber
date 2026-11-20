import React, { useState } from 'react';
import {
  Search,
  Printer,
  FolderOpen,
  Copy,
  Trash2,
  ClipboardList,
  X,
} from 'lucide-react';
import { ReceivingRecord } from '../types/receiving';
import { computeRecordTotals, formatDateTimeBr, formatKg } from '../utils/formatters';

interface HistoryViewProps {
  records: ReceivingRecord[];
  onOpenRecord: (record: ReceivingRecord) => void;
  onDuplicateRecord: (record: ReceivingRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintPreview: (record: ReceivingRecord) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onOpenRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onPrintPreview,
  onStartNew,
}) => {
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = records.filter((rec) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      rec.header.invoiceNumber.toLowerCase().includes(q) ||
      (rec.header.invoiceSeries || '').toLowerCase().includes(q) ||
      rec.header.driverName.toLowerCase().includes(q) ||
      rec.header.vehiclePlate.toLowerCase().includes(q) ||
      rec.header.receiverName.toLowerCase().includes(q) ||
      rec.header.protocol.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Histórico de Recebimentos Salvos
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Consulte as cargas registradas neste navegador, edite informações ou visualize para imprimir.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por NF, fornecedor, veículo..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="py-14 text-center">
            <ClipboardList className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">
              Nenhum recebimento salvo no histórico ainda.
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Ao salvar um registro ou visualizar para impressão, a carga aparece aqui automaticamente.
            </p>
            <button
              type="button"
              onClick={onStartNew}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Registrar Primeira Carga
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Nenhum recebimento encontrado para "{query}".
          </div>
        ) : (
          <>
            {/* Telefone (Mobile Cards) */}
            <div className="md:hidden divide-y divide-slate-200 mt-2">
              {filtered.map((rec) => {
                const totals = computeRecordTotals(rec.items);
                const isConfirming = confirmDeleteId === rec.header.id;
                return (
                  <div key={rec.header.id} className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono font-semibold text-sm text-slate-900">
                          NF {rec.header.invoiceNumber || 'S/N'}
                          {rec.header.invoiceSeries ? ` · Série ${rec.header.invoiceSeries}` : ''}
                        </div>
                        <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                          {rec.header.protocol} · {formatDateTimeBr(rec.header.receivedAt)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                          {formatKg(totals.totalFinalKg)}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          {totals.totalItems} {totals.totalItems === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="truncate">
                        Mot.: <span className="text-slate-900 font-medium">{rec.header.driverName || '—'}</span>
                      </div>
                      <div className="truncate">
                        Veíc.: <span className="text-slate-900 font-medium">{rec.header.vehiclePlate || '—'}</span>
                      </div>
                      <div className="col-span-2 truncate">
                        Conf.: <span className="text-slate-900 font-medium">{rec.header.receiverName || '—'}</span>
                      </div>
                    </div>

                    {isConfirming ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteRecord(rec.header.id);
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirmar Exclusão
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenRecord(rec)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Abrir
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintPreview(rec)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Imprimir
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRecord(rec)}
                          title="Duplicar registro"
                          aria-label="Duplicar registro"
                          className="p-2 text-slate-600 bg-slate-100 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(rec.header.id)}
                          title="Excluir registro"
                          aria-label="Excluir registro"
                          className="p-2 text-slate-600 bg-slate-100 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PC (Desktop Table) */}
            <div className="hidden md:block overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th className="py-3 pr-3">Nota Fiscal / Registro</th>
                    <th className="py-3 px-3">Fornecedor e Veículo</th>
                    <th className="py-3 px-3">Conferente</th>
                    <th className="py-3 px-3 text-right">Itens</th>
                    <th className="py-3 px-3 text-right">Peso Total</th>
                    <th className="py-3 pl-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((rec) => {
                    const totals = computeRecordTotals(rec.items);
                    const isConfirming = confirmDeleteId === rec.header.id;
                    return (
                      <tr key={rec.header.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-3 align-top">
                          <div className="font-mono font-semibold text-slate-900">
                            NF {rec.header.invoiceNumber || 'S/N'}
                            {rec.header.invoiceSeries ? ` · Série ${rec.header.invoiceSeries}` : ''}
                          </div>
                          <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                            {rec.header.protocol} · {formatDateTimeBr(rec.header.receivedAt)}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <div className="font-medium text-slate-800">
                            {rec.header.driverName || '—'}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {rec.header.vehiclePlate || '—'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 align-top text-slate-700">
                          {rec.header.receiverName || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 align-top whitespace-nowrap">
                          {totals.totalItems} {totals.totalItems === 1 ? 'item' : 'itens'}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 align-top whitespace-nowrap">
                          {formatKg(totals.totalFinalKg)}
                        </td>
                        <td className="py-3.5 pl-3 text-right align-top whitespace-nowrap">
                          {isConfirming ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteRecord(rec.header.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onOpenRecord(rec)}
                                title="Abrir para editar"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                Abrir
                              </button>
                              <button
                                type="button"
                                onClick={() => onPrintPreview(rec)}
                                title="Visualizar e imprimir"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Imprimir
                              </button>
                              <button
                                type="button"
                                onClick={() => onDuplicateRecord(rec)}
                                title="Duplicar registro"
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(rec.header.id)}
                                title="Excluir registro"
                                className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
