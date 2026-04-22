import { Link } from 'react-router-dom';
import { Member } from '../../types/models';

interface MemberSelectorProps {
  members: Member[];
  selectedMemberIds: string[];
  selfPaidMemberIds: string[];
  onMemberToggle: (memberId: string) => void;
  onSelfPaidToggle: (memberId: string) => void;
}

export function MemberSelector({
  members,
  selectedMemberIds,
  selfPaidMemberIds,
  onMemberToggle,
  onSelfPaidToggle,
}: MemberSelectorProps) {
  return (
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
                    onChange={() => onMemberToggle(member.id)}
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
                      onChange={() => onSelfPaidToggle(member.id)}
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
  );
}
