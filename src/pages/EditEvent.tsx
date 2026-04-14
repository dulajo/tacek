import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Event, EventItem, MemberConsumption } from '../types/models';
import { calculateEventSummary } from '../services/calculationService';
import { LoadingBar } from '../components/LoadingBar';
import { TEXTS } from '../constants/texts';

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const { members, menuItems, repository, refreshEvents } = useApp();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [consumptions, setConsumptions] = useState<MemberConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const [eventData, setEventData] = useState({
    date: '',
    name: '',
    payerId: '',
    totalAmount: '',
    tip: '',
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selfPaidMemberIds, setSelfPaidMemberIds] = useState<string[]>([]);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [presetItems, setPresetItems] = useState<EventItem[]>([]);

  // Load event data
  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    setIsLoading(true);
    const eventData = await repository.getEvent(eventId);
    const consumptionData = await repository.getEventConsumptions(eventId);

    if (eventData) {
      setEvent(eventData);
      setConsumptions(consumptionData);

      // Populate form
      setEventData({
        date: eventData.date instanceof Date 
          ? eventData.date.toISOString().split('T')[0]
          : new Date(eventData.date).toISOString().split('T')[0],
        name: eventData.name || '',
        payerId: eventData.payerId,
        totalAmount: eventData.totalAmount.toString(),
        tip: eventData.tip.toString(),
      });
      setSelectedMemberIds(eventData.presentMemberIds);
      setSelfPaidMemberIds(eventData.selfPaidMemberIds || []);
      setHasReceipt(!!eventData.presetItems);
      setPresetItems(eventData.presetItems || []);

      // Show warning if event is closed
      if (eventData.status === 'closed') {
        setShowWarning(true);
      }
    }

    setIsLoading(false);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
    // Remove from selfPaid if deselected
    if (selectedMemberIds.includes(memberId)) {
      setSelfPaidMemberIds(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelfPaidToggle = (memberId: string) => {
    setSelfPaidMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddPresetItem = () => {
    if (menuItems.length === 0) return;
    setPresetItems([
      ...presetItems,
      { menuItemId: menuItems[0].id, quantity: 1 },
    ]);
  };

  const handleUpdatePresetItem = (index: number, field: 'menuItemId' | 'quantity', value: string | number) => {
    const updated = [...presetItems];
    if (field === 'menuItemId') {
      updated[index].menuItemId = value as string;
    } else {
      updated[index].quantity = parseInt(value as string) || 0;
    }
    setPresetItems(updated);
  };

  const handleRemovePresetItem = (index: number) => {
    setPresetItems(presetItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (selectedMemberIds.length === 0) {
      alert(TEXTS.errors.noMembers);
      return;
    }

    if (!eventData.payerId) {
      alert(TEXTS.errors.noPayer);
      return;
    }

    const updatedEvent: Event = {
      ...event,
      date: new Date(eventData.date),
      name: eventData.name.trim() || undefined,
      payerId: eventData.payerId,
      totalAmount: parseFloat(eventData.totalAmount) || 0,
      tip: parseFloat(eventData.tip) || 0,
      presentMemberIds: selectedMemberIds,
      selfPaidMemberIds: selfPaidMemberIds.length > 0 ? selfPaidMemberIds : undefined,
      presetItems: hasReceipt && presetItems.length > 0 ? presetItems : undefined,
    };

    await repository.updateEvent(updatedEvent);

    // Remove consumptions for members who were removed
    const removedMemberIds = event.presentMemberIds.filter(
      id => !selectedMemberIds.includes(id)
    );
    for (const memberId of removedMemberIds) {
      await repository.deleteConsumption(event.id, memberId);
    }

    // Recalculate all consumption totals
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

  const presetItemsTotal = presetItems.reduce((total, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    return total + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);

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
              value={eventData.date}
              onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Název (volitelné)</label>
            <input
              type="text"
              value={eventData.name}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
              className="input"
              placeholder="např. Pub kvíz v Pivovarské"
            />
          </div>
        </div>

        {/* Members Selection */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-4">Přítomní členové</h2>

          {members.length === 0 ? (
            <p className="text-gray-500">
              Zatím nemáte žádné členy. <Link to="/members" className="text-primary-600 underline">Přidejte členy</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {members.map(member => {
                const isSelected = selectedMemberIds.includes(member.id);
                const isSelfPaid = selfPaidMemberIds.includes(member.id);
                
                return (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? isSelfPaid
                          ? 'bg-gray-50 border-gray-300'
                          : 'bg-primary-50 border-primary-300'
                        : 'bg-gray-50 border-transparent'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMemberToggle(member.id)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className={`font-medium ${isSelfPaid ? 'text-gray-600' : 'text-gray-900'}`}>
                        {isSelfPaid && '💰 '}
                        {member.isCore && '⭐ '}
                        {member.name}
                      </span>
                    </label>
                    
                    {isSelected && (
                      <label className="flex items-center gap-2 ml-8 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelfPaid}
                          onChange={() => handleSelfPaidToggle(member.id)}
                          className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700">
                          Platil si sám
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-4">Platba</h2>

          <div className="mb-4">
            <label className="label">Kdo zaplatil</label>
            <select
              value={eventData.payerId}
              onChange={(e) => setEventData({ ...eventData, payerId: e.target.value })}
              className="input"
              required
            >
              <option value="">Vyberte platiče</option>
              {selectedMemberIds.map(memberId => {
                const member = members.find(m => m.id === memberId);
                return (
                  <option key={memberId} value={memberId}>
                    {member?.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Payer info display */}
          {eventData.payerId && (() => {
            const payer = members.find(m => m.id === eventData.payerId);
            if (!payer) return null;
            
            const hasPaymentInfo = payer.revolutUsername || payer.bankAccount;
            
            return (
              <div className={`p-3 rounded-lg mb-4 ${hasPaymentInfo ? 'bg-green-50 border border-green-300' : 'bg-yellow-50 border border-yellow-300'}`}>
                <div className="font-medium text-gray-900 mb-2">Platič: {payer.name}</div>
                {payer.revolutUsername && (
                  <div className="text-sm text-gray-700">
                    💰 Revolut: {payer.revolutUsername.startsWith('@') ? payer.revolutUsername : `@${payer.revolutUsername}`}
                  </div>
                )}
                {payer.bankAccount && (
                  <div className="text-sm text-gray-700">
                    🏦 Účet: {payer.bankAccount}
                  </div>
                )}
                {!hasPaymentInfo && (
                  <div className="text-sm text-orange-700 mt-2">
                    ⚠️ Platič nemá nastavený Revolut ani číslo účtu
                    <Link to="/members" className="ml-2 underline text-orange-800">
                      Upravit člena
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Celková částka (Kč)</label>
              <input
                type="number"
                step="0.01"
                value={eventData.totalAmount}
                onChange={(e) => setEventData({ ...eventData, totalAmount: e.target.value })}
                className="input"
                placeholder="např. 2500"
                required
              />
            </div>

            <div>
              <label className="label">Dýško (Kč)</label>
              <input
                type="number"
                step="0.01"
                value={eventData.tip}
                onChange={(e) => setEventData({ ...eventData, tip: e.target.value })}
                className="input"
                placeholder="např. 200"
              />
            </div>
          </div>
        </div>

        {/* Receipt Items */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Produkty z účtenky</h2>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReceipt}
                onChange={(e) => setHasReceipt(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Mám účtenku s konkrétními produkty (varianta A)
              </span>
            </label>
          </div>

          {hasReceipt && (
            <>
              {menuItems.length === 0 ? (
                <p className="text-gray-500">
                  Zatím nemáte žádné položky v jídelním lístku. <Link to="/menu" className="text-primary-600 underline">Přidejte položky</Link>
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {presetItems.map((item, index) => {
                      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                      const itemTotal = menuItem ? menuItem.price * item.quantity : 0;

                      return (
                        <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                          <select
                            value={item.menuItemId}
                            onChange={(e) => handleUpdatePresetItem(index, 'menuItemId', e.target.value)}
                            className="input flex-1"
                          >
                            {menuItems.map(mi => (
                              <option key={mi.id} value={mi.id}>
                                {mi.name} ({mi.price} Kč)
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdatePresetItem(index, 'quantity', e.target.value)}
                            className="input w-20"
                          />

                          <span className="text-sm text-gray-600 w-24">
                            = {itemTotal.toFixed(2)} Kč
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemovePresetItem(index)}
                            className="btn btn-danger text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPresetItem}
                    className="btn btn-secondary w-full mb-4"
                  >
                    + Přidat položku
                  </button>

                  {presetItems.length > 0 && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Součet produktů:</span>
                        <span className="font-semibold">{presetItemsTotal.toFixed(2)} Kč</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

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
