import { Member } from '../types/models';
import { TEXTS } from '../constants/texts';
import { formatRevolutUsername } from '../utils/formatters';

interface MemberListItemProps {
  member: Member;
  isEditing: boolean;
  bgColorClass: string;
  editName: string;
  editIsCore: boolean;
  editRevolutUsername: string;
  editBankAccount: string;
  onEditNameChange: (value: string) => void;
  onEditIsCoreChange: (value: boolean) => void;
  onEditRevolutUsernameChange: (value: string) => void;
  onEditBankAccountChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export default function MemberListItem({
  member,
  isEditing,
  bgColorClass,
  editName,
  editIsCore,
  editRevolutUsername,
  editBankAccount,
  onEditNameChange,
  onEditIsCoreChange,
  onEditRevolutUsernameChange,
  onEditBankAccountChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: MemberListItemProps) {
  return (
    <div className={`flex items-start justify-between p-3 ${bgColorClass} rounded-lg`}>
      {isEditing ? (
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="input flex-1"
              placeholder="Jméno"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={editIsCore}
                onChange={(e) => onEditIsCoreChange(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">⭐</span>
            </label>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={editRevolutUsername}
              onChange={(e) => onEditRevolutUsernameChange(e.target.value)}
              className="input flex-1 text-sm"
              placeholder="Revolut username"
            />
            <input
              type="text"
              value={editBankAccount}
              onChange={(e) => onEditBankAccountChange(e.target.value)}
              className="input flex-1 text-sm"
              placeholder="Číslo účtu"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={onSave} className="btn btn-success flex-1">
              {TEXTS.buttons.save}
            </button>
            <button onClick={onCancel} className="btn btn-secondary flex-1">
              {TEXTS.buttons.cancel}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{member.name}</div>
            {(member.revolutUsername || member.bankAccount) && (
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                {member.revolutUsername && (
                  <div>💰 Revolut: {formatRevolutUsername(member.revolutUsername)}</div>
                )}
                {member.bankAccount && (
                  <div>🏦 Účet: {member.bankAccount}</div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(member)} className="btn btn-secondary text-sm">
              {TEXTS.buttons.edit}
            </button>
            <button onClick={() => onDelete(member.id)} className="btn btn-danger text-sm">
              {TEXTS.buttons.delete}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
