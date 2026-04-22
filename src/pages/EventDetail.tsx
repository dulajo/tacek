import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Event, MemberConsumption, EventItem } from '../types/models';
import { calculateEventSummary, calculateItemsTotal, calculateAllOverdrafts, isConsumptionPaid } from '../services/calculationService';
import { formatRevolutUsername } from '../utils/formatters';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LoadingBar } from '../components/LoadingBar';
import { ConsumptionForm } from '../components/ConsumptionForm';
import { TEXTS } from '../constants/texts';
import { Button } from '../components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { members, menuItems, repository, refreshEvents } = useApp();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [consumptions, setConsumptions] = useState<MemberConsumption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<EventItem[]>([]);
  const [editingSharedIds, setEditingSharedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAutoCloseDialog, setShowAutoCloseDialog] = useState(false);
  const [showCloseWithUnpaidDialog, setShowCloseWithUnpaidDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [unpaidMemberNames, setUnpaidMemberNames] = useState<string[]>([]);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
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
    } catch (error) {
      console.error('Failed to load event data:', error);
      toast.error('Nepodařilo se načíst událost');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMember = useCallback((memberId: string) => {
    const consumption = consumptions.find(c => c.memberId === memberId);
    setSelectedMemberId(memberId);
    setEditingItems(consumption?.items || []);
    setEditingSharedIds(consumption?.sharedItemIds || []);
    // Close expanded member if any
    setExpandedMemberId(null);
  }, [consumptions]);

  const handleToggleMemberExpansion = useCallback((memberId: string) => {
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
  }, [expandedMemberId, consumptions]);

  const handleSaveConsumption = async (memberId: string) => {
    if (!memberId || !eventId) return;

    const consumption = consumptions.find(c => c.memberId === memberId);
    if (!consumption) return;

    try {
      const updatedConsumption: MemberConsumption = {
        ...consumption,
        items: editingItems,
        sharedItemIds: editingSharedIds,
      };

      await repository.updateConsumption(updatedConsumption);
      await loadEventData();
      setExpandedMemberId(null);
      setSelectedMemberId('');
      setEditingItems([]);
      setEditingSharedIds([]);
      toast.success('Spotřeba uložena');
    } catch (error) {
      console.error('Failed to save consumption:', error);
      toast.error('Nepodařilo se uložit spotřebu');
    }
  };

  const handleItemQuantityChange = useCallback((menuItemId: string, delta: number) => {
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
  }, [editingItems]);

  const handleToggleSharedItem = useCallback((menuItemId: string) => {
    if (editingSharedIds.includes(menuItemId)) {
      setEditingSharedIds(editingSharedIds.filter(id => id !== menuItemId));
    } else {
      setEditingSharedIds([...editingSharedIds, menuItemId]);
    }
  }, [editingSharedIds]);

  const isConsumptionPaidForEvent = useCallback((consumption: MemberConsumption, currentEvent: typeof event): boolean => {
    if (!currentEvent) return true;
    return isConsumptionPaid(consumption, currentEvent);
  }, []);

  // All useMemo hooks MUST be before any conditional returns
  const payer = useMemo(() => members.find(m => m.id === event?.payerId), [members, event?.payerId]);
  
  const summary = useMemo(() => 
    event ? calculateEventSummary(event, consumptions, menuItems, members) : null,
    [event, consumptions, menuItems, members]
  );
  
  // Sort member balances alphabetically by name for consistent ordering
  const sortedMemberBalances = useMemo(() => 
    summary ? [...summary.memberBalances].sort((a, b) => 
      a.memberName.localeCompare(b.memberName, 'cs-CZ')
    ) : [],
    [summary]
  );
  
  const sharedItems = useMemo(() => 
    menuItems.filter(mi => mi.isShared),
    [menuItems]
  );

  // Sort menu items: favorites first, then alphabetically within each group
  const sortedMenuItems = useMemo(() => 
    [...menuItems]
      .filter(mi => !mi.isShared)
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
      }),
    [menuItems]
  );
  
  const favoriteItems = useMemo(() => 
    sortedMenuItems.filter(mi => mi.isFavorite),
    [sortedMenuItems]
  );
  
  const regularItems = useMemo(() => 
    sortedMenuItems.filter(mi => !mi.isFavorite),
    [sortedMenuItems]
  );

  const editingMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  // Calculate totals for validation
  const expectedTotal = useMemo(() => 
    event?.presetItems 
      ? calculateItemsTotal(event.presetItems, menuItems)
      : (event?.totalAmount || 0) - (event?.tip || 0),
    [event?.presetItems, event?.totalAmount, event?.tip, menuItems]
  );

  // Helper function: Calculate detailed breakdown of missing/exceeded items
  const missingItemsBreakdown = useMemo(() => {
    if (!event?.presetItems) return null;
    
    const breakdown: { name: string; diff: number }[] = [];
    
    event.presetItems.forEach(presetItem => {
      const menuItem = menuItems.find(mi => mi.id === presetItem.menuItemId);
      if (!menuItem) return;
      
      // For shared items: count as "consumed" if at least 1 person has it
      if (menuItem.isShared) {
        const participantCount = consumptions.filter(c =>
          c.sharedItemIds.includes(presetItem.menuItemId)
        ).length;
        
        // If someone has it, consider it fully consumed (diff = 0)
        // If nobody has it, it's missing (diff = presetItem.quantity, usually 1)
        const diff = participantCount > 0 ? 0 : presetItem.quantity;
        
        if (diff !== 0) {
          breakdown.push({
            name: menuItem.name,
            diff: diff
          });
        }
      } else {
        // For regular items: count actual quantity consumed
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
      }
    });
    
    return breakdown;
  }, [event?.presetItems, consumptions, menuItems]);



  const handleTogglePaid = async (memberId: string) => {
    const consumption = consumptions.find(c => c.memberId === memberId);
    if (!consumption) return;

    try {
      const updatedConsumption = {
        ...consumption,
        hasPaid: !consumption.hasPaid,
      };

      await repository.updateConsumption(updatedConsumption);
      
      // Check if all members paid after this toggle (only if event is still open)
      // Do this BEFORE refreshing to avoid race conditions
      let shouldShowDialog = false;
      if (event?.status === 'open' && !consumption.hasPaid) {
        // We're marking as paid, check if this was the last unpaid member
        const updatedConsumptions = await repository.getEventConsumptions(eventId!);
        const allPaid = updatedConsumptions.every(c => isConsumptionPaidForEvent(c, event));
        
        shouldShowDialog = allPaid;
      }
      
      await loadEventData();
      await refreshEvents(); // Refresh dashboard to update payment status
      
      if (shouldShowDialog) {
        setShowAutoCloseDialog(true);
      }
    } catch (error) {
      console.error('Failed to toggle paid status:', error);
      toast.error('Nepodařilo se změnit status platby');
    }
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
    sortedMemberBalances
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
    const paidMembers = sortedMemberBalances
      .filter(b => !b.isPayer && (b.hasPaid || b.paidSelf))
      .map(b => b.memberName)
      .join(', ');
    
    const unpaidMembers = sortedMemberBalances
      .filter(b => !b.isPayer && !b.hasPaid && !b.paidSelf)
      .map(b => b.memberName)
      .join(', ');
    
    if (paidMembers) {
      message += `✅ Zaplaceno: ${paidMembers}\n`;
    }
    if (unpaidMembers) {
      message += `⏳ Čeká se: ${unpaidMembers}\n`;
    }
    
    const totalToCollect = sortedMemberBalances
      .filter(b => !b.isPayer && !b.paidSelf)
      .reduce((sum, b) => sum + b.totalOwed, 0);
    
    message += `\nCelkem k vybrání: ${totalToCollect.toFixed(2)} Kč\n`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(message);
      toast.success(TEXTS.notifications.summaryCopied);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(TEXTS.notifications.summaryCopied);
      } catch (e) {
        toast.error(TEXTS.notifications.copyFailed);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleToggleEventStatus = async () => {
    if (!event) return;

    // If trying to close event, check for unpaid members
    if (event.status === 'open') {
      const unpaidMembers = consumptions
        .filter(c => !isConsumptionPaidForEvent(c, event))
        .map(c => members.find(m => m.id === c.memberId)?.name)
        .filter((name): name is string => !!name);
      
      if (unpaidMembers.length > 0) {
        // Show dialog asking what to do with unpaid members
        setUnpaidMemberNames(unpaidMembers);
        setShowCloseWithUnpaidDialog(true);
        return;
      }
    }

    // If opening event or all paid, just toggle status
    await closeEvent();
  };

  // Actually close the event (called from dialog or directly)
  const closeEvent = async (markAllAsPaid: boolean = false) => {
    if (!event) return;

    try {
      // Mark all as paid if requested
      if (markAllAsPaid) {
        const unpaidConsumptions = consumptions.filter(c => !isConsumptionPaidForEvent(c, event));
        // Update all consumptions in parallel for better performance
        await Promise.all(
          unpaidConsumptions.map(consumption => 
            repository.updateConsumption({
              ...consumption,
              hasPaid: true,
            })
          )
        );
      }

      const updatedEvent: Event = {
        ...event,
        status: event.status === 'open' ? 'closed' as const : 'open' as const,
      };

      await repository.updateEvent(updatedEvent);
      await loadEventData();
      await refreshEvents(); // Refresh dashboard to update event status
      toast.success(event.status === 'open' ? 'Událost uzavřena' : 'Událost otevřena');
      
      // Close dialogs
      setShowAutoCloseDialog(false);
      setShowCloseWithUnpaidDialog(false);
    } catch (error) {
      console.error('Failed to toggle event status:', error);
      toast.error('Nepodařilo se změnit status události');
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !eventId) return;
    
    try {
      await repository.deleteEvent(eventId);
      await refreshEvents(); // Refresh dashboard before navigating
      navigate('/');
      toast.success('Událost smazána');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Nepodařilo se smazat událost');
    }
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

  // These values are now computed from useMemo hooks defined above
  const totalConsumed = summary?.totalConsumed || 0;
  const difference = expectedTotal - totalConsumed;

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
            <Button
              asChild
              variant="outline"
            >
              <Link to={`/event/${eventId}/edit`}>
                <Edit className="h-4 w-4" />
                Upravit
              </Link>
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              Smazat
            </Button>
            <Button
              onClick={handleToggleEventStatus}
              variant={event.status === 'open' ? 'outline' : 'success'}
            >
              {event.status === 'open' ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Uzavřít
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Otevřít
                </>
              )}
            </Button>
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
              💰 Revolut: {formatRevolutUsername(payer.revolutUsername)}
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
          <Button
            onClick={handleCopySummary}
            variant="default"
            className="w-full mt-4"
          >
            📋 Zkopírovat rozpis pro skupinu
          </Button>
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
                          <span>• {item.name} <span className="font-medium">({item.diff}× chybí)</span></span>
                        ) : (
                          <span>• {item.name} <span className="font-medium text-red-700">({Math.abs(item.diff)}× navíc)</span></span>
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
          {sortedMemberBalances.map(balance => {
            const isExpanded = expandedMemberId === balance.memberId;
            const isSelfPaid = balance.paidSelf;
            const memberConsumption = consumptions.find(c => c.memberId === balance.memberId);
            const hasItems = (memberConsumption?.items.length || 0) > 0 || (memberConsumption?.sharedItemIds.length || 0) > 0;
            
            // Create temp consumptions for real-time inventory display
            const tempConsumptions = isExpanded ? consumptions.map(c => 
              c.memberId === balance.memberId 
                ? { ...c, items: editingItems, sharedItemIds: editingSharedIds }
                : c
            ) : consumptions;
            
            // Calculate overdrafts for this member (including current edits)
            const currentOverdrafts = event.presetItems && isExpanded 
              ? calculateAllOverdrafts(event.presetItems, tempConsumptions, menuItems)
              : [];
            
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
                        <Button
                          onClick={() => handleToggleMemberExpansion(balance.memberId)}
                          variant={isExpanded ? 'outline' : 'default'}
                          className="w-full mt-3"
                          size="sm"
                        >
                          {isExpanded ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Hotovo
                            </>
                          ) : hasItems ? (
                            <>
                              <Edit className="h-4 w-4" />
                              Upravit konzumaci
                            </>
                          ) : (
                            <>
                              ➕ Přidat konzumaci
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Expanded consumption form */}
                {isExpanded && !isSelfPaid && (
                  <div className="border-t border-gray-300 bg-white p-4">
                    <ConsumptionForm
                      memberId={balance.memberId}
                      presetItems={event.presetItems}
                      consumptions={consumptions}
                      menuItems={menuItems}
                      editingItems={editingItems}
                      editingSharedIds={editingSharedIds}
                      favoriteItems={favoriteItems}
                      regularItems={regularItems}
                      sharedItems={sharedItems}
                      onItemQuantityChange={handleItemQuantityChange}
                      onToggleSharedItem={handleToggleSharedItem}
                      onSave={() => handleSaveConsumption(balance.memberId)}
                      onCancel={() => {
                        setExpandedMemberId(null);
                        setEditingItems([]);
                        setEditingSharedIds([]);
                      }}
                      title={hasItems ? '✏️ Upravit konzumaci' : '➕ Přidat konzumaci'}
                      overdraftWarnings={currentOverdrafts}
                    />
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
          <ConsumptionForm
            memberId={selectedMemberId}
            presetItems={event.presetItems}
            consumptions={consumptions}
            menuItems={menuItems}
            editingItems={editingItems}
            editingSharedIds={editingSharedIds}
            favoriteItems={favoriteItems}
            regularItems={regularItems}
            sharedItems={sharedItems}
            onItemQuantityChange={handleItemQuantityChange}
            onToggleSharedItem={handleToggleSharedItem}
            onSave={() => handleSaveConsumption(selectedMemberId)}
            onCancel={() => {
              setSelectedMemberId('');
              setEditingItems([]);
              setEditingSharedIds([]);
            }}
          />
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
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
              toast.success(TEXTS.notifications.linkCopied);
            }}
            variant="outline"
          >
            📋 Kopírovat
          </Button>
        </div>
      </div>

      {/* Auto-close dialog (when all members paid) */}
      <AlertDialog open={showAutoCloseDialog} onOpenChange={setShowAutoCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Všichni členové zaplatili! 🎉</AlertDialogTitle>
            <AlertDialogDescription>
              Chcete uzavřít událost?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Zrušit</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => closeEvent()}>Uzavřít událost</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close with unpaid dialog (3 buttons) */}
      <AlertDialog open={showCloseWithUnpaidDialog} onOpenChange={setShowCloseWithUnpaidDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Někteří členové ještě nezaplatili</AlertDialogTitle>
            <AlertDialogDescription>
              Nezaplaceno: {unpaidMemberNames.join(', ')}
              <br /><br />
              Chcete uzavřít událost?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button 
              onClick={() => closeEvent(true)}
              className="w-full"
            >
              Označit jako zaplaceno a uzavřít
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCloseWithUnpaidDialog(false);
                closeEvent(false);
              }}
              className="w-full"
            >
              Uzavřít bez platby
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCloseWithUnpaidDialog(false)}
              className="w-full"
            >
              Zrušit
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete event dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat událost</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tuto událost? Tato akce je nevratná.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Zrušit</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteEvent}>Smazat</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
