import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { TEXTS } from '../constants/texts';
import { Logo } from '../components/Logo';

export default function Dashboard() {
  const { members, events } = useApp();

  const coreMembers = members.filter(m => m.isCore);
  const substituteMembers = members.filter(m => !m.isCore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto p-6 pb-24">
        {/* Header */}
        <div className="mb-10">
          <Logo size="large" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <Link to="/event/new" className="btn btn-primary text-center py-5 text-lg hover:scale-105 transform transition-transform">
            ➕ {TEXTS.buttons.createEvent}
          </Link>
          <Link to="/members" className="btn btn-secondary text-center py-5 text-lg hover:scale-105 transform transition-transform">
            👥 {TEXTS.labels.members}
          </Link>
          <Link to="/menu" className="btn btn-secondary text-center py-5 text-lg hover:scale-105 transform transition-transform">
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
              {events.map(event => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="card hover:shadow-xl hover:scale-[1.02] transition-all block group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="heading-3 group-hover:text-primary-600 transition-colors">
                        {event.name || 'Událost bez názvu'}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        📅 {format(new Date(event.date), 'dd.MM.yyyy')}
                      </p>
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}