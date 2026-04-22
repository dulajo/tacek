import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { Event } from '../types/models';
import { calculateEventSummary } from '../services/calculationService';
import { LoadingBar } from '../components/LoadingBar';
import { useEventForm } from '../hooks/useEventForm';
import { MemberSelector } from '../components/event-form/MemberSelector';
import { PayerSection } from '../components/event-form/PayerSection';
import { PresetItemsEditor } from '../components/event-form/PresetItemsEditor';
import { TEXTS } from '../constants/texts';

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const { members, menuItems, repository, refreshEvents } = useApp();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const form = useEventForm({
    initialSelectedMemberIds: [],
    initialSelfPaidMemberIds: [],
    initialHasReceipt: false,
    initialPresetItems: [],
    initialEventData: {
      date: '',
      name: '',
      payerId: '',
      totalAmount: '',
      tip: '',
    },
    menuItems,
  });

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const eventData = await repository.getEvent(eventId);

      if (eventData) {
        setEvent(eventData);

        form.setEventData({
          date: eventData.date instanceof Date
            ? eventData.date.toISOString().split('T')[0]
            : new Date(eventData.date).toISOString().split('T')[0],
          name: eventData.name || '',
          payerId: eventData.payerId,
          totalAmount: eventData.totalAmount.toString(),
          tip: eventData.tip.toString(),
        });
        form.setSelectedMemberIds(eventData.presentMemberIds);
        form.setSelfPaidMemberIds(eventData.selfPaidMemberIds || []);
        form.setHasReceipt(!!eventData.presetItems);
        form.setPresetItems(eventData.presetItems || []);

        if (eventData.status === 'closed') {
          setShowWarning(true);
        }
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
      toast.error('Nepodařilo se načíst událost');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (form.selectedMemberIds.length === 0) {
      toast.error(TEXTS.errors.noMembers);
      return;
    }

    if (!form.eventData.payerId) {
      toast.error(TEXTS.errors.noPayer);
      return;
    }

    const updatedEvent: Event = {
      ...event,
      date: new Date(form.eventData.date),
      name: form.eventData.name.trim() || undefined,
      payerId: form.eventData.payerId,
      totalAmount: parseFloat(form.eventData.totalAmount) || 0,
      tip: parseFloat(form.eventData.tip) || 0,
      presentMemberIds: form.selectedMemberIds,
      selfPaidMemberIds: form.selfPaidMemberIds.length > 0 ? form.selfPaidMemberIds : undefined,
      presetItems: form.hasReceipt && form.presetItems.length > 0 ? form.presetItems : undefined,
    };

    try {
      await repository.updateEvent(updatedEvent);

      const removedMemberIds = event.presentMemberIds.filter(
        id => !form.selectedMemberIds.includes(id)
      );
      for (const memberId of removedMemberIds) {
        await repository.deleteConsumption(event.id, memberId);
      }

      const updatedConsumptions = await repository.getEventConsumptions(event.id);
      const summary = calculateEventSummary(updatedEvent, updatedConsumptions, menuItems, members);

      for (const balance of summary.memberBalances) {
        const consumption = updatedConsumptions.find(c => c.memberId === balance.memberId);
        if (consumption) {
          consumption.totalAmount = balance.totalOwed;
          await repository.updateConsumption(consumption);
        }
      }

      await refreshEvents();
      navigate(`/event/${event.id}`);
      toast.success('Událost upravena');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Nepodařilo se upravit událost');
    }
  };

  const proceedWithEdit = () => {
    setShowWarning(false);
  };

  if (isLoading) {
    return <LoadingBar />;
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-red-600">Událost nenalezena</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          ← Zpět na dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Warning Dialog for Closed Events */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ⚠️ Událost je uzavřená
            </h2>
            <p className="text-gray-600 mb-6">
              Tato událost je označena jako uzavřená. Opravdu chcete upravit?
              Změny ovlivní všechny výpočty a platby.
            </p>
            <div className="flex gap-3">
              <button
                onClick={proceedWithEdit}
                className="btn btn-danger flex-1"
              >
                Ano, upravit
              </button>
              <button
                onClick={() => navigate(`/event/${eventId}`)}
                className="btn btn-secondary flex-1"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link to={`/event/${eventId}`} className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Zpět na událost
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upravit událost</h1>
        {event.status === 'closed' && (
          <p className="text-sm text-orange-600 mt-1">
            ⚠️ Pozor: Tato událost je uzavřená
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
              onChange={(e) => form.setEventData({ ...form.eventData, date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Název (volitelné)</label>
            <input
              type="text"
              value={form.eventData.name}
              onChange={(e) => form.setEventData({ ...form.eventData, name: e.target.value })}
              className="input"
              placeholder="např. Pub kvíz v Pivovarské"
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
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary flex-1 text-lg py-4">
            Uložit změny
          </button>
          <Link
            to={`/event/${eventId}`}
            className="btn btn-secondary flex-1 text-lg py-4 text-center"
          >
            Zrušit
          </Link>
        </div>
      </form>
    </div>
  );
}
