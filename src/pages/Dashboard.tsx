import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { TEXTS } from '../constants/texts';

export default function Dashboard() {
  const { members, events, isLoading } = useApp();

  // Loading handled by AppContext LoadingBar

  const coreMembers = members.filter(m => m.isCore);
  const substituteMembers = members.filter(m => !m.isCore);

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{TEXTS.labels.dashboardTitle}</h1>
        <p className="text-gray-600">{TEXTS.labels.dashboardSubtitle}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/event/new" className="btn btn-primary text-center py-4 text-lg">
          {TEXTS.buttons.createEvent}
        </Link>
        <Link to="/menu" className="btn btn-secondary text-center py-4 text-lg">
          📋 {TEXTS.labels.menuItems}
        </Link>
      </div>

      {/* Members Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{TEXTS.labels.members}</h2>
          <Link to="/members" className="btn btn-secondary text-sm">
            {TEXTS.labels.manage}
          </Link>
        </div>

        <div className="card">
          {coreMembers.length === 0 && substituteMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {TEXTS.errors.noMembers} <Link to="/members" className="text-primary-600 underline">{TEXTS.buttons.addMember}</Link>
            </p>
          ) : (
            <div>
              {/* Core Members */}
              {coreMembers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Pravidelní členové</h3>
                  <div className="flex flex-wrap gap-2">
                    {coreMembers.map(member => (
                      <span
                        key={member.id}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800"
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
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Náhradníci</h3>
                  <div className="flex flex-wrap gap-2">
                    {substituteMembers.map(member => (
                      <span
                        key={member.id}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800"
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{TEXTS.labels.events}</h2>

        {events.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">{TEXTS.errors.emptyEvents}</p>
            <Link to="/event/new" className="btn btn-primary">
              {TEXTS.buttons.createEvent}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {event.name || 'Událost bez názvu'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.date), 'dd.MM.yyyy')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status === 'open' ? TEXTS.labels.open : TEXTS.labels.closed}
                  </span>
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <span>👥 {event.presentMemberIds.length} členů</span>
                  <span>💰 {event.totalAmount.toFixed(2)} Kč</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
