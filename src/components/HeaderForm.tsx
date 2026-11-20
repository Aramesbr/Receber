import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ReceivingHeader } from '../types/receiving';

interface HeaderFormProps {
  header: ReceivingHeader;
  onChange: (updated: ReceivingHeader) => void;
  showValidationErrors: boolean;
  onContinue?: () => void;
}

export const HeaderForm: React.FC<HeaderFormProps> = ({
  header,
  onChange,
  showValidationErrors,
  onContinue,
}) => {
  const updateField = <K extends keyof ReceivingHeader>(
    key: K,
    value: ReceivingHeader[K],
  ) => {
    onChange({ ...header, [key]: value });
  };

  const missingInvoice = showValidationErrors && !header.invoiceNumber.trim();
  const missingDriver = showValidationErrors && !header.driverName.trim();
  const missingVehicle = showValidationErrors && !header.vehiclePlate.trim();
  const missingReceiver = showValidationErrors && !header.receiverName.trim();

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            01. Identificação
          </h2>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500">
          Registro: <span className="font-semibold text-slate-800">{header.protocol}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="invoiceNumber"
              className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap"
            >
              Nota Fiscal <span className="text-red-600">*</span>
            </label>
            <input
              id="invoiceNumber"
              type="text"
              value={header.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              placeholder="Ex: 004582"
              className={`w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                missingInvoice
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
              }`}
            />
            {missingInvoice && (
              <p className="text-xs text-red-600 mt-1">Informe a nota fiscal.</p>
            )}
          </div>

          <div className="w-24 sm:w-32 shrink-0">
            <label
              htmlFor="invoiceSeries"
              className="block text-sm font-medium text-slate-700 mb-1.5 whitespace-nowrap"
            >
              Nº de Série
            </label>
            <input
              id="invoiceSeries"
              type="text"
              value={header.invoiceSeries || ''}
              onChange={(e) => updateField('invoiceSeries', e.target.value)}
              placeholder="Ex: 001"
              className="w-full px-3 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="driverName"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Fornecedor <span className="text-red-600">*</span>
          </label>
          <input
            id="driverName"
            type="text"
            value={header.driverName}
            onChange={(e) => updateField('driverName', e.target.value)}
            placeholder="Nome do fornecedor"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              missingDriver
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {missingDriver && (
            <p className="text-xs text-red-600 mt-1">Informe o nome do fornecedor.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="vehiclePlate"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Veículo <span className="text-red-600">*</span>
          </label>
          <input
            id="vehiclePlate"
            type="text"
            value={header.vehiclePlate}
            onChange={(e) => updateField('vehiclePlate', e.target.value)}
            placeholder="Ex: Caminhão"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              missingVehicle
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {missingVehicle && (
            <p className="text-xs text-red-600 mt-1">Informe o veículo.</p>
          )}
        </div>

        <div>
          <label
            htmlFor="receiverName"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Conferente <span className="text-red-600">*</span>
          </label>
          <input
            id="receiverName"
            type="text"
            value={header.receiverName}
            onChange={(e) => updateField('receiverName', e.target.value)}
            placeholder="Nome de quem recebeu a carga"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              missingReceiver
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
            }`}
          />
          {missingReceiver && (
            <p className="text-xs text-red-600 mt-1">Informe o conferente.</p>
          )}
        </div>

        <div className="min-w-0">
          <label
            htmlFor="receivedAt"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Data e Hora do Recebimento
          </label>
          <input
            id="receivedAt"
            type="datetime-local"
            value={header.receivedAt}
            onChange={(e) => updateField('receivedAt', e.target.value)}
            className="w-full min-w-0 px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="headerNotes"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Observações Gerais (opcional)
          </label>
          <input
            id="headerNotes"
            type="text"
            value={header.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Ex: Carga conferida sem avarias"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>
      </div>

      {onContinue && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Abrir A Receber
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
