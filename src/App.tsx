import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { HeaderForm } from './components/HeaderForm';
import { MaterialItemForm } from './components/MaterialItemForm';
import { ItemsTable } from './components/ItemsTable';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { HistoryView } from './components/HistoryView';
import { CatalogRulesView } from './components/CatalogRulesView';
import { ReceivedItem, ReceivingHeader, ReceivingRecord } from './types/receiving';
import { generateProtocol, getNowLocalInput } from './utils/formatters';

type ActiveView = 'registro' | 'historico' | 'regras';
type RegistrationStep = 'identificacao' | 'a_receber';

const DRAFT_STORAGE_KEY = 'recebimento_materiais_rascunho_local_v1';
const HISTORY_STORAGE_KEY = 'recebimento_materiais_historico_v1';
const DEMO_RECORD_ID = 'demo-carga-teste-001';

// UUID fallback for browsers/webviews that do not expose crypto.randomUUID().
function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function createEmptyHeader(): ReceivingHeader {
  return {
    id: createId(),
    protocol: generateProtocol(),
    receivedAt: getNowLocalInput(),
    driverName: '',
    vehiclePlate: '',
    invoiceNumber: '',
    invoiceSeries: '',
    receiverName: '',
    notes: '',
  };
}

function sanitizeHeader(raw: Partial<ReceivingHeader> | null | undefined): ReceivingHeader {
  const empty = createEmptyHeader();
  if (!raw || typeof raw !== 'object') return empty;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : empty.id,
    protocol: typeof raw.protocol === 'string' && raw.protocol ? raw.protocol : empty.protocol,
    receivedAt: typeof raw.receivedAt === 'string' ? raw.receivedAt : empty.receivedAt,
    driverName: typeof raw.driverName === 'string' ? raw.driverName : '',
    vehiclePlate: typeof raw.vehiclePlate === 'string' ? raw.vehiclePlate : '',
    invoiceNumber: typeof raw.invoiceNumber === 'string' ? raw.invoiceNumber : '',
    invoiceSeries: typeof raw.invoiceSeries === 'string' ? raw.invoiceSeries : '',
    receiverName: typeof raw.receiverName === 'string' ? raw.receiverName : '',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
  };
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function sanitizeItems(rawItems: unknown): ReceivedItem[] {
  if (!Array.isArray(rawItems)) return [];
  const categories = new Set(['arame', 'bobina', 'barra', 'tela_pop', 'prego', 'outros']);
  return rawItems.flatMap((raw): ReceivedItem[] => {
    if (!raw || typeof raw !== 'object') return [];
    const item = raw as Partial<ReceivedItem>;
    if (typeof item.id !== 'string' || !item.id || typeof item.category !== 'string' || !categories.has(item.category)) return [];
    const batches = Array.isArray(item.coilBatches)
      ? item.coilBatches.flatMap((rawBatch) => {
          if (!rawBatch || typeof rawBatch !== 'object') return [];
          const batch = rawBatch as Partial<NonNullable<ReceivedItem['coilBatches']>[number]>;
          if (typeof batch.id !== 'string' || typeof batch.units !== 'number' || !Number.isFinite(batch.units)) return [];
          return [{
            id: batch.id,
            units: batch.units,
            labelWeightsKg: Array.isArray(batch.labelWeightsKg)
              ? batch.labelWeightsKg.filter((weight): weight is number => typeof weight === 'number' && Number.isFinite(weight))
              : [],
            totalLabelKg: finiteOrNull(batch.totalLabelKg),
            scaleKg: finiteOrNull(batch.scaleKg),
          }];
        })
      : undefined;
    return [{
      ...item,
      id: item.id,
      category: item.category as ReceivedItem['category'],
      materialTitle: typeof item.materialTitle === 'string' ? item.materialTitle : 'Material',
      specification: typeof item.specification === 'string' ? item.specification : '',
      boxes: finiteOrNull(item.boxes),
      rolls: finiteOrNull(item.rolls),
      units: finiteOrNull(item.units),
      weightLabelKg: finiteOrNull(item.weightLabelKg),
      weightScaleKg: finiteOrNull(item.weightScaleKg),
      finalWeightKg: finiteOrNull(item.finalWeightKg),
      weightRuleNote: typeof item.weightRuleNote === 'string' ? item.weightRuleNote : '',
      itemNotes: typeof item.itemNotes === 'string' ? item.itemNotes : '',
      coilLabelWeightsKg: Array.isArray(item.coilLabelWeightsKg)
        ? item.coilLabelWeightsKg.filter((weight): weight is number => typeof weight === 'number' && Number.isFinite(weight))
        : undefined,
      coilBatches: batches,
    } as ReceivedItem];
  });
}

