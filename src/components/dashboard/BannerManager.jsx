"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AddBannerModal from "./AddBannerModel";

const BANNERS_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/banners/dashboard`;

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [activeFace, setActiveFace] = useState({});

  const authHeaders = () => {
    const token = sessionStorage.getItem("pm_admin_token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BANNERS_BASE_URL}/all`, {
        headers: authHeaders(),
      });

      setBanners(response.data?.banners || response.data || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setError("Couldn't load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaved = () => {
    fetchBanners();
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete "${banner.title}"? This can't be undone.`)) {
      return;
    }

    setDeletingId(banner.id);
    try {
      await axios.delete(`${BANNERS_BASE_URL}/${banner.id}`, {
        headers: authHeaders(),
      });
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err) {
      console.error("Failed to delete banner:", err);
      window.alert("Couldn't delete the banner. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const setFace = (bannerId, face) => {
    setActiveFace((prev) => ({ ...prev, [bannerId]: face }));
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Banners</h2>
          <p className="text-sm text-gray-500">
            Desktop and mobile creatives shown on the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add banner
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading banners...</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        ) : banners.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No banners yet. Add one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {banners
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((banner) => {
                const face = activeFace[banner.id] || "desktop";
                const activeImage =
                  face === "desktop" ? banner.desktopImage : banner.mobileImage;

                return (
                  <div
                    key={banner.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative bg-gray-100">
                      <img
                        src={activeImage}
                        alt={`${banner.title} ${face}`}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-64"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                          banner.isActive
                            ? "bg-green-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {banner.isActive ? "● Active" : "Inactive"}
                      </span>
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                        #{banner.order}
                      </span>

                      <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-full bg-white/90 text-xs font-medium shadow-sm">
                        <button
                          type="button"
                          onClick={() => setFace(banner.id, "desktop")}
                          className={`px-3 py-1.5 transition cursor-pointer ${
                            face === "desktop"
                              ? "bg-indigo-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setFace(banner.id, "mobile")}
                          className={`px-3 py-1.5 transition cursor-pointer ${
                            face === "mobile"
                              ? "bg-indigo-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Mobile
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 px-4 py-3.5">
                      <p className="truncate text-base font-semibold text-gray-900">
                        {banner.title}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {banner.linkType} · {banner.link}
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated {formatDate(banner.updatedAt)}
                      </p>

                      <div className="flex items-center gap-4 pt-2.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(banner)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner)}
                          disabled={deletingId === banner.id}
                          className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          {deletingId === banner.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <AddBannerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        banner={editingBanner}
      />
    </div>
  );
}