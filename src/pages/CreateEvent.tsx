import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Event } from '../types/models';
import { useEventDraft } from '../hooks/useEventDraft';
import { useEventForm } from '../hooks/useEventForm';
import { MemberSelector } from '../components/event-form/MemberSelector';
import { PayerSection } from '../components/event-form/PayerSection';
import { PresetItemsEditor } from '../components/event-form/PresetItemsEditor';
import { TEXTS } from '../constants/texts';

const getLastSunday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek;
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - daysToSubtract);
  return lastSunday;
};

const generateEventName = (date: Date): string => {
  return `Cloud kvíz ${format(date, 'dd.MM.yyyy')}`;
};

export default function CreateEvent() {
  const { members, menuItems, repository, refreshEvents } = useApp();
  const navigate = useNavigate();
  const { draft, saveDraft, clearDraft, hasDraft } = useEventDraft();

  const coreMembers = members.filter(m => m.isCore);
  const initialDate = getLastSunday();

  const form = useEventForm({
    initialSelectedMemberIds: coreMembers.map(m => m.id),
    initialSelfPaidMemberIds: [],
    initialHasReceipt: false,
    initialPresetItems: [],
    initialEventData: {
      date: initialDate.toISOString().split('T')[0],
      name: generateEventName(initialDate),
      payerId: '',
      totalAmount: '',
      tip: '',
    },
    menuItems,
  });

  const [showDraftDialog, setShowDraftDialog] = useState(false);

  useEffect(() => {
    if (hasDraft() && draft) {
      setShowDraftDialog(true);
    }
  }, []);

  // Auto-save draft when form changes
  useEffect(() => {
    if (!form.eventData.date && !form.eventData.name && !form.eventData.payerId) {
      return;
    }

    const timer = setTimeout(() => {
      saveDraft({
        date: form.eventData.date,
        name: form.eventData.name,
        payerId: form.eventData.payerId,
        totalAmount: form.eventData.totalAmount,
        tip: form.eventData.tip,
        selectedMemberIds: form.selectedMemberIds,
        selfPaidMemberIds: form.selfPaidMemberIds,
        hasReceipt: form.hasReceipt,
        presetItems: form.presetItems,
        savedAt: new Date(),
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.eventData, form.selectedMemberIds, form.selfPaidMemberIds, form.hasReceipt, form.presetItems]);

  const loadDraft = () => {
    if (!draft) return;

    form.setEventData({
      date: draft.date,
      name: draft.name,
      payerId: draft.payerId,
      totalAmount: draft.totalAmount,
      tip: draft.tip,
    });
    form.setSelectedMemberIds(draft.selectedMemberIds);
    form.setSelfPaidMemberIds(draft.selfPaidMemberIds || []);
    form.setHasReceipt(draft.hasReceipt);
    form.setPresetItems(draft.presetItems);
    setShowDraftDialog(false);
  };

  const startNew = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.selectedMemberIds.length === 0) {
      toast.error(TEXTS.errors.noMembers);
      return;
    }

    if (!form.eventData.payerId) {
      toast.error(TEXTS.errors.noPayer);
      return;
    }

    const event: Event = {
      id: uuidv4(),
      date: new Date(form.eventData.date),
      name: form.eventData.name.trim() || undefined,
      payerId: form.eventData.payerId,
      totalAmount: parseFloat(form.eventData.totalAmount) || 0,
      tip: parseFloat(form.eventData.tip) || 0,
      presentMemberIds: form.selectedMemberIds,
      selfPaidMemberIds: form.selfPaidMemberIds.length > 0 ? form.selfPaidMemberIds : undefined,
      presetItems: form.hasReceipt && form.presetItems.length > 0 ? form.presetItems : undefined,
      status: 'open',
    };

    try {
      await repository.createEvent(event);
      await refreshEvents();
      clearDraft();
      navigate(`/event/${event.id}`);
      toast.success('Událost vytvořena');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Nepodařilo se vytvořit událost');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Draft Dialog */}
      {showDraftDialog && draft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Máte rozpracovanou událost
            </h2>
            <p className="text-gray-600 mb-2">
              Naposledy uloženo: {draft.savedAt ? new Date(draft.savedAt).toLocaleString('cs-CZ') : 'neznámo'}
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-6 text-sm">
              <div className="text-gray-700">
                <strong>Název:</strong> {draft.name || '(bez názvu)'}
              </div>
              <div className="text-gray-700">
                <strong>Datum:</strong> {draft.date}
              </div>
              {draft.totalAmount && (
                <div className="text-gray-700">
                  <strong>Částka:</strong> {draft.totalAmount} Kč
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadDraft}
                className="btn btn-primary flex-1"
              >
                Pokračovat
              </button>
              <button
                onClick={startNew}
                className="btn btn-secondary flex-1"
              >
                Začít novou
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Zpět na dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nová událost</h1>
        {draft && !showDraftDialog && (
          <p className="text-sm text-gray-500 mt-1">
            💾 Automaticky ukládáno
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-4">Základní údaje</h2>

          <div className="mb-4">
            <label className="label">Datum</label>
            <input
              type="date"
              value={form.eventData.date}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                form.setEventData({
                  ...form.eventData,
                  date: e.target.value,
                  name: generateEventName(newDate)
                });
              }}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Název</label>
            <input
              type="text"
              value={form.eventData.name}
              onChange={(e) => form.setEventData({ ...form.eventData, name: e.target.value })}
              className="input"
              placeholder="např. Cloud kvíz 14.04.2026"
            />
          </div>
        </div>

        <MemberSelector
          members={members}
          selectedMemberIds={form.selectedMemberIds}
          selfPaidMemberIds={form.selfPaidMemberIds}
          onMemberToggle={form.handleMemberToggle}
          onSelfPaidToggle={form.handleSelfPaidToggle}
        />

        <PayerSection
          members={members}
          selectedMemberIds={form.selectedMemberIds}
          payerId={form.eventData.payerId}
          onPayerChange={(payerId) => form.setEventData({ ...form.eventData, payerId })}
          totalAmount={form.eventData.totalAmount}
          tip={form.eventData.tip}
          onTotalAmountChange={(totalAmount) => form.setEventData({ ...form.eventData, totalAmount })}
          onTipChange={(tip) => form.setEventData({ ...form.eventData, tip })}
        />

        <PresetItemsEditor
          menuItems={menuItems}
          presetItems={form.presetItems}
          hasReceipt={form.hasReceipt}
          onHasReceiptChange={form.setHasReceipt}
          onAddItem={form.handleAddPresetItem}
          onUpdateItem={form.handleUpdatePresetItem}
          onRemoveItem={form.handleRemovePresetItem}
          presetItemsTotal={form.presetItemsTotal}
        />

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-full text-lg py-4">
          Vytvořit událost
        </button>
      </form>
    </div>
  );
}
