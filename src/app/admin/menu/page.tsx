"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IMenuItem, ICategory, IVariant, IAddOn, FoodType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Upload,
  Sparkles,
  X,
} from "lucide-react";

export default function AdminMenuPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<IMenuItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [hindiName, setHindiName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Main Course");
  const [foodType, setFoodType] = useState<FoodType>("VEG");
  const [basePrice, setBasePrice] = useState<number>(150);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [image, setImage] = useState("");
  const [tag, setTag] = useState("");
  const [preparationTime, setPreparationTime] = useState("15-20 mins");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [todaySpecial, setTodaySpecial] = useState(false);

  // Variants & Add-ons
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [addOns, setAddOns] = useState<IAddOn[]>([]);

  // Temp input for adding variant / addon
  const [varName, setVarName] = useState("");
  const [varPrice, setVarPrice] = useState<number>(0);
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch("/api/menu?all=true"),
        fetch("/api/categories?all=true"),
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      if (menuData.success) setItems(menuData.items);
      if (catData.success) setCategories(catData.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openNewItemModal = () => {
    setEditingItem(null);
    setName("");
    setHindiName("");
    setSlug("");
    setDescription("");
    setCategory(categories[0]?.name || "Main Course");
    setFoodType("VEG");
    setBasePrice(150);
    setDiscountPrice(undefined);
    setImage(
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=85"
    );
    setTag("");
    setPreparationTime("15-20 mins");
    setAvailable(true);
    setFeatured(false);
    setPopular(false);
    setTodaySpecial(false);
    setVariants([]);
    setAddOns([]);
    setModalOpen(true);
  };

  const openEditModal = (item: IMenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setHindiName(item.hindiName || "");
    setSlug(item.slug);
    setDescription(item.description);
    setCategory(item.category);
    setFoodType(item.foodType);
    setBasePrice(item.basePrice);
    setDiscountPrice(item.discountPrice);
    setImage(item.image);
    setTag(item.tag || "");
    setPreparationTime(item.preparationTime || "15-20 mins");
    setAvailable(item.available);
    setFeatured(item.featured);
    setPopular(item.popular);
    setTodaySpecial(item.todaySpecial);
    setVariants(item.variants || []);
    setAddOns(item.addOns || []);
    setModalOpen(true);
  };

  const handleToggleAvailability = async (item: IMenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `"${item.name}" marked ${!item.available ? "Available" : "Unavailable"}`
        );
        fetchData();
      }
    } catch {
      showToast("Error updating availability");
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Dish deleted successfully.");
        fetchData();
      }
    } catch {
      showToast("Failed to delete dish.");
    }
  };

  const handleDuplicate = async (item: IMenuItem) => {
    const duplicatedSlug = `${item.slug}-copy-${Date.now().toString().slice(-4)}`;
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          _id: undefined,
          name: `${item.name} (Copy)`,
          slug: duplicatedSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Duplicated ${item.name} ✓`);
        fetchData();
      }
    } catch {
      showToast("Duplicate error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImage(data.url);
        showToast("Image uploaded successfully! ✓");
      }
    } catch {
      showToast("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      hindiName,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      category,
      foodType,
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      image,
      tag,
      preparationTime,
      available,
      featured,
      popular,
      todaySpecial,
      variants,
      addOns,
    };

    try {
      let res;
      if (editingItem) {
        res = await fetch(`/api/menu/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save menu item");
      }

      showToast(editingItem ? "Dish updated! ✓" : "New dish added! ✓");
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((it) => {
    const matchCat = catFilter === "ALL" || it.category === catFilter;
    const matchSearch =
      !search ||
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.hindiName && it.hindiName.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
            Menu Management
          </h1>
          <p className="text-xs text-[#6c7b87]">
            Add dishes, portion variants, prices, add-on options, and toggle stock availability.
          </p>
        </div>

        <button
          onClick={openNewItemModal}
          className="btn-dhaba btn-dhaba-gold py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e9e1d4]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCatFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              catFilter === "ALL"
                ? "bg-[#102a43] text-white"
                : "text-[#526575] hover:bg-[#fbf7ef]"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setCatFilter(c.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                catFilter === c.name
                  ? "bg-[#102a43] text-white"
                  : "text-[#526575] hover:bg-[#fbf7ef]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-4 h-4 text-[#6c7b87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#ddd8cf] outline-none"
          />
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="bg-white rounded-3xl border border-[#e9e1d4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            Loading menu items...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6c7b87]">
            No dishes found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf7ef] border-b border-[#e9e1d4] text-[#6c7b87] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Portions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e9e1d4]/60">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-[#fbf7ef]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 relative overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <b className="text-sm text-[#102a43] block">{item.name}</b>
                          {item.hindiName && (
                            <span className="text-[11px] text-[#9a6714] font-medium block">
                              {item.hindiName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#526575]">
                      {item.category}
                    </td>
                    <td className="py-3 px-4">
                      <b className="text-[#102a43] text-sm">
                        {formatCurrency(item.discountPrice || item.basePrice)}
                      </b>
                      {item.discountPrice && (
                        <span className="text-[10px] text-[#6c7b87] line-through block">
                          {formatCurrency(item.basePrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6c7b87]">
                      {item.variants && item.variants.length > 0 ? (
                        <span>{item.variants.map((v) => v.name).join(", ")}</span>
                      ) : (
                        <span>Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                          item.available
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {item.available ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Unavailable
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-[#6c7b87] hover:text-[#102a43] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-1.5 text-[#6c7b87] hover:text-[#d99a2b] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-1.5 text-[#6c7b87] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Add / Edit Dish Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-form-modal-title"
          className="fixed inset-0 z-50 bg-[#04111b]/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#e9e1d4] max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e9e1d4]">
              <h2 id="dish-form-modal-title" className="font-serif-dhaba font-bold text-xl text-[#102a43]">
                {editingItem ? "Edit Dish" : "Add New Dish"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-[#6c7b87] hover:text-[#102a43] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    English Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Paneer Butter Masala"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Hindi Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. पनीर बटर मसाला"
                    value={hindiName}
                    onChange={(e) => setHindiName(e.target.value)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Delicious dish description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#102a43] mb-1">
                    Special Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={discountPrice || ""}
                    onChange={(e) =>
                      setDiscountPrice(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Image Input with Upload button */}
              <div>
                <label className="block font-bold text-[#102a43] mb-1">
                  Dish Image URL or Cloudinary Upload
                </label>
                <div className="flex gap-2">
                  <input
                    required
                    type="url"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none"
                  />
                  <label className="btn-dhaba bg-[#102a43] text-white p-2.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Portions / Variants Builder */}
              <div className="p-3 bg-[#fbf7ef] rounded-2xl border border-[#e9e1d4] space-y-2">
                <span className="font-bold text-[#102a43] block">
                  Portion Sizes / Variants (e.g. Half / Full)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Portion name (e.g. Half)"
                    value={varName}
                    onChange={(e) => setVarName(e.target.value)}
                    className="w-1/2 p-2 border border-[#ddd8cf] rounded-xl bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={varPrice || ""}
                    onChange={(e) => setVarPrice(Number(e.target.value))}
                    className="w-1/3 p-2 border border-[#ddd8cf] rounded-xl bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (varName && varPrice > 0) {
                        setVariants([...variants, { name: varName, price: varPrice }]);
                        setVarName("");
                        setVarPrice(0);
                      }
                    }}
                    className="btn-dhaba btn-dhaba-gold py-1 px-3 text-xs"
                  >
                    + Add
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {variants.map((v, i) => (
                      <span
                        key={i}
                        className="bg-white border border-[#d99a2b]/30 px-2.5 py-1 rounded-lg flex items-center gap-2 font-semibold"
                      >
                        <span>
                          {v.name}: {formatCurrency(v.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Add-ons Builder */}
              <div className="p-3 bg-[#fbf7ef] rounded-2xl border border-[#e9e1d4] space-y-2">
                <span className="font-bold text-[#102a43] block">
                  Add-on Options (e.g. Extra Butter, Extra Paneer)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add-on name (e.g. Extra Ghee)"
                    value={addOnName}
                    onChange={(e) => setAddOnName(e.target.value)}
                    className="w-1/2 p-2 border border-[#ddd8cf] rounded-xl bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={addOnPrice || ""}
                    onChange={(e) => setAddOnPrice(Number(e.target.value))}
                    className="w-1/3 p-2 border border-[#ddd8cf] rounded-xl bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (addOnName && addOnPrice > 0) {
                        setAddOns([...addOns, { name: addOnName, price: addOnPrice }]);
                        setAddOnName("");
                        setAddOnPrice(0);
                      }
                    }}
                    className="btn-dhaba btn-dhaba-gold py-1 px-3 text-xs"
                  >
                    + Add
                  </button>
                </div>

                {addOns.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {addOns.map((a, i) => (
                      <span
                        key={i}
                        className="bg-white border border-[#d99a2b]/30 px-2.5 py-1 rounded-lg flex items-center gap-2 font-semibold"
                      >
                        <span>
                          {a.name}: +{formatCurrency(a.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkbox Flags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-bold text-[#102a43]">Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-bold text-[#102a43]">Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-bold text-[#102a43]">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={todaySpecial}
                    onChange={(e) => setTodaySpecial(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-bold text-[#102a43]">Today&apos;s Special</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#e9e1d4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-dhaba bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-dhaba btn-dhaba-gold py-2.5 px-5 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update Dish" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