function loadDraft(): { header: ReceivingHeader; items: ReceivedItem[] } {
  try {
    // Preserve drafts created by the previous version; do not delete or rewrite either key.
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      ?? localStorage.getItem('recebimento_materiais_rascunho_v1');
    if (!raw) return { header: createEmptyHeader(), items: [] };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.header && Array.isArray(parsed.items)) {
      if (parsed.header.id === DEMO_RECORD_ID) {
        return { header: createEmptyHeader(), items: [] };
      }
      return {
        header: sanitizeHeader(parsed.header),
        items: sanitizeItems(parsed.items),
      };
    }
  } catch {
    // ignore storage errors
  }
  return { header: createEmptyHeader(), items: [] };
}

function loadLocalHistory(): ReceivingRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => r && typeof r === 'object' && r?.header?.id !== DEMO_RECORD_ID).map((r) => ({ header: sanitizeHeader(r.header), items: sanitizeItems(r.items), updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString() }));
  } catch { return []; }
}

function hasMeaningfulContent(header: ReceivingHeader, items: ReceivedItem[]): boolean {
  return (
    header.invoiceNumber.trim().length > 0 ||
    (header.invoiceSeries || '').trim().length > 0 ||
    header.driverName.trim().length > 0 ||
    header.vehiclePlate.trim().length > 0 ||
    header.receiverName.trim().length > 0 ||
    header.notes.trim().length > 0 ||
    items.length > 0
  );
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(',')}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).filter((key) => record[key] !== undefined).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function buildRecordSignature(header: ReceivingHeader, items: ReceivedItem[]): string {
  return stableJson({ header, items });
}

function loadInitialAppState(): {
  header: ReceivingHeader;
  items: ReceivedItem[];
} {
  const draft = loadDraft();

  return {
    header: draft.header,
    items: draft.items,
  };
}

