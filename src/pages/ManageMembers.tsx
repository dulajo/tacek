import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Member } from '../types/models';
import { TEXTS, formatText } from '../constants/texts';
import MemberListItem from '../components/MemberListItem';
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

export default function ManageMembers() {
  const { members, repository, refreshMembers } = useApp();

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberIsCore, setNewMemberIsCore] = useState(true);
  const [newMemberRevolutUsername, setNewMemberRevolutUsername] = useState('');
  const [newMemberBankAccount, setNewMemberBankAccount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsCore, setEditIsCore] = useState(false);
  const [editRevolutUsername, setEditRevolutUsername] = useState('');
  const [editBankAccount, setEditBankAccount] = useState('');
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

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
              <MemberListItem
                key={member.id}
                member={member}
                isEditing={editingId === member.id}
                bgColorClass="bg-primary-50"
                editName={editName}
                editIsCore={editIsCore}
                editRevolutUsername={editRevolutUsername}
                editBankAccount={editBankAccount}
                onEditNameChange={setEditName}
                onEditIsCoreChange={setEditIsCore}
                onEditRevolutUsernameChange={setEditRevolutUsername}
                onEditBankAccountChange={setEditBankAccount}
                onSave={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingMemberId(id)}
              />
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
              <MemberListItem
                key={member.id}
                member={member}
                isEditing={editingId === member.id}
                bgColorClass="bg-gray-50"
                editName={editName}
                editIsCore={editIsCore}
                editRevolutUsername={editRevolutUsername}
                editBankAccount={editBankAccount}
                onEditNameChange={setEditName}
                onEditIsCoreChange={setEditIsCore}
                onEditRevolutUsernameChange={setEditRevolutUsername}
                onEditBankAccountChange={setEditBankAccount}
                onSave={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                onEdit={handleEdit}
                onDelete={(id) => setDeletingMemberId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">{TEXTS.errors.noMembers}</p>
        </div>
      )}

      <AlertDialog open={!!deletingMemberId} onOpenChange={(open) => !open && setDeletingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat člena</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMemberId && formatText(TEXTS.warnings.deleteMember, { name: members.find(m => m.id === deletingMemberId)?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Zrušit</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => {
                if (deletingMemberId) handleDelete(deletingMemberId);
                setDeletingMemberId(null);
              }}>Smazat</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
