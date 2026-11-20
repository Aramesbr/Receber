import React from 'react';
import {
  BAR_GAUGES,
  COIL_GAUGES,
  NAIL_GAUGES,
  SMOOTH_WIRE_GAUGES,
  TELA_POP_SPECS,
  TWISTED_WIRE_GAUGES,
} from '../data/materialCatalog';

export const CatalogRulesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
        <div className="pb-4 mb-6 border-b border-slate-100">
          <h1 className="text-xl font-semibold text-slate-900">
            Tabela de Materiais e Regras de Recebimento
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Guia rápido de conferência para cada tipo de material recebido na portaria ou depósito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Arames */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1. Arames (Torcido e Liso)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Caixas padrão de 20 kg (20 unidades de 1 kg) ou rolos de 25 a 75 kg.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3.5">
                <div className="font-semibold text-slate-800">Arame Torcido</div>
                {TWISTED_WIRE_GAUGES.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between text-xs text-slate-600 mt-1.5"
                  >
                    <span className="font-mono font-medium text-slate-800">{g.label}</span>
                    <span>Caixa 20 kg · 20 unidades</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-lg p-3.5">
                <div className="font-semibold text-slate-800 mb-1.5">Arame Liso</div>
                <div className="divide-y divide-slate-200/70">
                  {SMOOTH_WIRE_GAUGES.map((g) => (
                    <div
                      key={g.id}
                      className="py-2 flex items-center justify-between gap-4 text-xs"
                    >
                      <span className="font-mono font-medium text-slate-800">{g.label}</span>
                      <span className="text-slate-600 text-right">
                        {g.allowedPackagings.includes('caixa_20kg')
                          ? 'Caixa 20 kg (1 kg/un) ou Rolo (25–75 kg)'
                          : 'Rolo (25 a 75 kg)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Bobinas e 3. Barras */}
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">2. Bobinas</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recebimento por unidades e kg. É possível lançar o peso de cada etiqueta individualmente para somar e comparar com a pesagem conjunta na balança (pelo menos um peso é obrigatório).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {COIL_GAUGES.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 text-slate-800 rounded-lg"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">3. Barras</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pesagem obrigatória em kg por etiqueta ou balança (ou ambos se houver etiqueta). Quantidade de barras opcional.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {BAR_GAUGES.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 text-slate-800 rounded-lg"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Telas Pop */}
          <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                4. Telas Pop (Recebimento por Unidades)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Conferência direta pela quantidade de unidades recebidas por modelo e malha.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TELA_POP_SPECS.map((spec) => (
                <div key={spec.code} className="bg-slate-50 rounded-lg p-3.5">
                  <div className="text-sm font-semibold text-slate-900">{spec.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{spec.fullDescription}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Pregos */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">5. Pregos</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recebimento em caixas, informando a quantidade de caixas e quantas unidades de 1 kg vêm por caixa.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {NAIL_GAUGES.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 text-slate-800 rounded-lg"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* 6. Outros Produtos */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-2">
            <h2 className="text-base font-semibold text-slate-900">6. Outros Produtos</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Permite cadastrar qualquer produto adicional escolhendo o controle por{' '}
              <strong>Unidade</strong>, por <strong>Kg</strong> (etiqueta e/ou balança) ou{' '}
              <strong>Unidade e Kg</strong>, conforme a natureza do material.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
