import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Member } from '../types/models';
import { TEXTS, formatText } from '../constants/texts';

export default function ManageMembers() {
  const { members, repository, refreshMembers } = useApp();
  const navigate = useNavigate();

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberIsCore, setNewMemberIsCore] = useState(true);
  const [newMemberRevolutUsername, setNewMemberRevolutUsername] = useState('');
  const [newMemberBankAccount, setNewMemberBankAccount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsCore, setEditIsCore] = useState(false);
  const [editRevolutUsername, setEditRevolutUsername] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: Member = {
      id: uuidv4(),
      name: newMemberName.trim(),
      isCore: newMemberIsCore,
      revolutUsername: newMemberRevolutUsername.trim() || undefined,
      bankAccount: newMemberBankAccount.trim() || undefined,
    };

    await repository.addMember(newMember);
    await refreshMembers();
    setNewMemberName('');
    setNewMemberIsCore(true);
    setNewMemberRevolutUsername('');
    setNewMemberBankAccount('');
  };

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditIsCore(member.isCore);
    setEditRevolutUsername(member.revolutUsername || '');
    setEditBankAccount(member.bankAccount || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    const member = members.find(m => m.id === editingId);
    if (!member) return;

    const updatedMember: Member = {
      ...member,
      name: editName.trim(),
      isCore: editIsCore,
      revolutUsername: editRevolutUsername.trim() || undefined,
      bankAccount: editBankAccount.trim() || undefined,
    };

    await repository.updateMember(updatedMember);
    await refreshMembers();
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    if (!confirm(formatText(TEXTS.warnings.deleteMember, { name: member.name }))) return;
    await repository.deleteMember(id);
    await refreshMembers();
  };

  const coreMembers = members.filter(m => m.isCore);
  const substituteMembers = members.filter(m => !m.isCore);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← {TEXTS.labels.back}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{TEXTS.labels.manage} {TEXTS.labels.members}</h1>
      </div>

      {/* Add New Member Form */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">{TEXTS.buttons.addMember}</h2>
        <form onSubmit={handleAddMember}>
          <div className="mb-4">
            <label className="label">{TEXTS.labels.memberName}</label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="input"
              placeholder={TEXTS.placeholders.memberName}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newMemberIsCore}
                onChange={(e) => setNewMemberIsCore(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                {TEXTS.labels.coreMember}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="label">{TEXTS.labels.revolutUsername}</label>
            <input
              type="text"
              value={newMemberRevolutUsername}
              onChange={(e) => setNewMemberRevolutUsername(e.target.value)}
              className="input"
              placeholder={TEXTS.placeholders.revolutUsername}
            />
            <p className="text-xs text-gray-500 mt-1">{TEXTS.helpTexts.revolutUsername}</p>
          </div>

          <div className="mb-4">
            <label className="label">{TEXTS.labels.bankAccount}</label>
            <input
              type="text"
              value={newMemberBankAccount}
              onChange={(e) => setNewMemberBankAccount(e.target.value)}
              className="input"
              placeholder={TEXTS.placeholders.bankAccount}
            />
            <p className="text-xs text-gray-500 mt-1">{TEXTS.helpTexts.bankAccount}</p>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            {TEXTS.buttons.addMember}
          </button>
        </form>
      </div>

      {/* Core Members List */}
      {coreMembers.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Pravidelní členové ⭐</h2>
          <div className="space-y-2">
            {coreMembers.map(member => (
              <div
                key={member.id}
                className="flex items-start justify-between p-3 bg-primary-50 rounded-lg"
              >
                {editingId === member.id ? (
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input flex-1"
                        placeholder="Jméno"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editIsCore}
                          onChange={(e) => setEditIsCore(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">⭐</span>
                      </label>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editRevolutUsername}
                        onChange={(e) => setEditRevolutUsername(e.target.value)}
                        className="input flex-1 text-sm"
                        placeholder="Revolut username"
                      />
                      <input
                        type="text"
                        value={editBankAccount}
                        onChange={(e) => setEditBankAccount(e.target.value)}
                        className="input flex-1 text-sm"
                        placeholder="Číslo účtu"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="btn btn-success flex-1">
                        {TEXTS.buttons.save}
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-secondary flex-1">
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
                            <div>💰 Revolut: {member.revolutUsername.startsWith('@') ? member.revolutUsername : `@${member.revolutUsername}`}</div>
                          )}
                          {member.bankAccount && (
                            <div>🏦 Účet: {member.bankAccount}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(member)} className="btn btn-secondary text-sm">
                        {TEXTS.buttons.edit}
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="btn btn-danger text-sm">
                        {TEXTS.buttons.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitute Members List */}
      {substituteMembers.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Náhradníci</h2>
          <div className="space-y-2">
            {substituteMembers.map(member => (
              <div
                key={member.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                {editingId === member.id ? (
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input flex-1"
                        placeholder="Jméno"
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editIsCore}
                          onChange={(e) => setEditIsCore(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">⭐</span>
                      </label>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editRevolutUsername}
                        onChange={(e) => setEditRevolutUsername(e.target.value)}
                        className="input flex-1 text-sm"
                        placeholder="Revolut username"
                      />
                      <input
                        type="text"
                        value={editBankAccount}
                        onChange={(e) => setEditBankAccount(e.target.value)}
                        className="input flex-1 text-sm"
                        placeholder="Číslo účtu"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEdit} className="btn btn-success flex-1">
                        {TEXTS.buttons.save}
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-secondary flex-1">
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
                            <div>💰 Revolut: {member.revolutUsername.startsWith('@') ? member.revolutUsername : `@${member.revolutUsername}`}</div>
                          )}
                          {member.bankAccount && (
                            <div>🏦 Účet: {member.bankAccount}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(member)} className="btn btn-secondary text-sm">
                        {TEXTS.buttons.edit}
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="btn btn-danger text-sm">
                        {TEXTS.buttons.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">{TEXTS.errors.noMembers}</p>
        </div>
      )}
    </div>
  );
}
