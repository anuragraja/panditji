"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ICategory } from "@/types";
import { useToast } from "@/context/ToastContext";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const [name, setName] = useState("");
  const [hindiName, setHindiName] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openNewModal = () => {
    setEditingCategory(null);
    setName("");
    setHindiName("");
    setSlug("");
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: ICategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setHindiName(cat.hindiName || "");
    setSlug(cat.slug);
    setDisplayOrder(cat.displayOrder || 0);
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleToggleActive = async (cat: ICategory) => {
    try {
      const res = await fetch(`/api/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Category ${!cat.isActive ? "enabled" : "disabled"}`);
        fetchCategories();
      }
    } catch {
      showToast("Error updating category status");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Dishes in this category may be affected.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Category deleted ✓");
        fetchCategories();
      }
    } catch {
      showToast("Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: name.trim(),
      hindiName: hindiName.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      displayOrder: Number(displayOrder),
      isActive,
    };

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save category");
      }

      showToast(editingCategory ? "Category updated! ✓" : "Category created! ✓");
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Category Management
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Organise menu categories, change their order, and control visibility on the customer website.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="btn-dhaba btn-dhaba-gold py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No categories defined yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Hindi Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4 font-black text-[#102a43]">
                      #{cat.displayOrder}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#102a43] text-sm">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-[#9a6714] font-semibold">
                      {cat.hindiName || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6c7b87]">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                          cat.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[#6c7b87] hover:text-[#102a43] rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-1.5 text-[#6c7b87] hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cat-modal-title"
          className="fixed inset-0 z-50 bg-[#04111b]/65 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e9e1d4] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e9e1d4]">
              <h2 id="cat-modal-title" className="font-serif-dhaba font-bold text-xl text-[#102a43]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1 text-[#6c7b87] hover:text-[#102a43]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Category Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Main Course"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Hindi Translation
                </label>
                <input
                  type="text"
                  placeholder="e.g. मुख्य व्यंजन"
                  value={hindiName}
                  onChange={(e) => setHindiName(e.target.value)}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="activeCheck" className="font-bold text-[#102a43]">
                  Active on customer menu
                </label>
              </div>

              <div className="pt-3 border-t border-[#e9e1d4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-dhaba bg-gray-100 text-gray-700 py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-dhaba btn-dhaba-gold py-2 px-5 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
