"use client";

import { useEffect, useRef, useState } from "react";
import {
  getProduct,
  deleteProduct,
  searchProduct,
  updateProductStatus,
} from "@/apiService/productApi.js";
import {Search, Plus, RefreshCw, Pencil, Trash2, Package, ChevronLeft, ChevronRight, Image as ImageIcon,
  Eye, X, CheckCircle2, XCircle, AlertTriangle, Layers
} from "lucide-react";

import ProductFormModal from "@/app/components/Product/ProductFormModel.jsx"
import ProductViewModal from "@/app/components/Product/ProductViewModal";

const getProductId = (product) => product?._id || product?.id;

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

function getPageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("...");
    out.push(n);
  });
  return out;
}

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState("");

  const [statusId, setStatusId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const toastId = useRef(0);

  const notify = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = search.trim()
        ? await searchProduct(search.trim(), page, limit)
        : await getProduct(page, limit);

      const data = response?.data ?? response;

      if (data?.success === false) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const list = Array.isArray(data?.product)
        ? data.product
        : Array.isArray(data?.products)
          ? data.products
          : [];

      const pagination = data?.pagination || {};

      setProducts(list);
      setTotal(Number(pagination.total ?? data?.total) || 0);
      setTotalPages(
        Math.max(Number(pagination.totalPages ?? data?.totalPages) || 1, 1)
      );
    } catch (err) {
      setLoadError(err.message || "Unable to load products");
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setViewProduct(null);
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSaved = async (message) => {
    setFormOpen(false);
    setEditingProduct(null);
    await fetchProducts();
    notify(message);
  };

  const handleStatusChange = async (product) => {
    const id = getProductId(product);
    if (!id) return notify("Product ID is missing", "error");

    setStatusId(id);
    try {
      const response = await updateProductStatus(id, { status: !product.status });
      const data = response?.data ?? response;
      if (data?.success === false) {
        throw new Error(data.message || "Failed to update product status");
      }
      await fetchProducts();
      notify(product.status ? "Product deactivated." : "Product activated.");
    } catch (err) {
      notify(errorMessage(err, "Failed to update product status"), "error");
    } finally {
      setStatusId(null);
    }
  };

  const handleDelete = (product) => {
    const id = getProductId(product);
    if (!id) return notify("Product ID is missing", "error");

    setConfirmState({
      title: "Delete product?",
      message: `"${product.name}" will be permanently removed. This can't be undone.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        const response = await deleteProduct(id);
        const data = response?.data ?? response;
        if (data?.success === false) {
          throw new Error(data.message || "Failed to delete product");
        }
        if (products.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          await fetchProducts();
        }
        notify(data?.message || "Product deleted.");
      },
    });
  };

  const runConfirm = async () => {
    const action = confirmState?.onConfirm;
    if (!action) return;
    try {
      setConfirmState((prev) => ({ ...prev, busy: true }));
      await action();
    } catch (err) {
      notify(errorMessage(err, "Something went wrong."), "error");
    } finally {
      setConfirmState(null);
    }
  };

  const activeCount = products.filter((p) => p.status === true).length;
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <Package size={15} />
                <span>Admin</span>
                <ChevronRight size={14} />
                <span>E-commerce</span>
                <ChevronRight size={14} />
                <span className="text-slate-200">Products</span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Products
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-slate-300">
                Manage your Grainly catalogue: flavours, variants, serving
                notes and what's live in the store.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchProducts}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <Plus size={18} />
                Add product
              </button>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={fetchProducts}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total products"
            value={total}
            subtitle="In the catalogue"
            icon={<Package size={22} />}
            color="blue"
            percent={100}
          />
          <StatCard
            title="Active on this page"
            value={activeCount}
            subtitle={`${products.length - activeCount} inactive`}
            icon={<CheckCircle2 size={22} />}
            color="green"
            percent={products.length ? (activeCount / products.length) * 100 : 0}
          />
          <StatCard
            title="Current page"
            value={`${page} / ${totalPages}`}
            subtitle={`${products.length} products loaded`}
            icon={<Layers size={22} />}
            color="violet"
            percent={(page / totalPages) * 100}
          />
        </section>

        {/* List */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">All products</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Showing {products.length} of {total}
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Flavour</th>
                  <th className="px-5 py-3.5">Variants</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, c) => (
                        <td key={c} className="px-5 py-5">
                          <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState search={search} onAdd={openCreate} />
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const id = getProductId(product);
                    const variants = product.variants || [];

                    return (
                      <tr key={id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Thumb
                              src={product.featureImage || product.image}
                              alt={product.name}
                              size="h-14 w-14"
                            />
                            <div className="max-w-[260px]">
                              <p className="truncate font-semibold text-slate-900">
                                {product.name || "Unnamed product"}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                {product.shortDes || product.description || "No description"}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-800">
                            {product.flavour?.name || "—"}
                          </p>
                          {product.flavour?.des && (
                            <p className="mt-0.5 line-clamp-1 max-w-[180px] text-xs text-slate-500">
                              {product.flavour.des}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-[200px] flex-wrap gap-1.5">
                            {variants.slice(0, 3).map((variant, i) => (
                              <span
                                key={`${variant.name}-${i}`}
                                className="rounded-lg bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700"
                              >
                                {variant.name}
                              </span>
                            ))}
                            {variants.length > 3 && (
                              <span className="self-center text-xs text-slate-500">
                                +{variants.length - 3}
                              </span>
                            )}
                            {!variants.length && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusSwitch
                            checked={Boolean(product.status)}
                            busy={statusId === id}
                            onClick={() => handleStatusChange(product)}
                          />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(product.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <IconButton title="View product" tone="slate" onClick={() => setViewProduct(product)}>
                              <Eye size={16} />
                            </IconButton>
                            <IconButton title="Edit product" tone="blue" onClick={() => openEdit(product)}>
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton title="Delete product" tone="red" onClick={() => handleDelete(product)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))
            ) : products.length === 0 ? (
              <EmptyState search={search} onAdd={openCreate} />
            ) : (
              products.map((product) => {
                const id = getProductId(product);
                return (
                  <article key={id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <Thumb src={product.featureImage || product.image} alt={product.name} size="h-16 w-16" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{product.name || "Unnamed product"}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {product.shortDes || product.description || "No description"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <StatusSwitch
                        checked={Boolean(product.status)}
                        busy={statusId === id}
                        onClick={() => handleStatusChange(product)}
                      />
                      <div className="flex gap-2">
                        <IconButton title="View product" tone="slate" onClick={() => setViewProduct(product)}>
                          <Eye size={16} />
                        </IconButton>
                        <IconButton title="Edit product" tone="blue" onClick={() => openEdit(product)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton title="Delete product" tone="red" onClick={() => handleDelete(product)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-800">{page}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalPages}</span>
              <span className="mx-2 text-slate-300">|</span>
              {total} total products
            </p>

            <div className="flex items-center gap-1.5">
              <PageButton label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </PageButton>

              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-slate-400">...</span>
                ) : (
                  <PageButton key={n} label={`Page ${n}`} active={n === page} disabled={loading} onClick={() => setPage(n)}>
                    {n}
                  </PageButton>
                )
              )}

              <PageButton label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} />
              </PageButton>
            </div>
          </div>
        </section>
      </div>

      {formOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setFormOpen(false);
            setEditingProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {viewProduct && (
        <ProductViewModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={() => openEdit(viewProduct)}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          {...confirmState}
          onCancel={() => !confirmState.busy && setConfirmState(null)}
          onConfirm={runConfirm}
        />
      )}

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, percent }) {
  const styles = {
    blue: { icon: "bg-sky-50 text-sky-600", bar: "bg-sky-500" },
    green: { icon: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-500" },
    violet: { icon: "bg-violet-50 text-violet-600", bar: "bg-violet-500" },
  }[color];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
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

function Thumb({ src, alt, size }) {
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100`}>
      {src ? (
        <img src={src} alt={alt || "Product"} className="h-full w-full object-cover" />
      ) : (
        <ImageIcon size={22} className="text-slate-400" />
      )}
    </div>
  );
}

function StatusSwitch({ checked, onClick, busy, hideLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={busy}
      onClick={onClick}
      className="inline-flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-60"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span
          className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        >
          {busy && <RefreshCw size={11} className="animate-spin text-slate-500" />}
        </span>
      </span>
      {!hideLabel && (
        <span className={`text-xs font-semibold ${checked ? "text-emerald-700" : "text-slate-500"}`}>
          {checked ? "Active" : "Inactive"}
        </span>
      )}
    </button>
  );
}

function IconButton({ children, title, tone, onClick }) {
  const tones = {
    slate: "hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800",
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
        active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
        <Package size={30} />
      </div>
      <p className="font-semibold text-slate-800">No products found</p>
      <p className="mt-1 text-sm text-slate-500">
        {search
          ? "Nothing matches that search. Try a different word."
          : "Add your first product to start building the catalogue."}
      </p>
      {!search && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <Plus size={16} />
          Add product
        </button>
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex gap-4">
          <div className="h-fit rounded-xl bg-rose-50 p-3 text-rose-600">
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
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <RefreshCw size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toasts({ toasts, onDismiss }) {
  return (
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
          <button type="button" aria-label="Dismiss" onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}