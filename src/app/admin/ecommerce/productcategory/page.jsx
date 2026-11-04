"use client";

import {
  ceateProductCategory,
  updateProductCategory,
  updateStatusProductCategory,
  deleteProductCategory,
  getProductCategory,
} from "@/apiService/productCategory.js";

import { useEffect, useRef, useState } from "react";
import {Plus, Search, Pencil, Trash2, X, RefreshCw, ChevronLeft, ChevronRight, Image as ImageIcon, Monitor,
  Smartphone, FolderOpen, CheckCircle2, XCircle, Upload, AlertTriangle, Undo2, Link2,} from "lucide-react";

const initialForm = {
  name: "",
  slug: "",
  shortdes: "",
  desktopImage: null,
  mobileImage: null,
  status: true,
};

const MAX_DESC = 160;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [existing, setExisting] = useState({ desktop: "", mobile: "" });

  const [desktopError, setDesktopError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const toastId = useRef(0);

  /* ---------- toast ---------- */
  const notify = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3800
    );
  };

  const errorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

  /* ---------- data ---------- */
  const handleGetCategory = async () => {
    try {
      setLoading(true);
      const response = await getProductCategory(page, limit);
      const result = response?.data ?? response;

      setCategories(Array.isArray(result?.category) ? result.category : []);
      setTotal(Number(result?.total ?? 0));
      setTotalPages(Math.max(1, Number(result?.totalPages ?? 1)));
    } catch (error) {
      console.error("Error fetching categories:", error);
      notify(errorMessage(error, "Failed to fetch categories"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    return () => {
      if (desktopPreview.startsWith("blob:")) URL.revokeObjectURL(desktopPreview);
      if (mobilePreview.startsWith("blob:")) URL.revokeObjectURL(mobilePreview);
    };
  }, [desktopPreview, mobilePreview]);

  /* close modal with Escape + lock page scroll while open */
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => e.key === "Escape" && !saving && closeModal();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, saving]);

  const query = search.trim().toLowerCase();
  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(query) ||
      c.slug?.toLowerCase().includes(query) ||
      c.shortdes?.toLowerCase().includes(query)
  );

  const activeCount = categories.filter((c) => c.status).length;
  const inactiveCount = categories.length - activeCount;

  /* ---------- modal ---------- */
  const resetModalState = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    setSlugTouched(false);
    setDesktopPreview("");
    setMobilePreview("");
    setExisting({ desktop: "", mobile: "" });
    setDesktopError("");
    setMobileError("");
  };

  const openCreateModal = () => {
    resetModalState();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    resetModalState();
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      shortdes: category.shortdes || "",
      desktopImage: null,
      mobileImage: null,
      status: category.status ?? true,
    });
    setSlugTouched(true);
    setDesktopPreview(category.desktopImage || "");
    setMobilePreview(category.mobileImage || "");
    setExisting({
      desktop: category.desktopImage || "",
      mobile: category.mobileImage || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    resetModalState();
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };

      if (name === "name" && !editingId && !slugTouched) {
        updated.slug = slugify(value);
      }
      return updated;
    });

    if (name === "slug") setSlugTouched(true);
  };

  /* ---------- images ---------- */
  const processImage = (name, file) => {
    const isDesktop = name === "desktopImage";
    const setError = isDesktop ? setDesktopError : setMobileError;
    const setPreview = isDesktop ? setDesktopPreview : setMobilePreview;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(`Please select a valid ${isDesktop ? "desktop" : "mobile"} image.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setError("");
    const url = URL.createObjectURL(file);

    setPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    setForm((prev) => ({ ...prev, [name]: file }));
  };

  const handleImageChange = (event) => {
    processImage(event.target.name, event.target.files?.[0]);
    event.target.value = "";
  };

  const undoImage = (name) => {
    const isDesktop = name === "desktopImage";
    const setPreview = isDesktop ? setDesktopPreview : setMobilePreview;

    setPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return isDesktop ? existing.desktop : existing.mobile;
    });
    setForm((prev) => ({ ...prev, [name]: null }));
    (isDesktop ? setDesktopError : setMobileError)("");
  };

  /* ---------- save / status / delete ---------- */
  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      notify("Name and slug are required.", "error");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("shortdes", form.shortdes.trim());
      formData.append("status", String(form.status));

      if (form.desktopImage instanceof File) {
        formData.append("desktopImg", form.desktopImage);
      }
      if (form.mobileImage instanceof File) {
        formData.append("mobileImg", form.mobileImage);
      }

      if (editingId) {
        await updateProductCategory(editingId, formData);
      } else {
        await ceateProductCategory(formData);
      }

      const wasEditing = Boolean(editingId);
      setModalOpen(false);
      resetModalState();
      await handleGetCategory();
      notify(wasEditing ? "Category updated." : "Category created.");
    } catch (error) {
      console.error("Save category error:", error);
      notify(errorMessage(error, "Failed to save category."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (category) => {
    setConfirmState({
      title: category.status ? "Deactivate category?" : "Activate category?",
      message: category.status
        ? `"${category.name}" will be hidden from your store.`
        : `"${category.name}" will become visible in your store.`,
      confirmLabel: category.status ? "Deactivate" : "Activate",
      tone: category.status ? "warning" : "success",
      onConfirm: async () => {
        await updateStatusProductCategory(category._id);
        await handleGetCategory();
        notify(category.status ? "Category deactivated." : "Category activated.");
      },
    });
  };

  const handleDelete = (category) => {
    setConfirmState({
      title: "Delete category?",
      message: `"${category.name}" will be permanently removed. This can't be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: async () => {
        await deleteProductCategory(category._id);
        if (categories.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          await handleGetCategory();
        }
        notify("Category deleted.");
      },
    });
  };

  const runConfirm = async () => {
    const action = confirmState?.onConfirm;
    if (!action) return;
    try {
      setConfirmState((prev) => ({ ...prev, busy: true }));
      await action();
      setConfirmState(null);
    } catch (error) {
      console.error(error);
      notify(errorMessage(error, "Something went wrong."), "error");
      setConfirmState(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <FolderOpen size={15} />
                <span>Dashboard</span>
                <ChevronRight size={14} />
                <span className="text-slate-200">Product categories</span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Product categories
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-slate-300">
                Organise your catalogue, upload banners for desktop and mobile,
                and control what shoppers can see.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Plus size={18} />
              Add category
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total categories"
            value={total}
            icon={<FolderOpen size={22} />}
            color="blue"
            percent={100}
          />
          <StatCard
            title="Active on this page"
            value={activeCount}
            icon={<CheckCircle2 size={22} />}
            color="green"
            percent={categories.length ? (activeCount / categories.length) * 100 : 0}
          />
          <StatCard
            title="Inactive on this page"
            value={inactiveCount}
            icon={<XCircle size={22} />}
            color="red"
            percent={categories.length ? (inactiveCount / categories.length) * 100 : 0}
          />
        </section>

        {/* List */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                All categories
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Showing {filteredCategories.length} of {categories.length} on
                this page
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <button
                type="button"
                onClick={handleGetCategory}
                disabled={loading}
                title="Refresh categories"
                aria-label="Refresh categories"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Desktop</th>
                  <th className="px-5 py-3.5">Mobile</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, c) => (
                        <td key={c} className="px-5 py-5">
                          <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState search={search} onAdd={openCreateModal} />
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb src={category.desktopImage} alt={category.name} />
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900">
                              {category.name || "-"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {category.shortdes || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                          <Link2 size={12} className="text-slate-400" />
                          {category.slug || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <BannerLink
                          src={category.desktopImage}
                          alt={`${category.name} desktop`}
                          className="h-14 w-24"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <BannerLink
                          src={category.mobileImage}
                          alt={`${category.name} mobile`}
                          className="h-14 w-12"
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(category.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusSwitch
                          checked={category.status}
                          onClick={() => handleToggleStatus(category)}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            title="Edit category"
                            tone="blue"
                            onClick={() => openEditModal(category)}
                          >
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            title="Delete category"
                            tone="red"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))
            ) : filteredCategories.length === 0 ? (
              <EmptyState search={search} onAdd={openCreateModal} />
            ) : (
              filteredCategories.map((category) => (
                <article key={category._id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <Thumb src={category.desktopImage} alt={category.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {category.name || "-"}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {category.shortdes || "No description"}
                      </p>
                    </div>
                    <StatusSwitch
                      checked={category.status}
                      onClick={() => handleToggleStatus(category)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
                        {category.slug || "-"}
                      </span>
                      <span className="ml-2">{formatDate(category.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <IconButton
                        title="Edit category"
                        tone="blue"
                        onClick={() => openEditModal(category)}
                      >
                        <Pencil size={16} />
                      </IconButton>
                      <IconButton
                        title="Delete category"
                        tone="red"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-800">{page}</span>{" "}
              of <span className="font-semibold text-slate-800">{totalPages}</span>
              <span className="mx-2 text-slate-300">|</span>
              {total} total categories
            </p>

            <div className="flex items-center gap-1.5">
              <PageButton
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                label="Previous page"
              >
                <ChevronLeft size={16} />
              </PageButton>

              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-slate-400">
                    ...
                  </span>
                ) : (
                  <PageButton
                    key={n}
                    active={n === page}
                    disabled={loading}
                    onClick={() => setPage(n)}
                    label={`Page ${n}`}
                  >
                    {n}
                  </PageButton>
                )
              )}

              <PageButton
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                label="Next page"
              >
                <ChevronRight size={16} />
              </PageButton>
            </div>
          </div>
        </section>
      </div>

      {/* Create / edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                  {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? "Edit category" : "Create category"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Add details and banner images for this category.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Category name" required>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Grainly Apple Pie Cream of Rice"
                      required
                      autoFocus
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Slug"
                    required
                    hint={!editingId && !slugTouched ? "Generated from the name" : ""}
                  >
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleFormChange}
                      placeholder="grainly-apple-pie-cream-of-rice"
                      required
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field
                  label="Short description"
                  hint={`${form.shortdes.length}/${MAX_DESC}`}
                >
                  <textarea
                    name="shortdes"
                    value={form.shortdes}
                    onChange={handleFormChange}
                    maxLength={MAX_DESC}
                    placeholder="One or two lines shoppers will see under the category name"
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <ImageUploadField
                    title="Desktop image"
                    description="Wide banner for large screens"
                    name="desktopImage"
                    preview={desktopPreview}
                    error={desktopError}
                    changed={form.desktopImage instanceof File}
                    onChange={handleImageChange}
                    onDropFile={(file) => processImage("desktopImage", file)}
                    onUndo={() => undoImage("desktopImage")}
                    icon={<Monitor size={18} />}
                    aspect="aspect-video"
                  />

                  <ImageUploadField
                    title="Mobile image"
                    description="Tall image for phones"
                    name="mobileImage"
                    preview={mobilePreview}
                    error={mobileError}
                    changed={form.mobileImage instanceof File}
                    onChange={handleImageChange}
                    onDropFile={(file) => processImage("mobileImage", file)}
                    onUndo={() => undoImage("mobileImage")}
                    icon={<Smartphone size={18} />}
                    aspect="aspect-video"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {form.status ? "Active" : "Inactive"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {form.status
                        ? "Visible to shoppers."
                        : "Hidden from shoppers until you activate it."}
                    </p>
                  </div>
                  <StatusSwitch
                    checked={form.status}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, status: !prev.status }))
                    }
                    hideLabel
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmState && (
        <ConfirmDialog
          {...confirmState}
          onCancel={() => !confirmState.busy && setConfirmState(null)}
          onConfirm={runConfirm}
        />
      )}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="flex-1 font-medium">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="opacity-60 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

function getPageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push("...");
    result.push(n);
  });
  return result;
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ title, value, icon, color, percent }) {
  const styles = {
    blue: { icon: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
    green: { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
    red: { icon: "bg-rose-50 text-rose-600", bar: "bg-rose-500" },
  }[color];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${styles.icon}`}>{icon}</div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
          style={{ width: `${Math.round(percent)}%` }}
        />
      </div>
    </div>
  );
}

function Thumb({ src, alt }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      {src ? (
        <img src={src} alt={alt || "Category"} className="h-full w-full object-cover" />
      ) : (
        <ImageIcon size={20} className="text-slate-400" />
      )}
    </div>
  );
}

function BannerLink({ src, alt, className }) {
  if (!src) return <span className="text-xs text-slate-400">No image</span>;
  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className={`block overflow-hidden rounded-lg border border-slate-200 bg-slate-100 transition hover:ring-2 hover:ring-teal-400 ${className}`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </a>
  );
}

function StatusSwitch({ checked, onClick, hideLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className="inline-flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      {!hideLabel && (
        <span
          className={`text-xs font-semibold ${
            checked ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {checked ? "Active" : "Inactive"}
        </span>
      )}
    </button>
  );
}

function IconButton({ children, title, tone, onClick }) {
  const tones = {
    blue: "hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600",
    red: "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`rounded-lg border border-slate-200 p-2 text-slate-500 transition ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function PageButton({ children, active, disabled, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ search, onAdd }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
        <FolderOpen size={30} />
      </div>
      <p className="font-semibold text-slate-800">No categories found</p>
      <p className="mt-1 text-sm text-slate-500">
        {search
          ? "Nothing matches that search. Try a different word."
          : "Create your first category to start organising products."}
      </p>
      {!search && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Plus size={16} />
          Add category
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, tone, busy, onConfirm, onCancel }) {
  const tones = {
    danger: { icon: "bg-rose-50 text-rose-600", btn: "bg-rose-600 hover:bg-rose-700" },
    warning: { icon: "bg-amber-50 text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    success: { icon: "bg-emerald-50 text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
  }[tone || "danger"];

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex gap-4">
          <div className={`h-fit rounded-xl p-3 ${tones.icon}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${tones.btn}`}
          >
            {busy && <RefreshCw size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUploadField({
  title,
  description,
  name,
  preview,
  error,
  changed,
  onChange,
  onDropFile,
  onUndo,
  icon,
  aspect,
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 text-slate-700">
          <span className="rounded-lg bg-slate-100 p-2">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>

        {changed && (
          <button
            type="button"
            onClick={onUndo}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            <Undo2 size={13} />
            Undo
          </button>
        )}
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onDropFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex ${aspect} cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition ${
          dragging
            ? "border-teal-500 bg-teal-50"
            : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40"
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={`${title} preview`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55 opacity-0 transition group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                <Upload size={16} />
                Replace image
              </span>
            </div>
          </>
        ) : (
          <div className="px-4">
            <Upload size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">
              Drop an image or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5 MB</p>
          </div>
        )}

        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}