import { Link } from 'react-router-dom';
import { Member } from '../../types/models';
import { formatRevolutUsername } from '../../utils/formatters';

interface PayerSectionProps {
  members: Member[];
  selectedMemberIds: string[];
  payerId: string;
  onPayerChange: (payerId: string) => void;
  totalAmount: string;
  tip: string;
  onTotalAmountChange: (value: string) => void;
  onTipChange: (value: string) => void;
}

export function PayerSection({
  members,
  selectedMemberIds,
  payerId,
  onPayerChange,
  totalAmount,
  tip,
  onTotalAmountChange,
  onTipChange,
}: PayerSectionProps) {
  const payer = payerId ? members.find(m => m.id === payerId) : null;
  const hasPaymentInfo = payer ? (payer.revolutUsername || payer.bankAccount) : false;

  return (
    <div className="card mb-4">
      <h2 className="text-lg font-semibold mb-4">Platba</h2>

      <div className="mb-4">
        <label className="label">Kdo zaplatil</label>
        <select
          value={payerId}
          onChange={(e) => onPayerChange(e.target.value)}
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

      {payer && (
        <div className={`p-3 rounded-lg mb-4 ${hasPaymentInfo ? 'bg-green-50 border border-green-300' : 'bg-yellow-50 border border-yellow-300'}`}>
          <div className="font-medium text-gray-900 mb-2">Platič: {payer.name}</div>
          {payer.revolutUsername && (
            <div className="text-sm text-gray-700">
              💰 Revolut: {formatRevolutUsername(payer.revolutUsername)}
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
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label">Celková částka (Kč)</label>
          <input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => onTotalAmountChange(e.target.value)}
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
            value={tip}
            onChange={(e) => onTipChange(e.target.value)}
            className="input"
            placeholder="např. 200"
          />
        </div>
      </div>
    </div>
  );
}
