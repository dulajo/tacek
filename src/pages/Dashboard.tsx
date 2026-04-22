import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { TEXTS } from '../constants/texts';
import { Logo } from '../components/Logo';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MemberConsumption } from '../types/models';
import { isConsumptionPaid } from '../services/calculationService';

export default function Dashboard() {
  const { members, events, repository } = useApp();
  const [eventConsumptions, setEventConsumptions] = useState<Record<string, MemberConsumption[]>>({});

  const coreMembers = members.filter(m => m.isCore);
  const substituteMembers = members.filter(m => !m.isCore);

  // Load consumptions for all events
  useEffect(() => {
    const loadAllConsumptions = async () => {
      if (events.length === 0) return;
      
      try {
        // Load all consumptions in parallel for better performance
        const consumptionsPromises = events.map(event => 
          repository.getEventConsumptions(event.id)
            .then(consumptions => ({ eventId: event.id, consumptions }))
            .catch(error => {
              console.error(`Failed to load consumptions for event ${event.id}:`, error);
              return { eventId: event.id, consumptions: [] };
            })
        );
        
        const results = await Promise.all(consumptionsPromises);
        
        const consumptionsMap: Record<string, MemberConsumption[]> = {};
        results.forEach(({ eventId, consumptions }) => {
          consumptionsMap[eventId] = consumptions;
        });
        
        setEventConsumptions(consumptionsMap);
      } catch (error) {
        console.error('Failed to load event consumptions:', error);
      }
    };

    loadAllConsumptions();
  }, [events, repository]);

  // Helper function to get unpaid members for an event (memoized)
  const getUnpaidMembers = useCallback((eventId: string): string[] => {
    const event = events.find(e => e.id === eventId);
    if (!event) return [];
    
    const consumptions = eventConsumptions[eventId] || [];
    
    const unpaidMemberIds = consumptions
      .filter(c => !isConsumptionPaid(c, event))
      .map(c => c.memberId);
    
    return unpaidMemberIds
      .map(id => members.find(m => m.id === id)?.name)
      .filter((name): name is string => !!name);
  }, [events, eventConsumptions, members]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto p-6 pb-24">
        {/* Header */}
        <div className="mb-10">
          <Logo size="large" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link to="/event/new" className="btn btn-primary text-center py-5 text-lg">
            ➕ {TEXTS.buttons.createEvent}
          </Link>
          <Link to="/members" className="btn btn-secondary text-center py-5 text-lg">
            👥 {TEXTS.labels.members}
          </Link>
          <Link to="/menu" className="btn btn-secondary text-center py-5 text-lg">
            📋 {TEXTS.labels.menuItems}
          </Link>
        </div>

        {/* Members Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="heading-2">Členové skupiny</h2>
            <Link to="/members" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
              Spravovat →
            </Link>
          </div>

          <div className="card">
            {coreMembers.length === 0 && substituteMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                {TEXTS.errors.emptyMembers} <Link to="/members" className="text-primary-600 font-semibold underline">{TEXTS.buttons.addMember}</Link>
              </p>
            ) : (
              <div className="space-y-5">
                {/* Core Members */}
                {coreMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pravidelní členové</h3>
                    <div className="flex flex-wrap gap-2">
                      {coreMembers.map(member => (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 font-medium border border-amber-200"
                        >
                          ⭐ {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Substitute Members */}
                {substituteMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Náhradníci</h3>
                    <div className="flex flex-wrap gap-2">
                      {substituteMembers.map(member => (
                        <span
                          key={member.id}
                          className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium border border-gray-200"
                        >
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Events Section */}
        <section>
          <h2 className="heading-2 mb-5">Události</h2>

          {events.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🍺</div>
              <p className="text-gray-500 mb-6 text-lg">{TEXTS.errors.emptyEvents}</p>
              <Link to="/event/new" className="btn btn-primary inline-block">
                {TEXTS.buttons.createEvent}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => {
                const isClosed = event.status === 'closed';
                const unpaidMembers = getUnpaidMembers(event.id);
                const allPaid = unpaidMembers.length === 0;
                
                return (
                  <Link
                    key={event.id}
                    to={`/event/${event.id}`}
                    className={`card hover:shadow-xl transition-all block group ${
                      isClosed ? 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className={`heading-3 transition-colors ${
                          isClosed 
                            ? 'text-gray-500 group-hover:text-gray-700' 
                            : 'group-hover:text-primary-600'
                        }`}>
                          {event.name || 'Událost bez názvu'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                          📅 {format(new Date(event.date), 'dd.MM.yyyy')}
                        </p>
                        
                        {/* Payment status */}
                        {allPaid ? (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            ✓ Všichni zaplatili
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 font-medium mt-1">
                            ⏳ Nezaplaceno: {unpaidMembers.join(', ')}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          event.status === 'open'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {event.status === 'open' ? TEXTS.labels.open : TEXTS.labels.closed}
                      </span>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <span className="text-lg">👥</span> {event.presentMemberIds.length} členů
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <span className="text-lg">💰</span> {event.totalAmount.toFixed(2)} Kč
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}