export default function App() {
  const [initialState] = useState(() => loadInitialAppState());

  const [activeView, setActiveView] = useState<ActiveView>('registro');
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(
    initialState.items.length > 0 ? 'a_receber' : 'identificacao',
  );
  const [header, setHeader] = useState<ReceivingHeader>(initialState.header);
  const [items, setItems] = useState<ReceivedItem[]>(initialState.items);
  const [editingItem, setEditingItem] = useState<ReceivedItem | null>(null);
  const [history, setHistory] = useState<ReceivingRecord[]>(loadLocalHistory);
  const [saving, setSaving] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  const lastSavedSignatureRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<ReceivingRecord | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Auto-save active draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ header, items }));
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível salvar o rascunho neste navegador. Verifique o espaço disponível e as permissões de armazenamento.' });
    }
  }, [header, items]);

  // Histórico local: os registros ficam somente neste navegador/aparelho.
  useEffect(() => {
    try { localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)); } catch {
      setFeedback({ type: 'error', text: 'O armazenamento do aparelho está cheio. Exporte ou remova registros antigos.' });
    }
  }, [history]);

  // Auto-dismiss transient feedback
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  const currentRecord: ReceivingRecord = {
    header,
    items,
    updatedAt: new Date().toISOString(),
  };

  const handleSaveItem = (saved: ReceivedItem) => {
    setItems((prev) => {
      const exists = prev.some((it) => it.id === saved.id);
      if (exists) {
        return prev.map((it) => (it.id === saved.id ? saved : it));
      }
      return [...prev, saved];
    });
    setEditingItem(null);
    setFeedback({
      type: 'success',
      text: editingItem
        ? `Item "${saved.materialTitle}" atualizado na carga.`
        : `Item "${saved.materialTitle}" adicionado à carga.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (editingItem?.id === id) setEditingItem(null);
  };

  const validateHeaderFields = (): boolean => {
    const headerValid =
      header.invoiceNumber.trim().length > 0 &&
      header.driverName.trim().length > 0 &&
      header.vehiclePlate.trim().length > 0 &&
      header.receiverName.trim().length > 0;

    if (!headerValid) {
      setShowValidationErrors(true);
      setRegistrationStep('identificacao');
      setFeedback({
        type: 'error',
        text: 'Preencha Nota Fiscal, Fornecedor, Veículo e Conferente para continuar.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const handleOpenAReceber = () => {
    if (!validateHeaderFields()) return;
    setShowValidationErrors(false);
    setRegistrationStep('a_receber');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForPrint = (): boolean => {
    if (!validateHeaderFields()) return false;

    if (items.length === 0) {
      setFeedback({
        type: 'error',
        text: 'Adicione pelo menos um material à carga antes de imprimir.',
      });
      return false;
    }

    return true;
  };

  const saveRecord = useCallback(async (recordToSave: ReceivingRecord, silent = false): Promise<boolean> => {
    setSaving(true);
    try {
      const normalized = { ...recordToSave, updatedAt: new Date().toISOString() };
      setHistory((previous) => {
        const exists = previous.some((record) => record.header.id === normalized.header.id);
        const next = exists
          ? previous.map((record) => record.header.id === normalized.header.id ? normalized : record)
          : [normalized, ...previous];
        return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
      const signature = buildRecordSignature(normalized.header, normalized.items);
      lastSavedSignatureRef.current = signature;
      setSavedSignature(signature);
      if (!silent) setFeedback({ type: 'success', text: `Recebimento ${normalized.header.protocol} salvo neste aparelho.` });
      return true;
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível salvar neste aparelho.' });
      return false;
    } finally { setSaving(false); }
  }, []);

  // Salvamento automático local após pequenas pausas na edição.
  useEffect(() => {
    if (!hasMeaningfulContent(header, items)) return;
    const currentSig = buildRecordSignature(header, items);
    if (lastSavedSignatureRef.current === currentSig) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const snapshot: ReceivingRecord = { header, items, updatedAt: new Date().toISOString() };
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      void saveRecord(snapshot, true);
    }, 800);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    };
  }, [header, items, saveRecord]);

  const handleSaveOnly = async () => {
    if (!hasMeaningfulContent(header, items)) {
      setFeedback({ type: 'error', text: 'Preencha os dados da carga ou adicione materiais para salvar no histórico.' });
      return;
    }
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    await saveRecord(currentRecord);
  };

  const handleOpenPreview = async () => {
    if (!validateForPrint()) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (await saveRecord(currentRecord)) setPreviewRecord(currentRecord);
  };

  const handleStartNew = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (hasMeaningfulContent(header, items) && lastSavedSignatureRef.current !== buildRecordSignature(header, items)) {
      if (!await saveRecord(currentRecord)) return;
    }
    lastSavedSignatureRef.current = null;
    setSavedSignature(null);
    setHeader(createEmptyHeader());
    setItems([]);
    setEditingItem(null);
    setShowValidationErrors(false);
    setRegistrationStep('identificacao');
    setActiveView('registro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback({
      type: 'success',
      text: 'Novo registro em branco iniciado. Preencha a identificação e avance para cadastrar os produtos.',
    });
  };

  const handleOpenFromHistory = async (record: ReceivingRecord) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    const currentSignature = buildRecordSignature(header, items);
    if (hasMeaningfulContent(header, items) && lastSavedSignatureRef.current !== currentSignature) {
      if (!await saveRecord(currentRecord)) return;
    }
    const nextHeader = sanitizeHeader(record.header);
    const nextItems = sanitizeItems(record.items);
    const sig = buildRecordSignature(nextHeader, nextItems);
    lastSavedSignatureRef.current = sig;
    setSavedSignature(sig);
    setHeader(nextHeader);
    setItems(nextItems);
    setEditingItem(null);
    setShowValidationErrors(false);
    setRegistrationStep(nextItems.length > 0 ? 'a_receber' : 'identificacao');
    setActiveView('registro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateFromHistory = async (record: ReceivingRecord) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    const currentSignature = buildRecordSignature(header, items);
    if (hasMeaningfulContent(header, items) && lastSavedSignatureRef.current !== currentSignature) {
      if (!await saveRecord(currentRecord)) return;
    }
    const newId = createId();
    const dupHeader: ReceivingHeader = {
      ...record.header,
      id: newId,
      protocol: generateProtocol(),
      receivedAt: getNowLocalInput(),
      invoiceNumber: '',
      invoiceSeries: '',
    };
    const dupItems = record.items.map((it) => ({ ...it, id: createId() }));
    lastSavedSignatureRef.current = null;
    setSavedSignature(null);
    setHeader(dupHeader);
    setItems(dupItems);
    setEditingItem(null);
    setShowValidationErrors(false);
    setRegistrationStep('identificacao');
    setActiveView('registro');
    setFeedback({
      type: 'success',
      text: 'Registro duplicado. Informe a nova Nota Fiscal da carga.',
    });
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory((previous) => previous.filter((record) => record.header.id !== id));
    if (header.id === id) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      lastSavedSignatureRef.current = null;
      setSavedSignature(null);
      setHeader(createEmptyHeader());
      setItems([]);
      setEditingItem(null);
      setShowValidationErrors(false);
      setRegistrationStep('identificacao');
    }
    setFeedback({ type: 'success', text: 'Registro removido deste aparelho.' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f5] text-stone-800">
      {/* Top Bar Contract: Brand wordmark — Nav links — 1 primary action */}
      <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-14 md:h-16 py-2 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4 gap-y-2">
          <a
            href="#registro"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('registro');
            }}
            className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="text-stone-900">Arames</span>{' '}
            <span className="text-[#c94a4a]">Brasil</span>
          </a>

          <nav className="order-3 md:order-2 w-full md:w-auto flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={handleStartNew}
              disabled={saving}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'registro'
                  ? 'border-[#c94a4a] text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Novo Registro
            </button>
            <button
              type="button"
              onClick={() => setActiveView('historico')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'historico'
                  ? 'border-[#c94a4a] text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Histórico ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('regras')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'regras'
                  ? 'border-[#c94a4a] text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Tabela de Regras
            </button>
          </nav>

          <div className="order-2 md:order-3 shrink-0 flex items-center gap-2">
            {activeView === 'registro' ? (
              <button
                type="button"
                onClick={handleOpenPreview}
                disabled={saving}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#c94a4a] hover:bg-[#b53e3e] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#c94a4a] hover:bg-[#b53e3e] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Novo Recebimento
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="no-print flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-red-50/80 border-red-200 text-[#8f2f2f]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#c94a4a] shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {activeView === 'registro' && (
          <>
            {/* Workspace intro & secondary toolbar */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-800">
                  Registro
                </h1>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const isSynced =
                    hasMeaningfulContent(header, items) &&
                    savedSignature === buildRecordSignature(header, items);
                  return (
                    <button
                      type="button"
                      onClick={handleSaveOnly}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isSynced && !saving ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {saving ? 'Salvando…' : isSynced ? 'Salvo neste aparelho' : 'Salvar no aparelho'}
                    </button>
                  );
                })()}
              </div>
            </div>

            {registrationStep === 'identificacao' ? (
              <HeaderForm
                header={header}
                onChange={setHeader}
                showValidationErrors={showValidationErrors}
                onContinue={handleOpenAReceber}
              />
            ) : (
              <>
                {/* Barra compacta da Identificação com botão para editar */}
                <section className="bg-white border border-stone-200 rounded-xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-600">
                    <span className="font-mono font-semibold text-stone-800">
                      NF {header.invoiceNumber || '—'}
                      {header.invoiceSeries ? ` · Série ${header.invoiceSeries}` : ''}
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline text-stone-300">|</span>
                    <span>
                      Fornecedor: <strong className="text-stone-800">{header.driverName || '—'}</strong>
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline text-stone-300">|</span>
                    <span>
                      Veículo: <strong className="text-stone-800">{header.vehiclePlate || '—'}</strong>
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline text-stone-300">|</span>
                    <span>
                      Conferente: <strong className="text-stone-800">{header.receiverName || '—'}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegistrationStep('identificacao')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar Identificação
                  </button>
                </section>

                <MaterialItemForm
                  editingItem={editingItem}
                  onSaveItem={handleSaveItem}
                  onCancelEdit={() => setEditingItem(null)}
                />

                <ItemsTable
                  items={items}
                  editingItemId={editingItem?.id || null}
                  onEditItem={(item) => {
                    setEditingItem(item);
                    const formEl = document.getElementById('a-receber-form');
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  onRemoveItem={handleRemoveItem}
                />
              </>
            )}
          </>
        )}

        {activeView === 'historico' && (
          <HistoryView
            records={history}
            onOpenRecord={handleOpenFromHistory}
            onDuplicateRecord={handleDuplicateFromHistory}
            onDeleteRecord={handleDeleteFromHistory}
            onPrintPreview={(rec) => setPreviewRecord(rec)}
            onStartNew={handleStartNew}
          />
        )}

        {activeView === 'regras' && <CatalogRulesView />}
      </main>


      {/* Print Preview Modal */}
      {previewRecord && (
        <DocumentPreviewModal
          record={previewRecord}
          onClose={() => setPreviewRecord(null)}
        />
      )}
    </div>
  );
}
