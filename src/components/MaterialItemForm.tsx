import React, { useEffect, useRef, useState } from 'react';
import { Plus, Check, X, AlertTriangle, Info } from 'lucide-react';
import {
  BAR_GAUGES,
  COIL_GAUGES,
  MATERIAL_CATEGORIES,
  NAIL_GAUGES,
  SMOOTH_WIRE_GAUGES,
  TELA_POP_SPECS,
  TWISTED_WIRE_GAUGES,
} from '../data/materialCatalog';
import {
  CoilBatch,
  MaterialCategory,
  OtherMeasureMode,
  ReceivedItem,
  TelaPopCode,
  WirePackaging,
  WireType,
} from '../types/receiving';

interface MaterialItemFormProps {
  editingItem: ReceivedItem | null;
  onSaveItem: (item: ReceivedItem) => void;
  onCancelEdit: () => void;
}

function parsePositiveFloat(raw: string): number | null {
  const value = raw.trim();
  if (!value) return null;
  // Accept decimal comma or decimal point, but reject mixed/multiple separators.
  if (!/^\d+(?:[.,]\d+)?$/.test(value)) return null;
  const n = Number(value.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Number(n.toFixed(2));
}

function createId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function parsePositiveInt(raw: string): number | null {
  const value = raw.trim();
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export const MaterialItemForm: React.FC<MaterialItemFormProps> = ({
  editingItem,
  onSaveItem,
  onCancelEdit,
}) => {
  const [category, setCategory] = useState<MaterialCategory>('arame');

  // Arame states
  const [wireType, setWireType] = useState<WireType>('torcido');
  const [wireGauge, setWireGauge] = useState<string>('BWG 18 (1.24 mm)');
  const [wirePackaging, setWirePackaging] = useState<WirePackaging>('caixa_20kg');
  const [boxesStr, setBoxesStr] = useState<string>('');
  const [rollsStr, setRollsStr] = useState<string>('');

  // Bobina & Barra states
  const [coilGauge, setCoilGauge] = useState<string>('3.8 mm');
  const [coilLabelInputStr, setCoilLabelInputStr] = useState<string>('');
  const coilLabelInputRef = useRef<HTMLInputElement>(null);
  const lastCoilLabelAddAtRef = useRef(0);
  const [coilLabelWeights, setCoilLabelWeights] = useState<number[]>([]);
  const [coilBatches, setCoilBatches] = useState<CoilBatch[]>([]);
  const [barGauge, setBarGauge] = useState<string>('4.2 mm');

  // Tela Pop states
  const [telaModel, setTelaModel] = useState<TelaPopCode>('Q45');

  // Pregos states
  const [nailGauge, setNailGauge] = useState<string>('18 × 27');
  const [customNailGauge, setCustomNailGauge] = useState<string>('');
  const [nailUnitsPerBoxStr, setNailUnitsPerBoxStr] = useState<string>('');
  const nailUnitWeightKg = 1;

  // Outros states
  const [customName, setCustomName] = useState<string>('');
  const [otherMeasureMode, setOtherMeasureMode] = useState<OtherMeasureMode>('unidade');

  // Common quantity / weight / note states
  const [unitsStr, setUnitsStr] = useState<string>('');
  const [labelKgStr, setLabelKgStr] = useState<string>('');
  const [scaleKgStr, setScaleKgStr] = useState<string>('');
  const [itemNotes, setItemNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state when editingItem changes
  useEffect(() => {
    if (!editingItem) return;
    setCategory(editingItem.category);
    if (editingItem.wireType) setWireType(editingItem.wireType);
    if (editingItem.gauge) {
      if (editingItem.category === 'arame') setWireGauge(editingItem.gauge);
      if (editingItem.category === 'bobina') setCoilGauge(editingItem.gauge);
      if (editingItem.category === 'barra') setBarGauge(editingItem.gauge);
      if (editingItem.category === 'prego') {
        if (NAIL_GAUGES.includes(editingItem.gauge)) {
          setNailGauge(editingItem.gauge);
          setCustomNailGauge('');
        } else {
          setNailGauge('Outra');
          setCustomNailGauge(editingItem.gauge);
        }
      }
    }
    if (editingItem.category === 'arame' && (editingItem.packaging === 'caixa_20kg' || editingItem.packaging === 'rolo')) {
      setWirePackaging(editingItem.packaging);
    }
    if (editingItem.telaModel) setTelaModel(editingItem.telaModel);
    if (editingItem.customName) setCustomName(editingItem.customName);
    if (editingItem.otherMeasureMode) setOtherMeasureMode(editingItem.otherMeasureMode);

    if (editingItem.category === 'bobina' && editingItem.coilBatches && editingItem.coilBatches.length > 0) {
      setCoilBatches(editingItem.coilBatches);
      setCoilLabelWeights([]);
      setCoilLabelInputStr('');
      setUnitsStr('');
      setLabelKgStr('');
      setScaleKgStr('');
    } else if (editingItem.category === 'prego') {
      setCoilBatches([]);
      setCoilLabelWeights([]);
      setCoilLabelInputStr('');
      setNailUnitsPerBoxStr(editingItem.unitsPerBox ? String(editingItem.unitsPerBox) : '');
      setUnitsStr('');
      setLabelKgStr('');
      setScaleKgStr('');
    } else {
      setCoilBatches([]);
      setCoilLabelWeights(editingItem.coilLabelWeightsKg || []);
      setCoilLabelInputStr('');
      setUnitsStr(editingItem.units !== null ? String(editingItem.units) : '');
      setLabelKgStr(
        editingItem.weightLabelKg !== null ? String(editingItem.weightLabelKg) : '',
      );
      setScaleKgStr(
        editingItem.weightScaleKg !== null ? String(editingItem.weightScaleKg) : '',
      );
    }
    setBoxesStr(editingItem.boxes !== null ? String(editingItem.boxes) : '');
    setRollsStr(editingItem.rolls !== null ? String(editingItem.rolls) : '');
    setItemNotes(editingItem.itemNotes || '');
    setErrorMsg('');
  }, [editingItem]);

  const resetForm = (keepCategory = true) => {
    if (!keepCategory) {
      setCategory('arame');
      setWireType('torcido');
      setWireGauge('BWG 18 (1.24 mm)');
      setWirePackaging('caixa_20kg');
      setCoilGauge('3.8 mm');
      setBarGauge('4.2 mm');
      setTelaModel('Q45');
      setNailGauge('18 × 27');
      setOtherMeasureMode('unidade');
    }
    setCoilLabelInputStr('');
    setCoilLabelWeights([]);
    setCoilBatches([]);
    setBoxesStr('');
    setRollsStr('');
    setNailUnitsPerBoxStr('');
    setUnitsStr('');
    setLabelKgStr('');
    setScaleKgStr('');
    setCustomName('');
    setCustomNailGauge('');
    setItemNotes('');
    setErrorMsg('');
  };

  // Enforce valid gauge and packaging when switching wire type or gauge
  const currentWireSpecs = wireType === 'torcido' ? TWISTED_WIRE_GAUGES : SMOOTH_WIRE_GAUGES;
  const activeWireSpec =
    currentWireSpecs.find((g) => g.id === wireGauge) || currentWireSpecs[0];

  useEffect(() => {
    if (wireType === 'torcido') {
      setWireGauge('BWG 18 (1.24 mm)');
      setWirePackaging('caixa_20kg');
    } else {
      const spec = SMOOTH_WIRE_GAUGES.find((g) => g.id === wireGauge) || SMOOTH_WIRE_GAUGES[0];
      if (!spec.allowedPackagings.includes(wirePackaging)) {
        setWirePackaging(spec.allowedPackagings[0]);
      }
    }
  }, [wireType, wireGauge, wirePackaging]);

  const handleCategoryChange = (next: MaterialCategory) => {
    if (next === category) {
      setErrorMsg('');
      return;
    }
    resetForm(true);
    setCategory(next);
  };

  // Live helpers for wire boxes & rolls & coil labels & nails
  const parsedBoxes = parsePositiveInt(boxesStr);
  const parsedRolls = parsePositiveInt(rollsStr);
  const parsedNailUnitsPerBox = parsePositiveInt(nailUnitsPerBoxStr);
  const parsedLabelKg = parsePositiveFloat(labelKgStr);
  const parsedScaleKg = parsePositiveFloat(scaleKgStr);
  const parsedUnits = parsePositiveInt(unitsStr);

  const coilLabelsSum =
    coilLabelWeights.length > 0
      ? Number(coilLabelWeights.reduce((acc, w) => acc + w, 0).toFixed(2))
      : null;

  const handleAddCoilLabel = (rawValue?: string) => {
    const now = Date.now();
    if (now - lastCoilLabelAddAtRef.current < 250) return;
    const val = parsePositiveFloat(rawValue ?? coilLabelInputRef.current?.value ?? coilLabelInputStr);
    if (val === null) {
      setErrorMsg('Digite um peso válido maior que zero para a etiqueta da bobina.');
      return;
    }
    lastCoilLabelAddAtRef.current = now;
    const next = [...coilLabelWeights, val];
    const nextSum = Number(next.reduce((acc, w) => acc + w, 0).toFixed(2));
    setCoilLabelWeights(next);
    if (coilLabelInputRef.current) coilLabelInputRef.current.value = '';
    setCoilLabelInputStr('');
    setUnitsStr(String(next.length));
    setLabelKgStr(String(nextSum));
    setErrorMsg('');
    requestAnimationFrame(() => coilLabelInputRef.current?.focus({ preventScroll: true }));
  };

  const handleRemoveCoilLabel = (indexToRemove: number) => {
    const next = coilLabelWeights.filter((_, idx) => idx !== indexToRemove);
    setCoilLabelWeights(next);
    if (next.length > 0) {
      const nextSum = Number(next.reduce((acc, w) => acc + w, 0).toFixed(2));
      setUnitsStr(String(next.length));
      setLabelKgStr(String(nextSum));
    } else {
      setUnitsStr('');
      setLabelKgStr('');
    }
  };

  const buildCurrentCoilBatch = (): { batch: CoilBatch | null; hasAnyInput: boolean; error: string | null } => {
    let effectiveLabels = [...coilLabelWeights];
    let effectiveUnits = parsedUnits;
    let effectiveLabelKg = parsedLabelKg;

    const pendingLabelRaw = coilLabelInputStr.trim();
    const pendingLabelVal = parsePositiveFloat(coilLabelInputStr);
    if (pendingLabelRaw !== '' && pendingLabelVal === null) {
      return {
        batch: null,
        hasAnyInput: true,
        error: 'Digite um peso válido maior que zero para a etiqueta da bobina.',
      };
    }

    if (pendingLabelVal !== null) {
      effectiveLabels = [...effectiveLabels, pendingLabelVal];
      effectiveLabelKg = Number(
        effectiveLabels.reduce((acc, w) => acc + w, 0).toFixed(2),
      );
      effectiveUnits = effectiveLabels.length;
    }

    const hasAnyInput =
      effectiveLabels.length > 0 ||
      unitsStr.trim() !== '' ||
      labelKgStr.trim() !== '' ||
      scaleKgStr.trim() !== '' ||
      pendingLabelRaw !== '';

    if (!hasAnyInput) {
      return { batch: null, hasAnyInput: false, error: null };
    }

    if (!effectiveUnits) {
      return {
        batch: null,
        hasAnyInput: true,
        error: 'Informe a quantidade de unidades desta pesagem (ou adicione as etiquetas).',
      };
    }

    if (effectiveLabelKg === null && parsedScaleKg === null) {
      return {
        batch: null,
        hasAnyInput: true,
        error: 'Informe o peso das Etiquetas, da Balança ou ambos para esta pesagem.',
      };
    }

    return {
      batch: {
        id: createId(),
        units: effectiveUnits,
        labelWeightsKg: effectiveLabels,
        totalLabelKg: effectiveLabelKg,
        scaleKg: parsedScaleKg,
      },
      hasAnyInput: true,
      error: null,
    };
  };

  const handleSaveCoilBatch = () => {
    const { batch, hasAnyInput, error } = buildCurrentCoilBatch();
    if (!hasAnyInput) {
      setErrorMsg('Preencha as etiquetas/unidades e o peso da pesagem antes de salvar.');
      return;
    }
    if (error || !batch) {
      setErrorMsg(error || 'Dados inválidos na pesagem.');
      return;
    }
    setCoilBatches((prev) => [...prev, batch]);
    setCoilLabelInputStr('');
    setCoilLabelWeights([]);
    setUnitsStr('');
    setLabelKgStr('');
    setScaleKgStr('');
    setErrorMsg('');
  };

  const handleRemoveCoilBatch = (batchId: string) => {
    setCoilBatches((prev) => prev.filter((b) => b.id !== batchId));
  };

  const handleEditCoilBatch = (batch: CoilBatch) => {
    setCoilBatches((prev) => prev.filter((b) => b.id !== batch.id));
    setCoilLabelWeights(batch.labelWeightsKg);
    setCoilLabelInputStr('');
    setUnitsStr(String(batch.units));
    setLabelKgStr(batch.totalLabelKg !== null ? String(batch.totalLabelKg) : '');
    setScaleKgStr(batch.scaleKg !== null ? String(batch.scaleKg) : '');
    setErrorMsg('');
  };

  const coilBatchesSummary = (() => {
    if (coilBatches.length === 0) return null;
    const totalUnits = coilBatches.reduce((sum, b) => sum + b.units, 0);
    const hasLabel = coilBatches.some((b) => b.totalLabelKg !== null);
    const hasScale = coilBatches.some((b) => b.scaleKg !== null);
    const totalLabel = hasLabel
      ? Number(coilBatches.reduce((sum, b) => sum + (b.totalLabelKg ?? 0), 0).toFixed(2))
      : null;
    const totalScale = hasScale
      ? Number(coilBatches.reduce((sum, b) => sum + (b.scaleKg ?? 0), 0).toFixed(2))
      : null;

    let diffSum = 0;
    let hasComparedBatch = false;
    for (const batch of coilBatches) {
      if (batch.totalLabelKg !== null && batch.scaleKg !== null) {
        diffSum += batch.scaleKg - batch.totalLabelKg;
        hasComparedBatch = true;
      }
    }
    const totalDiff = hasComparedBatch ? Number(diffSum.toFixed(2)) : null;

    return { totalUnits, totalLabel, totalScale, totalDiff };
  })();

  const effectiveRollWeight = parsedScaleKg ?? parsedLabelKg;
  const avgRollWeight =
    parsedRolls && effectiveRollWeight
      ? Number((effectiveRollWeight / parsedRolls).toFixed(2))
      : null;
  const isRollOutOfRange =
    avgRollWeight !== null && (avgRollWeight < 25 || avgRollWeight > 75);

  const effectiveLabelKgForLiveDiff =
    category === 'arame' && (wireType === 'torcido' || wirePackaging === 'caixa_20kg')
      ? parsedBoxes
        ? parsedBoxes * 20
        : null
      : parsedLabelKg;

  const canShowLiveDiff =
    category !== 'tela_pop' &&
    category !== 'prego' &&
    !(category === 'outros' && otherMeasureMode === 'unidade');

  const liveDiffKg =
    canShowLiveDiff && effectiveLabelKgForLiveDiff !== null && parsedScaleKg !== null
      ? Number((parsedScaleKg - effectiveLabelKgForLiveDiff).toFixed(2))
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      category === 'bobina' &&
      coilLabelInputRef.current &&
      document.activeElement === coilLabelInputRef.current
    ) {
      handleAddCoilLabel(coilLabelInputRef.current.value);
      return;
    }
    setErrorMsg('');

    const id = editingItem?.id || createId();

    if (category === 'arame') {
      if (wireType === 'torcido' || wirePackaging === 'caixa_20kg') {
        if (!parsedBoxes) {
          setErrorMsg('Informe a quantidade de caixas (número inteiro maior que zero).');
          return;
        }
        const totalUnits = parsedBoxes * 20;
        const standardWeight = parsedBoxes * 20;
        const finalWeight = parsedScaleKg ?? standardWeight;

        const item: ReceivedItem = {
          id,
          category: 'arame',
          wireType,
          gauge: activeWireSpec.id,
          packaging: 'caixa_20kg',
          materialTitle: wireType === 'torcido' ? 'Arame Torcido' : 'Arame Liso',
          specification: `${activeWireSpec.id} · Caixa 20 kg (20 un de 1 kg)`,
          boxes: parsedBoxes,
          rolls: null,
          units: totalUnits,
          weightLabelKg: standardWeight,
          weightScaleKg: parsedScaleKg,
          finalWeightKg: finalWeight,
          weightRuleNote: parsedScaleKg
            ? `Padrão caixa (${standardWeight} kg) conferido na balança`
            : `Cálculo padrão: ${parsedBoxes} cx × 20 kg (20 un/cx)`,
          itemNotes: itemNotes.trim(),
        };
        onSaveItem(item);
        resetForm(true);
        return;
      }

      // Arame Liso em Rolo (25 a 75 kg)
      if (!parsedRolls) {
        setErrorMsg('Informe a quantidade de rolos recebidos.');
        return;
      }
      if (parsedLabelKg === null && parsedScaleKg === null) {
        setErrorMsg('Informe pelo menos um peso (Etiqueta ou Balança) para os rolos.');
        return;
      }
      const finalWeight = parsedScaleKg ?? parsedLabelKg!;
      const avg = Number((finalWeight / parsedRolls).toFixed(2));

      const item: ReceivedItem = {
        id,
        category: 'arame',
        wireType: 'liso',
        gauge: activeWireSpec.id,
        packaging: 'rolo',
        materialTitle: 'Arame Liso',
        specification: `${activeWireSpec.id} · Rolo (faixa 25 a 75 kg/rolo)`,
        boxes: null,
        rolls: parsedRolls,
        units: parsedRolls,
        weightLabelKg: parsedLabelKg,
        weightScaleKg: parsedScaleKg,
        finalWeightKg: finalWeight,
        weightRuleNote: `Média de ${avg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg por rolo`,
        itemNotes: itemNotes.trim(),
      };
      onSaveItem(item);
      resetForm(true);
      return;
    }

    if (category === 'bobina') {
      const { batch: currentBatch, hasAnyInput, error } = buildCurrentCoilBatch();
      if (hasAnyInput && (error || !currentBatch)) {
        setErrorMsg(error || 'Complete ou limpe a pesagem atual antes de adicionar à carga.');
        return;
      }

      const allBatches: CoilBatch[] = [
        ...coilBatches,
        ...(currentBatch ? [currentBatch] : []),
      ];

      if (allBatches.length === 0) {
        setErrorMsg('Preencha uma pesagem (unidades e peso por etiqueta ou balança) ou salve ao menos uma pesagem.');
        return;
      }

      const totalUnits = allBatches.reduce((sum, b) => sum + b.units, 0);
      const hasAnyLabel = allBatches.some((b) => b.totalLabelKg !== null);
      const hasAnyScale = allBatches.some((b) => b.scaleKg !== null);
      const totalLabelKg = hasAnyLabel
        ? Number(allBatches.reduce((sum, b) => sum + (b.totalLabelKg ?? 0), 0).toFixed(2))
        : null;
      const totalScaleKg = hasAnyScale
        ? Number(allBatches.reduce((sum, b) => sum + (b.scaleKg ?? 0), 0).toFixed(2))
        : null;
      const finalWeightKg = Number(
        allBatches
          .reduce((sum, b) => sum + (b.scaleKg ?? b.totalLabelKg ?? 0), 0)
          .toFixed(2),
      );
      const allLabelsFlat = allBatches.flatMap((b) => b.labelWeightsKg);

      const weightSource =
        allBatches.length > 1
          ? `Conferido em ${allBatches.length} pesagens (${allBatches.map((b) => `${b.units} un`).join(' + ')})`
          : totalScaleKg !== null && totalLabelKg !== null
            ? allLabelsFlat.length > 0
              ? `Soma de ${allLabelsFlat.length} etiquetas comparada com pesagem na balança`
              : 'Etiqueta e Balança informadas (peso final pela balança)'
            : totalScaleKg !== null
              ? 'Pesagem na Balança'
              : allLabelsFlat.length > 0
                ? `Soma de ${allLabelsFlat.length} etiquetas individuais`
                : 'Pesagem pela Etiqueta';

      const item: ReceivedItem = {
        id,
        category: 'bobina',
        gauge: coilGauge,
        materialTitle: 'Bobina',
        specification: `Bitola ${coilGauge} · ${totalUnits} ${totalUnits === 1 ? 'bobina' : 'bobinas'}`,
        boxes: null,
        rolls: null,
        units: totalUnits,
        coilLabelWeightsKg: allLabelsFlat.length > 0 ? allLabelsFlat : undefined,
        coilBatches: allBatches,
        weightLabelKg: totalLabelKg,
        weightScaleKg: totalScaleKg,
        finalWeightKg,
        weightRuleNote: weightSource,
        itemNotes: itemNotes.trim(),
      };
      onSaveItem(item);
      resetForm(true);
      return;
    }

    if (category === 'barra') {
      if (parsedLabelKg === null && parsedScaleKg === null) {
        setErrorMsg('Para Barras, é obrigatório informar o peso da Etiqueta, da Balança ou ambos.');
        return;
      }
      const finalWeight = parsedScaleKg ?? parsedLabelKg!;
      const weightSource =
        parsedScaleKg !== null && parsedLabelKg !== null
          ? 'Etiqueta e Balança informadas (peso final pela balança)'
          : parsedScaleKg !== null
            ? 'Pesagem pela Balança'
            : 'Pesagem pela Etiqueta';

      const item: ReceivedItem = {
        id,
        category: 'barra',
        gauge: barGauge,
        materialTitle: 'Barras',
        specification: `Bitola ${barGauge} · Pesagem em kg`,
        boxes: null,
        rolls: null,
        units: parsedUnits,
        weightLabelKg: parsedLabelKg,
        weightScaleKg: parsedScaleKg,
        finalWeightKg: finalWeight,
        weightRuleNote: weightSource,
        itemNotes: itemNotes.trim(),
      };
      onSaveItem(item);
      resetForm(true);
      return;
    }

    if (category === 'tela_pop') {
      if (!parsedUnits) {
        setErrorMsg('Informe a quantidade de unidades da Tela Pop.');
        return;
      }
      const spec = TELA_POP_SPECS.find((t) => t.code === telaModel)!;
      const item: ReceivedItem = {
        id,
        category: 'tela_pop',
        telaModel: spec.code,
        gauge: spec.diameter,
        materialTitle: `Tela Pop ${spec.code}`,
        specification: `${spec.title} · ${spec.fullDescription}`,
        boxes: null,
        rolls: null,
        units: parsedUnits,
        weightLabelKg: null,
        weightScaleKg: null,
        finalWeightKg: null,
        weightRuleNote: 'Recebimento por unidades',
        itemNotes: itemNotes.trim(),
      };
      onSaveItem(item);
      resetForm(true);
      return;
    }

    if (category === 'prego') {
      const effectiveGauge = nailGauge === 'Outra' ? customNailGauge.trim() : nailGauge;
      if (!effectiveGauge) {
        setErrorMsg('Informe a bitola/medida do prego (ex: 18 × 27).');
        return;
      }

      if (!parsedBoxes) {
        setErrorMsg('Informe a quantidade de caixas.');
        return;
      }
      if (!parsedNailUnitsPerBox) {
        setErrorMsg(
          `Informe quantas unidades de ${nailUnitWeightKg} kg vêm por caixa.`,
        );
        return;
      }

      const totalUnits = parsedBoxes * parsedNailUnitsPerBox;
      const standardWeightKg = totalUnits * nailUnitWeightKg;

      const item: ReceivedItem = {
        id,
        category: 'prego',
        gauge: effectiveGauge,
        packaging: 'caixa',
        unitsPerBox: parsedNailUnitsPerBox,
        unitWeightKg: nailUnitWeightKg,
        materialTitle: 'Pregos',
        specification: `Bitola ${effectiveGauge} · ${parsedNailUnitsPerBox} un (${nailUnitWeightKg} kg/un) por caixa`,
        boxes: parsedBoxes,
        rolls: null,
        units: totalUnits,
        weightLabelKg: standardWeightKg,
        weightScaleKg: null,
        finalWeightKg: standardWeightKg,
        weightRuleNote: `Cálculo padrão: ${parsedBoxes} cx × ${parsedNailUnitsPerBox} un × ${nailUnitWeightKg} kg`,
        itemNotes: itemNotes.trim(),
      };
      onSaveItem(item);
      resetForm(true);
      return;
    }

    // Outros
    if (!customName.trim()) {
      setErrorMsg('Informe o nome ou descrição do produto.');
      return;
    }

    if (otherMeasureMode === 'unidade') {
      if (!parsedUnits) {
        setErrorMsg('Informe a quantidade em unidades.');
        return;
      }
    } else if (otherMeasureMode === 'kg') {
      if (parsedLabelKg === null && parsedScaleKg === null) {
        setErrorMsg('Informe pelo menos um peso em kg (Etiqueta ou Balança).');
        return;
      }
    } else {
      if (!parsedUnits) {
        setErrorMsg('Informe a quantidade em unidades.');
        return;
      }
      if (parsedLabelKg === null && parsedScaleKg === null) {
        setErrorMsg('Informe pelo menos um peso em kg (Etiqueta ou Balança).');
        return;
      }
    }

    const finalOtherWeight =
      otherMeasureMode === 'unidade' ? null : parsedScaleKg ?? parsedLabelKg;

    const item: ReceivedItem = {
      id,
      category: 'outros',
      customName: customName.trim(),
      otherMeasureMode,
      materialTitle: customName.trim(),
      specification:
        otherMeasureMode === 'unidade'
          ? 'Produto diverso · Controle por unidade'
          : otherMeasureMode === 'kg'
            ? 'Produto diverso · Controle por kg'
            : 'Produto diverso · Controle por unidade e kg',
      boxes: null,
      rolls: null,
      units: otherMeasureMode === 'kg' ? null : parsedUnits,
      weightLabelKg: otherMeasureMode === 'unidade' ? null : parsedLabelKg,
      weightScaleKg: otherMeasureMode === 'unidade' ? null : parsedScaleKg,
      finalWeightKg: finalOtherWeight,
      weightRuleNote:
        otherMeasureMode === 'unidade'
          ? 'Recebimento por unidades'
          : parsedScaleKg !== null && parsedLabelKg !== null
            ? 'Etiqueta e Balança informadas (peso final pela balança)'
            : parsedScaleKg !== null
              ? 'Pesagem pela Balança'
              : 'Pesagem pela Etiqueta',
      itemNotes: itemNotes.trim(),
    };
    onSaveItem(item);
    resetForm(true);
  };

  return (
    <section id="a-receber-form" className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingItem ? 'Editar Material da Carga' : '02. A Receber'}
          </h2>
        </div>
        {editingItem && (
          <button
            type="button"
            onClick={() => {
              onCancelEdit();
              resetForm(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar Edição
          </button>
        )}
      </div>

      {/* Category Segmented Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
        {MATERIAL_CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="text-sm font-semibold truncate">{cat.label}</div>
              <div className="text-xs text-slate-500 truncate mt-0.5">{cat.shortDesc}</div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* CATEGORIA 1: ARAMES */}
        {category === 'arame' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tipo de Arame */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Arame
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setWireType('torcido')}
                    className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      wireType === 'torcido'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Arame Torcido
                  </button>
                  <button
                    type="button"
                    onClick={() => setWireType('liso')}
                    className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      wireType === 'liso'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Arame Liso
                  </button>
                </div>
              </div>

              {/* Bitola */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bitola (BWG)
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentWireSpecs.map((spec) => {
                    const active = activeWireSpec.id === spec.id;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setWireGauge(spec.id)}
                        className={`px-3 py-2 text-xs font-mono font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {spec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Embalagem / Formato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Formato / Embalagem
                </label>
                {activeWireSpec.allowedPackagings.length === 2 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setWirePackaging('caixa_20kg')}
                      className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        wirePackaging === 'caixa_20kg'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Caixa 20 kg (20 un)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWirePackaging('rolo')}
                      className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        wirePackaging === 'rolo'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Rolo (25 a 75 kg)
                    </button>
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                    {wireType === 'torcido'
                      ? 'Caixa padrão: 20 kg · 20 unidades (1 kg cada)'
                      : 'Rolo padrão: peso variado entre 25 kg e 75 kg'}
                  </div>
                )}
              </div>

              {/* Inputs conforme embalagem */}
              {wirePackaging === 'caixa_20kg' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="boxesInput"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Quantidade de Caixas <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="boxesInput"
                      type="text"
                      inputMode="numeric"
                      value={boxesStr}
                      onChange={(e) => setBoxesStr(e.target.value)}
                      placeholder="Ex: 10"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    {parsedBoxes && (
                      <p className="text-xs text-slate-600 mt-1.5 font-mono tabular-nums">
                        Total automático: {parsedBoxes * 20} un · {parsedBoxes * 20} kg
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="boxScaleKg"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Peso Balança (kg) — opcional
                    </label>
                    <input
                      id="boxScaleKg"
                      type="text"
                      inputMode="decimal"
                      value={scaleKgStr}
                      onChange={(e) => setScaleKgStr(e.target.value)}
                      placeholder="Se conferido na balança"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="rollsInput"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Qtd. de Rolos <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="rollsInput"
                      type="text"
                      inputMode="numeric"
                      value={rollsStr}
                      onChange={(e) => setRollsStr(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full px-3 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rollLabelKg"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Peso Etiqueta (kg)
                    </label>
                    <input
                      id="rollLabelKg"
                      type="text"
                      inputMode="decimal"
                      value={labelKgStr}
                      onChange={(e) => setLabelKgStr(e.target.value)}
                      placeholder="Ex: 245,00"
                      className="w-full px-3 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rollScaleKg"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Peso Balança (kg)
                    </label>
                    <input
                      id="rollScaleKg"
                      type="text"
                      inputMode="decimal"
                      value={scaleKgStr}
                      onChange={(e) => setScaleKgStr(e.target.value)}
                      placeholder="Ex: 244,50"
                      className="w-full px-3 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {wirePackaging === 'rolo' && avgRollWeight !== null && (
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs border ${
                  isRollOutOfRange
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {isRollOutOfRange ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 shrink-0" />
                )}
                <span>
                  Média calculada por rolo:{' '}
                  <strong className="font-mono tabular-nums">
                    {avgRollWeight.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    kg/rolo
                  </strong>{' '}
                  {isRollOutOfRange
                    ? '(fora da faixa padrão de 25 a 75 kg/rolo — verifique se houve rolo parcial).'
                    : '(dentro da faixa padrão de 25 a 75 kg/rolo).'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIA 2: BOBINAS */}
        {category === 'bobina' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bitola da Bobina
              </label>
              <div className="flex flex-wrap gap-2">
                {COIL_GAUGES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCoilGauge(g)}
                    className={`px-4 py-2 text-sm font-mono font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      coilGauge === g
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Painel da pesagem atual (ex: 3 em 3 bobinas) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  Pesagem #{coilBatches.length + 1} (ex: grupo de bobinas na balança)
                </div>
                {coilLabelsSum !== null && (
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-800">
                    {coilLabelWeights.length}{' '}
                    {coilLabelWeights.length === 1 ? 'etiqueta' : 'etiquetas'} · Soma:{' '}
                    {coilLabelsSum.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    kg
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="coilSingleLabelInput"
                  ref={coilLabelInputRef}
                  type="text"
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={coilLabelInputStr}
                  onChange={(e) => setCoilLabelInputStr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddCoilLabel(e.currentTarget.value);
                    }
                  }}
                  placeholder="Peso da etiqueta (kg) — aperte Enter para somar"
                  className="flex-1 px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => handleAddCoilLabel()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Incluir Etiqueta
                </button>
              </div>

              {coilLabelWeights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coilLabelWeights.map((w, idx) => (
                    <div
                      key={`${idx}-${w}`}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono tabular-nums text-slate-800"
                    >
                      <span className="text-slate-400">#{idx + 1}</span>
                      <span className="font-semibold">
                        {w.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        kg
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoilLabel(idx)}
                        aria-label={`Remover etiqueta ${idx + 1}`}
                        className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label
                    htmlFor="coilUnits"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Unidades desta pesagem <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="coilUnits"
                    type="text"
                    inputMode="numeric"
                    value={unitsStr}
                    onChange={(e) => setUnitsStr(e.target.value)}
                    placeholder="Ex: 3"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="coilLabelKg"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Soma Etiquetas (kg)
                  </label>
                  <input
                    id="coilLabelKg"
                    type="text"
                    inputMode="decimal"
                    value={labelKgStr}
                    onChange={(e) => setLabelKgStr(e.target.value)}
                    placeholder="Soma automática ou manual"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="coilScaleKg"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Peso na Balança (kg — juntas)
                  </label>
                  <input
                    id="coilScaleKg"
                    type="text"
                    inputMode="decimal"
                    value={scaleKgStr}
                    onChange={(e) => setScaleKgStr(e.target.value)}
                    placeholder="Peso desse grupo na balança"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">
                  Se precisar pesar em várias vezes (ex: de 3 em 3), salve esta pesagem e lance a próxima.
                </span>
                <button
                  type="button"
                  onClick={handleSaveCoilBatch}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar Pesagem e Próxima
                </button>
              </div>
            </div>

            {/* Lista das pesagens já salvas antes de adicionar à carga */}
            {coilBatches.length > 0 && coilBatchesSummary && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Pesagens Salvas ({coilBatches.length}{' '}
                    {coilBatches.length === 1 ? 'lote' : 'lotes'})
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-700">
                    Acumulado: <strong>{coilBatchesSummary.totalUnits} bobinas</strong>
                    {coilBatchesSummary.totalLabel !== null &&
                      ` · Etiquetas: ${coilBatchesSummary.totalLabel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                    {coilBatchesSummary.totalScale !== null &&
                      ` · Balança: ${coilBatchesSummary.totalScale.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                    {coilBatchesSummary.totalDiff !== null &&
                      ` · Dif: ${coilBatchesSummary.totalDiff > 0 ? '+' : ''}${coilBatchesSummary.totalDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {coilBatches.map((batch, idx) => {
                    const batchDiff =
                      batch.totalLabelKg !== null && batch.scaleKg !== null
                        ? Number((batch.scaleKg - batch.totalLabelKg).toFixed(2))
                        : null;
                    return (
                      <div
                        key={batch.id}
                        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 font-mono tabular-nums">
                            Pesagem {idx + 1} · {batch.units}{' '}
                            {batch.units === 1 ? 'bobina' : 'bobinas'}
                            {batch.totalLabelKg !== null &&
                              ` · Etiquetas: ${batch.totalLabelKg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                            {batch.scaleKg !== null &&
                              ` · Balança: ${batch.scaleKg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                            {batchDiff !== null &&
                              ` · Dif: ${batchDiff > 0 ? '+' : ''}${batchDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`}
                          </div>
                          {batch.labelWeightsKg.length > 0 && (
                            <div className="text-[11px] font-mono tabular-nums text-slate-500">
                              Etiquetas individuais:{' '}
                              {batch.labelWeightsKg
                                .map((w) =>
                                  w.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }),
                                )
                                .join(' + ')}{' '}
                              kg
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditCoilBatch(batch)}
                            className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoilBatch(batch.id)}
                            className="text-xs font-medium text-red-600 hover:underline cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIA 3: BARRAS */}
        {category === 'barra' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bitola da Barra
              </label>
              <div className="flex flex-wrap gap-2">
                {BAR_GAUGES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBarGauge(g)}
                    className={`px-4 py-2 text-sm font-mono font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      barGauge === g
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="barLabelKg"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Peso Etiqueta (kg)
                </label>
                <input
                  id="barLabelKg"
                  type="text"
                  inputMode="decimal"
                  value={labelKgStr}
                  onChange={(e) => setLabelKgStr(e.target.value)}
                  placeholder="Obrigatório se não houver balança"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="barScaleKg"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Peso Balança (kg)
                </label>
                <input
                  id="barScaleKg"
                  type="text"
                  inputMode="decimal"
                  value={scaleKgStr}
                  onChange={(e) => setScaleKgStr(e.target.value)}
                  placeholder="Obrigatório se não houver etiqueta"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="barUnits"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Qtd. Barras / Feixes (opcional)
                </label>
                <input
                  id="barUnits"
                  type="text"
                  inputMode="numeric"
                  value={unitsStr}
                  onChange={(e) => setUnitsStr(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIA 4: TELAS POP */}
        {category === 'tela_pop' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modelo da Tela Pop
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TELA_POP_SPECS.map((spec) => {
                  const active = telaModel === spec.code;
                  return (
                    <button
                      key={spec.code}
                      type="button"
                      onClick={() => setTelaModel(spec.code)}
                      className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {spec.code} ({spec.diameter}) {spec.tier}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          active ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {spec.fullDescription}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-w-xs">
              <label
                htmlFor="telaUnits"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Quantidade (Unidades) <span className="text-red-600">*</span>
              </label>
              <input
                id="telaUnits"
                type="text"
                inputMode="numeric"
                value={unitsStr}
                onChange={(e) => setUnitsStr(e.target.value)}
                placeholder="Ex: 50"
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}

        {/* CATEGORIA 5: PREGOS */}
        {category === 'prego' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Medida / Bitola do Prego
              </label>
              <div className="flex flex-wrap gap-2">
                {[...NAIL_GAUGES, 'Outra'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNailGauge(g)}
                    className={`px-3 py-2 text-xs font-mono font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      nailGauge === g
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {nailGauge === 'Outra' && (
                <input
                  type="text"
                  value={customNailGauge}
                  onChange={(e) => setCustomNailGauge(e.target.value)}
                  placeholder="Digite a medida (ex: 16 × 24 ou Ardox)"
                  className="mt-2.5 max-w-sm w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label
                    htmlFor="nailBoxesInput"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Quantidade de Caixas <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="nailBoxesInput"
                    type="text"
                    inputMode="numeric"
                    value={boxesStr}
                    onChange={(e) => setBoxesStr(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nailUnitsPerBox"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Unidades de {nailUnitWeightKg} kg por Caixa <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="nailUnitsPerBox"
                    type="text"
                    inputMode="numeric"
                    value={nailUnitsPerBoxStr}
                    onChange={(e) => setNailUnitsPerBoxStr(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {parsedBoxes && parsedNailUnitsPerBox && (
                <p className="text-xs text-slate-700 font-mono tabular-nums">
                  Total automático:{' '}
                  <strong>
                    {parsedBoxes * parsedNailUnitsPerBox} un ·{' '}
                    {(
                      parsedBoxes *
                      parsedNailUnitsPerBox *
                      nailUnitWeightKg
                    ).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    kg
                  </strong>{' '}
                  ({parsedBoxes} cx × {parsedNailUnitsPerBox} un × {nailUnitWeightKg} kg)
                </p>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIA 6: OUTROS */}
        {category === 'outros' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="customProductName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Nome / Descrição do Produto <span className="text-red-600">*</span>
                </label>
                <input
                  id="customProductName"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Espaçador plástico, Prego 18x27, etc."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Forma de Conferência
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOtherMeasureMode('unidade')}
                    className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      otherMeasureMode === 'unidade'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por Unidade
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtherMeasureMode('kg')}
                    className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      otherMeasureMode === 'kg'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtherMeasureMode('ambos')}
                    className={`py-2 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      otherMeasureMode === 'ambos'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unidade e Kg
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherMeasureMode !== 'kg' && (
                <div>
                  <label
                    htmlFor="otherUnits"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Quantidade (Unidades) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="otherUnits"
                    type="text"
                    inputMode="numeric"
                    value={unitsStr}
                    onChange={(e) => setUnitsStr(e.target.value)}
                    placeholder="Ex: 30"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              {otherMeasureMode !== 'unidade' && (
                <>
                  <div>
                    <label
                      htmlFor="otherLabelKg"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Peso Etiqueta (kg)
                    </label>
                    <input
                      id="otherLabelKg"
                      type="text"
                      inputMode="decimal"
                      value={labelKgStr}
                      onChange={(e) => setLabelKgStr(e.target.value)}
                      placeholder="Ex: 120,00"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="otherScaleKg"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Peso Balança (kg)
                    </label>
                    <input
                      id="otherScaleKg"
                      type="text"
                      inputMode="decimal"
                      value={scaleKgStr}
                      onChange={(e) => setScaleKgStr(e.target.value)}
                      placeholder="Ex: 119,80"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live Difference Indicator when both Label/Standard and Scale are provided */}
        {liveDiffKg !== null &&
          effectiveLabelKgForLiveDiff !== null &&
          parsedScaleKg !== null && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Comparação Balança vs Etiquetas:{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {liveDiffKg > 0 ? '+' : ''}
                    {liveDiffKg.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    kg
                  </strong>{' '}
                  <span className="font-mono tabular-nums text-slate-500">
                    ({liveDiffKg > 0 ? '+' : ''}
                    {((liveDiffKg / effectiveLabelKgForLiveDiff) * 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %)
                  </span>
                </span>
              </div>
              <span className="text-slate-500">
                Peso final considerado: Balança (
                {parsedScaleKg.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                kg)
              </span>
            </div>
          )}

        {/* Observação do item + Botão de ação */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
          <div className="flex-1">
            <label
              htmlFor="itemNotes"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Observação deste item (opcional)
            </label>
            <input
              id="itemNotes"
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="Ex: Etiqueta legível, lote 042"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {editingItem ? (
              <>
                <Check className="w-4 h-4" />
                Salvar Alteração
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar à Carga
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </section>
  );
};
