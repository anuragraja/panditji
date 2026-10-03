"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Save, Globe, Upload } from "lucide-react";
import { IRestaurantSettings } from "@/types";

export default function AdminWebsiteContentPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          const s = d.settings as IRestaurantSettings;
          setHeroHeading(s.heroHeading || "Desi Swad.<br><em>Apno Wali Feeling.</em>");
          setHeroSubtitle(s.heroSubtitle || "");
          setHeroImage(s.heroImage || "");
          setAnnouncementEnabled(s.announcementBanner?.enabled || false);
          setAnnouncementText(s.announcementBanner?.text || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroHeading,
          heroSubtitle,
          heroImage,
          announcementBanner: {
            enabled: announcementEnabled,
            text: announcementText,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update content");
      }

      showToast("Website content updated! Refresh customer page to see changes. ✓");
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || "Save error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#6c7b87]">
        Loading website configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif-dhaba font-bold text-2xl md:text-3xl text-[#102a43]">
          Website Content Management
        </h1>
        <p className="text-xs text-[#6c7b87]">
          Customize customer-facing hero text, hero background photo, and top announcement banner.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-[#e9e1d4] shadow-sm space-y-6 text-xs">
        {/* Top Announcement Banner */}
        <div className="p-4 bg-[#fbf7ef] rounded-2xl border border-[#e9e1d4] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#102a43] text-sm flex items-center gap-1.5">
              <span>📢 Top Announcement Banner</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="font-bold text-[#102a43]">Enable Banner</span>
            </label>
          </div>

          <input
            type="text"
            placeholder="e.g. Swagatam! Authentic desi flavours served hot. Free delivery on orders above ₹499."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full p-2.5 border border-[#ddd8cf] rounded-xl outline-none bg-white text-[#172b3a]"
          />
        </div>

        {/* Hero Section Content */}
        <div className="space-y-4">
          <h2 className="font-serif-dhaba font-bold text-lg text-[#102a43] pb-2 border-b border-[#e9e1d4]">
            Hero Section Banner
          </h2>

          <div>
            <label className="block font-bold text-[#102a43] mb-1">
              Hero Heading (HTML tags like &lt;br&gt; and &lt;em&gt; supported)
            </label>
            <input
              required
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[#102a43] mb-1">
              Hero Subtitle / Description
            </label>
            <textarea
              required
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-[#102a43] mb-1">
              Hero Background Image URL
            </label>
            <input
              required
              type="url"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full p-3 border border-[#ddd8cf] rounded-xl outline-none text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-dhaba btn-dhaba-gold py-3 px-6 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Website Content"}</span>
        </button>
      </form>
    </div>
  );
}
