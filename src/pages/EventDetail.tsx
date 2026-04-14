import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MemberConsumption, EventItem } from '../types/models';
import { calculateEventSummary, calculateItemsTotal, getRemainingQuantity, getInventoryStatus } from '../services/calculationService';
import { format } from 'date-fns';
import { LoadingBar } from '../components/LoadingBar';
import { TEXTS } from '../constants/texts';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { members, menuItems, repository, refreshEvents } = useApp();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any>(null);
  const [consumptions, setConsumptions] = useState<MemberConsumption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<EventItem[]>([]);
  const [editingSharedIds, setEditingSharedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    const eventData = await repository.getEvent(eventId);
    const consumptionData = await repository.getEventConsumptions(eventId);
    
    setEvent(eventData);
    setConsumptions(consumptionData);
    
    // Initialize consumptions for all present members if not exist
    if (eventData) {
      for (const memberId of eventData.presentMemberIds) {
        const existing = consumptionData.find(c => c.memberId === memberId);
        if (!existing) {
          const newConsumption: MemberConsumption = {
            eventId: eventId,
            memberId: memberId,
            items: [],
            sharedItemIds: [],
            paidEntryFeeForIds: [],
            hasPaid: false,
            totalAmount: 0,
          };
          await repository.updateConsumption(newConsumption);
          consumptionData.push(newConsumption);
        }
      }
      setConsumptions([...consumptionData]);
    }
    
    setIsLoading(false);
  };

  const handleSelectMember = (memberId: string) => {
    const consumption = consumptions.find(c => c.memberId === memberId);
    setSelectedMemberId(memberId);
    setEditingItems(consumption?.items || []);
    setEditingSharedIds(consumption?.sharedItemIds || []);
    // Close expanded member if any
    setExpandedMemberId(null);
  };

  const handleToggleMemberExpansion = (memberId: string) => {
    if (expandedMemberId === memberId) {
      // Close if already expanded
      setExpandedMemberId(null);
      setEditingItems([]);
      setEditingSharedIds([]);
    } else {
      // Open new member and load their consumption
      const consumption = consumptions.find(c => c.memberId === memberId);
      setExpandedMemberId(memberId);
      setEditingItems(consumption?.items || []);
      setEditingSharedIds(consumption?.sharedItemIds || []);
      // Close the bottom form if open
      setSelectedMemberId('');
    }
  };

  const handleSaveExpandedConsumption = async (memberId: string) => {
    if (!eventId) return;

    const consumption = consumptions.find(c => c.memberId === memberId);
    if (!consumption) return;

    const updatedConsumption: MemberConsumption = {
      ...consumption,
      items: editingItems,
      sharedItemIds: editingSharedIds,
    };

    await repository.updateConsumption(updatedConsumption);
    await loadEventData();
    setExpandedMemberId(null);
    setEditingItems([]);
    setEditingSharedIds([]);
  };

  const handleItemQuantityChange = (menuItemId: string, delta: number) => {
    const existingIndex = editingItems.findIndex(i => i.menuItemId === menuItemId);
    let newItems = [...editingItems];

    if (existingIndex >= 0) {
      const newQuantity = newItems[existingIndex].quantity + delta;
      if (newQuantity <= 0) {
        newItems = newItems.filter((_, i) => i !== existingIndex);
      } else {
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: newQuantity };
      }
    } else if (delta > 0) {
      newItems.push({ menuItemId, quantity: delta });
    }

    setEditingItems(newItems);
  };

  const handleToggleSharedItem = (menuItemId: string) => {
    if (editingSharedIds.includes(menuItemId)) {
      setEditingSharedIds(editingSharedIds.filter(id => id !== menuItemId));
    } else {
      setEditingSharedIds([...editingSharedIds, menuItemId]);
    }
  };

  const handleSaveConsumption = async () => {
    if (!selectedMemberId || !eventId) return;

    const consumption = consumptions.find(c => c.memberId === selectedMemberId);
    if (!consumption) return;

    const updatedConsumption: MemberConsumption = {
      ...consumption,
      items: editingItems,
      sharedItemIds: editingSharedIds,
    };

    await repository.updateConsumption(updatedConsumption);
    await loadEventData();
    setSelectedMemberId('');
    setEditingItems([]);
    setEditingSharedIds([]);
  };

  const handleTogglePaid = async (memberId: string) => {
    const consumption = consumptions.find(c => c.memberId === memberId);
    if (!consumption) return;

    const updatedConsumption = {
      ...consumption,
      hasPaid: !consumption.hasPaid,
    };

    await repository.updateConsumption(updatedConsumption);
    await loadEventData();
  };

  const handleCopySummary = async () => {
    const payerMember = members.find(m => m.id === event.payerId);
    const eventName = event.name || `Událost ${format(new Date(event.date), 'dd.MM.yyyy')}`;
    const payerUsername = payerMember?.revolutUsername?.replace('@', '');
    const payerAccount = payerMember?.bankAccount;
    
    // Hlavička
    let message = `🍺 ${eventName}\n\n`;
    message += `💳 Zaplatil: ${payerMember?.name} (${event.totalAmount.toFixed(2)} Kč)\n`;
    
    // Číslo účtu (jednou nahoře)
    if (payerAccount) {
      message += `🏦 Účet: ${payerAccount}\n`;
    }
    
    message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Pro každého člena
    summary.memberBalances
      .filter(balance => !balance.isPayer)
      .forEach(balance => {
        const memberConsumption = consumptions.find(c => c.memberId === balance.memberId);
        
        // Self-paid člen
        if (balance.paidSelf) {
          message += `👤 ${balance.memberName} - Platil si sám 💰\n\n`;
          return;
        }
        
        // Jméno a částka
        message += `👤 ${balance.memberName} - ${balance.totalOwed.toFixed(2)} Kč\n`;
        
        // Položky (kompaktně)
        const allItems: string[] = [];
        
        // Běžné položky
        memberConsumption?.items.forEach(item => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          if (menuItem) {
            if (item.quantity > 1) {
              allItems.push(`${menuItem.name} × ${item.quantity}`);
            } else {
              allItems.push(menuItem.name);
            }
          }
        });
        
        // Sdílené položky
        const sharedItemIds = memberConsumption?.sharedItemIds || [];
        sharedItemIds.forEach(sharedId => {
          const menuItem = menuItems.find(mi => mi.id === sharedId);
          if (menuItem) {
            allItems.push(menuItem.name);
          }
        });
        
        if (allItems.length > 0) {
          message += `${allItems.join(', ')}\n`;
        }
        
        // Revolut link
        if (payerUsername) {
          const amountInHalers = Math.round(balance.totalOwed * 100);
          message += `💸 https://revolut.me/${payerUsername}?currency=CZK&amount=${amountInHalers}\n`;
        }
        
        message += `\n`;
      });
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Zaplaceno / Čeká se
    const paidMembers = summary.memberBalances
      .filter(b => !b.isPayer && (b.hasPaid || b.paidSelf))
      .map(b => b.memberName)
      .join(', ');
    
    const unpaidMembers = summary.memberBalances
      .filter(b => !b.isPayer && !b.hasPaid && !b.paidSelf)
      .map(b => b.memberName)
      .join(', ');
    
    if (paidMembers) {
      message += `✅ Zaplaceno: ${paidMembers}\n`;
    }
    if (unpaidMembers) {
      message += `⏳ Čeká se: ${unpaidMembers}\n`;
    }
    
    const totalToCollect = summary.memberBalances
      .filter(b => !b.isPayer && !b.paidSelf)
      .reduce((sum, b) => sum + b.totalOwed, 0);
    
    message += `\nCelkem k vybrání: ${totalToCollect.toFixed(2)} Kč\n`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(message);
      alert(TEXTS.notifications.summaryCopied);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert(TEXTS.notifications.summaryCopied);
      } catch (e) {
        alert(TEXTS.notifications.copyFailed);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleToggleEventStatus = async () => {
    if (!event) return;

    const updatedEvent = {
      ...event,
      status: event.status === 'open' ? 'closed' : 'open',
    };

    await repository.updateEvent(updatedEvent);
    await loadEventData();
  };

  const handleDeleteEvent = async () => {
    if (!event || !eventId) return;
    
    if (!confirm('Opravdu chcete smazat tuto událost? Tato akce je nevratná.')) return;
    
    await repository.deleteEvent(eventId);
    await refreshEvents(); // Refresh dashboard before navigating
    navigate('/');
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

  const payer = members.find(m => m.id === event.payerId);
  const summary = calculateEventSummary(event, consumptions, menuItems, members);
  const sharedItems = menuItems.filter(mi => mi.isShared);

  // Sort menu items: favorites first, then alphabetically within each group
  const sortedMenuItems = [...menuItems]
    .filter(mi => !mi.isShared)
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });
  
  const favoriteItems = sortedMenuItems.filter(mi => mi.isFavorite);
  const regularItems = sortedMenuItems.filter(mi => !mi.isFavorite);

  const editingTotal = calculateItemsTotal(editingItems, menuItems);
  const editingMember = members.find(m => m.id === selectedMemberId);

  // Calculate totals for validation
  const totalConsumed = summary.totalConsumed;
  const expectedTotal = event.presetItems 
    ? calculateItemsTotal(event.presetItems, menuItems)
    : event.totalAmount - event.tip;
  const difference = expectedTotal - totalConsumed;

  // Helper function: Calculate detailed breakdown of missing/exceeded items
  const getMissingItemsBreakdown = () => {
    if (!event.presetItems) return null;
    
    const breakdown: { name: string; diff: number }[] = [];
    
    event.presetItems.forEach(presetItem => {
      const menuItem = menuItems.find(mi => mi.id === presetItem.menuItemId);
      if (!menuItem) return;
      
      const consumed = consumptions.reduce((sum, c) => {
        const item = c.items.find(i => i.menuItemId === presetItem.menuItemId);
        return sum + (item?.quantity || 0);
      }, 0);
      
      const diff = presetItem.quantity - consumed;
      
      if (diff !== 0) {
        breakdown.push({
          name: menuItem.name,
          diff: diff
        });
      }
    });
    
    return breakdown;
  };

  const missingItemsBreakdown = getMissingItemsBreakdown();

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Zpět na dashboard
        </Link>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {event.name || 'Událost'}
            </h1>
            <p className="text-gray-600">
              {format(new Date(event.date), 'dd.MM.yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/event/${eventId}/edit`}
              className="btn btn-secondary"
            >
              ✏️ Upravit
            </Link>
            <button
              onClick={handleDeleteEvent}
              className="btn btn-danger"
            >
              🗑️ Smazat
            </button>
            <button
              onClick={handleToggleEventStatus}
              className={`btn ${event.status === 'open' ? 'btn-secondary' : 'btn-success'}`}
            >
              {event.status === 'open' ? 'Uzavřít' : 'Otevřít'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-6">
        {/* Payer Info */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Platič</div>
          <div className="font-semibold text-gray-900 text-lg mb-2">
            💳 {payer?.name} ({event.totalAmount.toFixed(2)} Kč)
          </div>
          {payer?.revolutUsername && (
            <div className="text-sm text-gray-700">
              💰 Revolut: {payer.revolutUsername.startsWith('@') ? payer.revolutUsername : `@${payer.revolutUsername}`}
            </div>
          )}
          {payer?.bankAccount && (
            <div className="text-sm text-gray-700">
              🏦 Účet: {payer.bankAccount}
            </div>
          )}
          <div className="text-sm text-gray-700 mt-1">
            💵 Dýško: {event.tip.toFixed(2)} Kč
          </div>
          
          {/* Copy Summary Button */}
          <button
            onClick={handleCopySummary}
            className="btn btn-primary w-full mt-4"
          >
            📋 Zkopírovat rozpis pro skupinu
          </button>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Celková částka</div>
            <div className="font-semibold text-gray-900">{event.totalAmount.toFixed(2)} Kč</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Dýško</div>
            <div className="font-semibold text-gray-900">{event.tip.toFixed(2)} Kč</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Přítomní</div>
            <div className="font-semibold text-gray-900">{event.presentMemberIds.length} členů</div>
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {Math.abs(difference) > 0.01 && (
        <div className={`card mb-6 ${difference > 0 ? 'bg-yellow-50 border border-yellow-300' : 'bg-red-50 border border-red-300'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{difference > 0 ? '⚠️' : '❌'}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                {difference > 0 ? 'Chybí rozebrání' : 'Překročeno'}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Rozdíl: {Math.abs(difference).toFixed(2)} Kč
              </div>
              
              {/* Detailed breakdown for preset items */}
              {missingItemsBreakdown && missingItemsBreakdown.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {difference > 0 ? 'Chybí rozdělit:' : 'Překročeno:'}
                  </div>
                  <div className="space-y-1">
                    {missingItemsBreakdown.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        {item.diff > 0 ? (
                          <span>• {item.name} <span className="font-medium">({item.diff}×)</span> - chybí rozdělit</span>
                        ) : (
                          <span>• {item.name} <span className="font-medium text-red-700">(+{Math.abs(item.diff)}×)</span> - překročeno</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Balances */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Přehled členů</h2>
        <div className="space-y-3">
          {summary.memberBalances.map(balance => {
            const isExpanded = expandedMemberId === balance.memberId;
            const isSelfPaid = balance.paidSelf;
            const memberConsumption = consumptions.find(c => c.memberId === balance.memberId);
            const hasItems = (memberConsumption?.items.length || 0) > 0 || (memberConsumption?.sharedItemIds.length || 0) > 0;
            
            return (
              <div
                key={balance.memberId}
                className={`rounded-lg transition-all ${
                  balance.isPayer
                    ? 'bg-green-50 border-2 border-green-300'
                    : balance.hasPaid
                    ? 'bg-gray-50 border border-gray-200 opacity-60'
                    : 'bg-white border-2 border-primary-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {balance.paidSelf && '💰 '}
                        {balance.memberName}
                        {balance.isPayer && ' 💳'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {balance.totalOwed.toFixed(2)} Kč
                      </div>
                      {!balance.isPayer && !balance.paidSelf && (
                        <button
                          onClick={() => handleTogglePaid(balance.memberId)}
                          className={`btn text-sm mt-1 ${
                            balance.hasPaid ? 'btn-secondary' : 'btn-success'
                          }`}
                        >
                          {balance.hasPaid ? '✓ Zaplaceno' : 'Označit zaplaceno'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items consumed */}
                  {balance.paidSelf ? (
                    <div className="mt-3 text-sm text-gray-600 italic">
                      💰 Platil si sám
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 text-sm space-y-1">
                        {hasItems ? (
                          <>
                            {/* Regular items */}
                            {consumptions
                              .find(c => c.memberId === balance.memberId)
                              ?.items.map(item => {
                                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                return menuItem ? (
                                  <div key={item.menuItemId} className="text-gray-700">
                                    • {menuItem.name} × {item.quantity} = {(menuItem.price * item.quantity).toFixed(2)} Kč
                                  </div>
                                ) : null;
                              })}

                            {/* Shared items */}
                            {(() => {
                              const memberConsumption = consumptions.find(c => c.memberId === balance.memberId);
                              const sharedItemIds = memberConsumption?.sharedItemIds || [];
                              
                              if (sharedItemIds.length > 0) {
                                return (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-purple-700 font-medium mb-1">Sdílené položky:</div>
                                    {sharedItemIds.map(sharedItemId => {
                                      const menuItem = menuItems.find(mi => mi.id === sharedItemId);
                                      if (!menuItem) return null;

                                      // Count participants
                                      const participantCount = consumptions.filter(c =>
                                        c.sharedItemIds.includes(sharedItemId)
                                      ).length;

                                      const sharePrice = menuItem.price / participantCount;

                                      return (
                                        <div key={sharedItemId} className="text-purple-600">
                                          • {menuItem.name} ({participantCount > 1 ? `1/${participantCount}` : '1/1'}) = {sharePrice.toFixed(2)} Kč
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {/* Tip share */}
                            {balance.tipShare > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-200 text-blue-600">
                                • Dýško (podíl) = {balance.tipShare.toFixed(2)} Kč
                              </div>
                            )}

                            {/* Total */}
                            <div className="mt-2 pt-2 border-t-2 border-gray-300 font-semibold text-gray-900">
                              Celkem k zaplacení: {balance.totalOwed.toFixed(2)} Kč
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500 italic">
                            (žádná konzumace)
                          </div>
                        )}
                      </div>

                      {/* Toggle button for consumption form */}
                      {!isSelfPaid && (
                        <button
                          onClick={() => handleToggleMemberExpansion(balance.memberId)}
                          className={`btn w-full mt-3 text-sm ${isExpanded ? 'btn-secondary' : 'btn-primary'}`}
                        >
                          {isExpanded ? '✓ Hotovo' : hasItems ? '✏️ Upravit konzumaci' : '➕ Přidat konzumaci'}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Expanded consumption form */}
                {isExpanded && !isSelfPaid && (
                  <div className="border-t border-gray-300 bg-white p-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      {hasItems ? '✏️ Upravit konzumaci' : '➕ Přidat konzumaci'}
                    </h4>
                    
                    {/* Regular Items */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Běžné položky:</h5>
                      <div className="space-y-2">
                        {/* Favorite items */}
                        {favoriteItems.length > 0 && (
                          <>
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-2 mb-1">
                              ⭐ Oblíbené
                            </div>
                            {favoriteItems.map(menuItem => {
                              const currentItem = editingItems.find(i => i.menuItemId === menuItem.id);
                              const quantity = currentItem?.quantity || 0;
                              const total = menuItem.price * quantity;
                              
                              // Inventory tracking (only for Variant A)
                              let remaining = null;
                              let inventoryStatus = null;
                              let isOutOfStock = false;
                              
                              if (event.presetItems) {
                                remaining = getRemainingQuantity(menuItem.id, event.presetItems, consumptions);
                                const presetItem = event.presetItems.find(pi => pi.menuItemId === menuItem.id);
                                const total = presetItem?.quantity || 0;
                                inventoryStatus = getInventoryStatus(remaining, total);
                                isOutOfStock = remaining === 0;
                              }
                              
                              // Hide items that are out of stock
                              if (isOutOfStock) return null;

                              return (
                                <div key={menuItem.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                                  {/* Left: Item info */}
                                  <div>
                                    <div className="font-medium text-gray-900">{menuItem.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {menuItem.price.toFixed(2)} Kč
                                      {event.presetItems && remaining !== null && (
                                        <span className={`ml-2 ${
                                          inventoryStatus === 'high' ? 'text-green-600' :
                                          inventoryStatus === 'medium' ? 'text-yellow-600' :
                                          inventoryStatus === 'low' ? 'text-red-600' :
                                          'text-gray-400'
                                        }`}>
                                          (zbývá {remaining}/{event.presetItems.find(pi => pi.menuItemId === menuItem.id)?.quantity || 0})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Middle: Calculated total (shown only when quantity > 0) */}
                                  <div className="text-sm text-gray-600 min-w-[100px] text-right">
                                    {quantity > 0 && (
                                      <span className="font-medium">
                                        {quantity}× = {total.toFixed(2)} Kč
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Right: Buttons (always fixed position) */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => handleItemQuantityChange(menuItem.id, -1)}
                                      className="btn btn-secondary w-10 h-10"
                                      disabled={quantity === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-semibold">{quantity}</span>
                                    <button
                                      onClick={() => handleItemQuantityChange(menuItem.id, 1)}
                                      className="btn btn-primary w-10 h-10"
                                      disabled={event.presetItems && remaining !== null && remaining <= 0}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                        
                        {/* Regular items */}
                        {regularItems.length > 0 && (
                          <>
                            {favoriteItems.length > 0 && (
                              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4 mb-1">
                                Ostatní
                              </div>
                            )}
                            {regularItems.map(menuItem => {
                              const currentItem = editingItems.find(i => i.menuItemId === menuItem.id);
                              const quantity = currentItem?.quantity || 0;
                              const total = menuItem.price * quantity;
                              
                              // Inventory tracking (only for Variant A)
                              let remaining = null;
                              let inventoryStatus = null;
                              let isOutOfStock = false;
                              
                              if (event.presetItems) {
                                remaining = getRemainingQuantity(menuItem.id, event.presetItems, consumptions);
                                const presetItem = event.presetItems.find(pi => pi.menuItemId === menuItem.id);
                                const total = presetItem?.quantity || 0;
                                inventoryStatus = getInventoryStatus(remaining, total);
                                isOutOfStock = remaining === 0;
                              }
                              
                              // Hide items that are out of stock
                              if (isOutOfStock) return null;

                              return (
                                <div key={menuItem.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-gray-50 p-2 rounded">
                                  {/* Left: Item info */}
                                  <div>
                                    <div className="font-medium text-gray-900">{menuItem.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {menuItem.price.toFixed(2)} Kč
                                      {event.presetItems && remaining !== null && (
                                        <span className={`ml-2 ${
                                          inventoryStatus === 'high' ? 'text-green-600' :
                                          inventoryStatus === 'medium' ? 'text-yellow-600' :
                                          inventoryStatus === 'low' ? 'text-red-600' :
                                          'text-gray-400'
                                        }`}>
                                          (zbývá {remaining}/{event.presetItems.find(pi => pi.menuItemId === menuItem.id)?.quantity || 0})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Middle: Calculated total (shown only when quantity > 0) */}
                                  <div className="text-sm text-gray-600 min-w-[100px] text-right">
                                    {quantity > 0 && (
                                      <span className="font-medium">
                                        {quantity}× = {total.toFixed(2)} Kč
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Right: Buttons (always fixed position) */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => handleItemQuantityChange(menuItem.id, -1)}
                                      className="btn btn-secondary w-10 h-10"
                                      disabled={quantity === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-semibold">{quantity}</span>
                                    <button
                                      onClick={() => handleItemQuantityChange(menuItem.id, 1)}
                                      className="btn btn-primary w-10 h-10"
                                      disabled={event.presetItems && remaining !== null && remaining <= 0}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Shared Items */}
                    {sharedItems.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Sdílené položky:</h5>
                        <div className="space-y-2">
                          {sharedItems.map(menuItem => {
                            const isChecked = editingSharedIds.includes(menuItem.id);
                            const participantCount = consumptions.filter(c =>
                              c.sharedItemIds.includes(menuItem.id)
                            ).length + (isChecked ? 1 : 0) - (editingSharedIds.includes(menuItem.id) && consumptions.find(c => c.memberId === balance.memberId)?.sharedItemIds.includes(menuItem.id) ? 1 : 0);
                            const sharePrice = participantCount > 0 ? menuItem.price / participantCount : menuItem.price;

                            return (
                              <label
                                key={menuItem.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                  isChecked ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 border-2 border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSharedItem(menuItem.id)}
                                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{menuItem.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {menuItem.price.toFixed(2)} Kč / {participantCount} = {sharePrice.toFixed(2)} Kč
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="bg-primary-50 p-3 rounded-lg mb-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Celkem:</span>
                        <span>{calculateItemsTotal(editingItems, menuItems).toFixed(2)} Kč</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSaveExpandedConsumption(balance.memberId)} 
                        className="btn btn-primary flex-1"
                      >
                        Uložit
                      </button>
                      <button
                        onClick={() => {
                          setExpandedMemberId(null);
                          setEditingItems([]);
                          setEditingSharedIds([]);
                        }}
                        className="btn btn-secondary flex-1"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Consumption */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {selectedMemberId ? `Upravit konzumaci - ${editingMember?.name}` : 'Přidat/upravit konzumaci'}
        </h2>

        {!selectedMemberId ? (
          <div>
            <label className="label">Vyberte člena</label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleSelectMember(e.target.value)}
              className="input"
            >
              <option value="">-- Vyberte člena --</option>
              {event.presentMemberIds
                .filter((memberId: string) => !(event.selfPaidMemberIds || []).includes(memberId))
                .map((memberId: string) => {
                  const member = members.find(m => m.id === memberId);
                  return (
                    <option key={memberId} value={memberId}>
                      {member?.name}
                    </option>
                  );
                })}
            </select>
          </div>
        ) : (
          <>
            {/* Regular Items */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Položky</h3>
              <div className="space-y-2">
                {/* Favorite items */}
                {favoriteItems.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-2 mb-1">
                      ⭐ Oblíbené
                    </div>
                    {favoriteItems.map(menuItem => {
                      const currentItem = editingItems.find(i => i.menuItemId === menuItem.id);
                      const quantity = currentItem?.quantity || 0;
                      const total = menuItem.price * quantity;
                      
                      // Inventory tracking (only for Variant A)
                      let remaining = null;
                      let inventoryStatus = null;
                      let isOutOfStock = false;
                      
                      if (event.presetItems) {
                        remaining = getRemainingQuantity(menuItem.id, event.presetItems, consumptions);
                        const presetItem = event.presetItems.find(pi => pi.menuItemId === menuItem.id);
                        const total = presetItem?.quantity || 0;
                        inventoryStatus = getInventoryStatus(remaining, total);
                        isOutOfStock = remaining === 0;
                      }
                      
                      // Hide items that are out of stock
                      if (isOutOfStock) return null;

                      return (
                        <div key={menuItem.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {/* Left: Item info */}
                          <div>
                            <div className="font-medium text-gray-900">{menuItem.name}</div>
                            <div className="text-sm text-gray-600">
                              {menuItem.price.toFixed(2)} Kč
                              {event.presetItems && remaining !== null && (
                                <span className={`ml-2 ${
                                  inventoryStatus === 'high' ? 'text-green-600' :
                                  inventoryStatus === 'medium' ? 'text-yellow-600' :
                                  inventoryStatus === 'low' ? 'text-red-600' :
                                  'text-gray-400'
                                }`}>
                                  (zbývá {remaining}/{event.presetItems.find(pi => pi.menuItemId === menuItem.id)?.quantity || 0})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Middle: Calculated total (shown only when quantity > 0) */}
                          <div className="text-sm text-gray-600 min-w-[100px] text-right">
                            {quantity > 0 && (
                              <span className="font-medium">
                                {quantity}× = {total.toFixed(2)} Kč
                              </span>
                            )}
                          </div>
                          
                          {/* Right: Buttons (always fixed position) */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleItemQuantityChange(menuItem.id, -1)}
                              className="btn btn-secondary w-10 h-10"
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <button
                              onClick={() => handleItemQuantityChange(menuItem.id, 1)}
                              className="btn btn-primary w-10 h-10"
                              disabled={event.presetItems && remaining !== null && remaining <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                
                {/* Regular items */}
                {regularItems.length > 0 && (
                  <>
                    {favoriteItems.length > 0 && (
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4 mb-1">
                        Ostatní
                      </div>
                    )}
                    {regularItems.map(menuItem => {
                      const currentItem = editingItems.find(i => i.menuItemId === menuItem.id);
                      const quantity = currentItem?.quantity || 0;
                      const total = menuItem.price * quantity;
                      
                      // Inventory tracking (only for Variant A)
                      let remaining = null;
                      let inventoryStatus = null;
                      let isOutOfStock = false;
                      
                      if (event.presetItems) {
                        remaining = getRemainingQuantity(menuItem.id, event.presetItems, consumptions);
                        const presetItem = event.presetItems.find(pi => pi.menuItemId === menuItem.id);
                        const total = presetItem?.quantity || 0;
                        inventoryStatus = getInventoryStatus(remaining, total);
                        isOutOfStock = remaining === 0;
                      }
                      
                      // Hide items that are out of stock
                      if (isOutOfStock) return null;

                      return (
                        <div key={menuItem.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 bg-gray-50 p-2 rounded">
                          {/* Left: Item info */}
                          <div>
                            <div className="font-medium text-gray-900">{menuItem.name}</div>
                            <div className="text-sm text-gray-600">
                              {menuItem.price.toFixed(2)} Kč
                              {event.presetItems && remaining !== null && (
                                <span className={`ml-2 ${
                                  inventoryStatus === 'high' ? 'text-green-600' :
                                  inventoryStatus === 'medium' ? 'text-yellow-600' :
                                  inventoryStatus === 'low' ? 'text-red-600' :
                                  'text-gray-400'
                                }`}>
                                  (zbývá {remaining}/{event.presetItems.find(pi => pi.menuItemId === menuItem.id)?.quantity || 0})
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Middle: Calculated total (shown only when quantity > 0) */}
                          <div className="text-sm text-gray-600 min-w-[100px] text-right">
                            {quantity > 0 && (
                              <span className="font-medium">
                                {quantity}× = {total.toFixed(2)} Kč
                              </span>
                            )}
                          </div>
                          
                          {/* Right: Buttons (always fixed position) */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleItemQuantityChange(menuItem.id, -1)}
                              className="btn btn-secondary w-10 h-10"
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <button
                              onClick={() => handleItemQuantityChange(menuItem.id, 1)}
                              className="btn btn-primary w-10 h-10"
                              disabled={event.presetItems && remaining !== null && remaining <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Shared Items */}
            {sharedItems.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Sdílené položky</h3>
                <div className="space-y-2">
                  {sharedItems.map(menuItem => {
                    const isChecked = editingSharedIds.includes(menuItem.id);
                    const participantCount = consumptions.filter(c =>
                      c.sharedItemIds.includes(menuItem.id)
                    ).length + (isChecked ? 1 : 0) - (editingSharedIds.includes(menuItem.id) && consumptions.find(c => c.memberId === selectedMemberId)?.sharedItemIds.includes(menuItem.id) ? 1 : 0);
                    const sharePrice = participantCount > 0 ? menuItem.price / participantCount : menuItem.price;

                    return (
                      <label
                        key={menuItem.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                          isChecked ? 'bg-purple-50 border-2 border-purple-300' : 'bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSharedItem(menuItem.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{menuItem.name}</div>
                          <div className="text-sm text-gray-600">
                            {menuItem.price.toFixed(2)} Kč / {participantCount} = {sharePrice.toFixed(2)} Kč
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-primary-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Celkem:</span>
                <span>{editingTotal.toFixed(2)} Kč</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={handleSaveConsumption} className="btn btn-primary flex-1">
                Uložit
              </button>
              <button
                onClick={() => {
                  setSelectedMemberId('');
                  setEditingItems([]);
                  setEditingSharedIds([]);
                }}
                className="btn btn-secondary flex-1"
              >
                Zrušit
              </button>
            </div>
          </>
        )}
      </div>

      {/* Share Link */}
      <div className="card">
        <h3 className="font-medium text-gray-700 mb-2">Sdílitelný odkaz</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={`${window.location.origin}/event/${eventId}`}
            readOnly
            className="input flex-1"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
              alert(TEXTS.notifications.linkCopied);
            }}
            className="btn btn-secondary"
          >
            Kopírovat
          </button>
        </div>
      </div>
    </div>
  );
}
