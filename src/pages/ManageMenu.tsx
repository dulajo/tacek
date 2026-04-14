import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../types/models';
import { TEXTS, formatText } from '../constants/texts';

export default function ManageMenu() {
  const { menuItems, repository, refreshMenuItems } = useApp();

  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'drink' as 'food' | 'drink' | 'other',
    isShared: false,
    isFavorite: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({
    name: '',
    price: '',
    category: 'drink' as 'food' | 'drink' | 'other',
    isShared: false,
    isFavorite: false,
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) return;

    const item: MenuItem = {
      id: uuidv4(),
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
      category: newItem.category,
      isShared: newItem.isShared,
      isFavorite: newItem.isFavorite,
    };

    await repository.addMenuItem(item);
    await refreshMenuItems();
    setNewItem({ name: '', price: '', category: 'drink', isShared: false, isFavorite: false });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      isShared: item.isShared,
      isFavorite: item.isFavorite || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editItem.name.trim() || !editItem.price) return;

    const item = menuItems.find(m => m.id === editingId);
    if (!item) return;

    const updatedItem: MenuItem = {
      ...item,
      name: editItem.name.trim(),
      price: parseFloat(editItem.price),
      category: editItem.category,
      isShared: editItem.isShared,
      isFavorite: editItem.isFavorite,
    };

    await repository.updateMenuItem(updatedItem);
    await refreshMenuItems();
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    if (!confirm(formatText(TEXTS.warnings.deleteMenuItem, { item: item.name }))) return;
    await repository.deleteMenuItem(id);
    await refreshMenuItems();
  };

  const foodItems = menuItems.filter(i => i.category === 'food');
  const drinkItems = menuItems.filter(i => i.category === 'drink');
  const otherItems = menuItems.filter(i => i.category === 'other');

  const categoryLabels = {
    food: TEXTS.labels.food,
    drink: TEXTS.labels.drink,
    other: TEXTS.labels.other,
  };

  const renderItems = (items: MenuItem[], title: string) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
            >
              {editingId === item.id ? (
                <div className="flex-1 grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      className="input"
                      placeholder="Název"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editItem.price}
                      onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                      className="input"
                      placeholder="Cena"
                    />
                    <select
                      value={editItem.category}
                      onChange={(e) => setEditItem({ ...editItem, category: e.target.value as any })}
                      className="input"
                    >
                      <option value="food">Jídlo</option>
                      <option value="drink">Pití</option>
                      <option value="other">Ostatní</option>
                    </select>
                  </div>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editItem.isShared}
                        onChange={(e) => setEditItem({ ...editItem, isShared: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Sdílená</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editItem.isFavorite}
                        onChange={(e) => setEditItem({ ...editItem, isFavorite: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">⭐ Oblíbená</span>
                    </label>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={handleSaveEdit} className="btn btn-success text-sm px-3">
                        Uložit
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-secondary text-sm px-3">
                        Zrušit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {item.isFavorite && '⭐ '}
                        {item.name}
                      </span>
                      {item.isShared && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Sdílená
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{item.price.toFixed(2)} Kč</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="btn btn-secondary text-sm">
                      Upravit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-danger text-sm">
                      Smazat
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Zpět na dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Jídelní lístek</h1>
        <p className="text-gray-600">
          Změny v cenách ovlivní pouze nové události
        </p>
      </div>

      {/* Add New Item Form */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Přidat novou položku</h2>
        <form onSubmit={handleAddItem}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Název</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="input"
                placeholder="např. Pivo"
                required
              />
            </div>

            <div>
              <label className="label">Cena (Kč)</label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="input"
                placeholder="např. 50"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Kategorie</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
              className="input"
            >
              <option value="drink">Pití</option>
              <option value="food">Jídlo</option>
              <option value="other">Ostatní</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.isShared}
                onChange={(e) => setNewItem({ ...newItem, isShared: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Sdílená položka (např. vodní dýmka)
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.isFavorite}
                onChange={(e) => setNewItem({ ...newItem, isFavorite: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                ⭐ Oblíbená položka (zobrazí se nahoře)
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Přidat položku
          </button>
        </form>
      </div>

      {/* Menu Items List */}
      <div className="card">
        {menuItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Zatím nemáte žádné položky v jídelním lístku
          </p>
        ) : (
          <>
            {renderItems(drinkItems, '🍺 Pití')}
            {renderItems(foodItems, '🍔 Jídlo')}
            {renderItems(otherItems, '📦 Ostatní')}
          </>
        )}
      </div>
    </div>
  );
}
