"use client";

import { useEffect, useState } from "react";

import {
    createParent,
    updateParentCategory,
    updateParentCategoryStatus,
    deleteParentCategory,
    getCategory,
} from "@/apiService/recipeParentCategory.js";

import {
    createSub,
    updateSubCategory,
    updateSubCategoryStatus,
    deleteSubCategory,
} from "@/apiService/recipeSubCategory.js";

const PAGE_SIZE = 20;

const EMPTY_PARENT = {
    name: "",
    slug: "",
    shortdes: "",
    point: [""],
    status: true,
};

const EMPTY_SUB = {
    categoryId: "",
    name: "",
    slug: "",
    shortdes: "",
    status: true,
    seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        facebookTitle: "",
        facebookDescription: "",
        facebookImage: "",
    },
};

const SEO_GROUPS = [
    {
        title: "Search engines",
        hint: "How this subcategory appears in Google results.",
        fields: [
            { name: "metaTitle", label: "Meta title", max: 60 },
            { name: "metaDescription", label: "Meta description", multiline: true, max: 160 },
            { name: "keywords", label: "Keywords", placeholder: "pasta, quick dinner, vegetarian" },
            { name: "canonicalUrl", label: "Canonical URL", placeholder: "https://" },
        ],
    },
    {
        title: "Open Graph",
        hint: "Used by most social platforms when a link is shared.",
        fields: [
            { name: "ogTitle", label: "Title" },
            { name: "ogDescription", label: "Description", multiline: true },
            { name: "ogImage", label: "Image URL", placeholder: "https://" },
        ],
    },
    {
        title: "Twitter",
        hint: "Card shown when the link is shared on Twitter / X.",
        fields: [
            { name: "twitterTitle", label: "Title" },
            { name: "twitterDescription", label: "Description", multiline: true },
            { name: "twitterImage", label: "Image URL", placeholder: "https://" },
        ],
    },
    {
        title: "Facebook",
        hint: "Card shown when the link is shared on Facebook.",
        fields: [
            { name: "facebookTitle", label: "Title" },
            { name: "facebookDescription", label: "Description", multiline: true },
            { name: "facebookImage", label: "Image URL", placeholder: "https://" },
        ],
    },
];

const SUB_TABS = [
    { id: "details", label: "Details" },
    { id: "seo", label: "SEO & social" },
];

const getId = (item) => item?._id || item?.id || "";

const getResponseData = (response) =>
    response?.data?.data ?? response?.data ?? response?.result ?? response;

const getSubcategories = (category) => {
    const list =
        category?.subCategories ??
        category?.subcategories ??
        category?.subCategory ??
        category?.subCategoryList ??
        [];

    return Array.isArray(list) ? list : [];
};

const toBoolean = (value) => value === true || value === "true";

const makeSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const normalizeSeo = (seo) => {
    let parsed = seo || {};

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            parsed = {};
        }
    }

    return {
        ...EMPTY_SUB.seo,
        ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
};

const normalizePoints = (point) => {
    if (Array.isArray(point)) return point.length ? point.map(String) : [""];
    if (typeof point === "string" && point.trim()) return [point];
    return [""];
};

const normalizeCategory = (category) => ({
    ...category,
    status: toBoolean(category?.status),
    subCategories: getSubcategories(category),
});

const errorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-400/20 disabled:cursor-not-allowed disabled:opacity-50";

const dangerButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 disabled:opacity-50";

const iconButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600";

const Icon = ({ path, className = "h-4 w-4" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {path}
    </svg>
);

const icons = {
    plus: <Icon path={<path d="M12 5v14M5 12h14" />} />,
    edit: <Icon path={<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />} />,
    trash: <Icon path={<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />} />,
    chevron: (open) => (
        <Icon
            className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
            path={<path d="m9 6 6 6-6 6" />}
        />
    ),
    refresh: <Icon path={<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" />} />,
    close: <Icon path={<path d="M6 6l12 12M18 6 6 18" />} />,
    folder: <Icon path={<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />} />,
};

function Switch({ checked, onChange, label, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            title={checked ? "Active – click to deactivate" : "Inactive – click to activate"}
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 disabled:opacity-50 ${checked ? "bg-emerald-600" : "bg-stone-300"
                }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0.5"
                    }`}
            />
        </button>
    );
}

function Modal({ title, description, onClose, width = "max-w-2xl", children, footer }) {
    useEffect(() => {
        const onKey = (event) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/50 p-4 backdrop-blur-[2px] sm:items-center"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div className={`my-4 flex max-h-[calc(100vh-2rem)] w-full ${width} flex-col rounded-2xl bg-white shadow-2xl`}>
                <header className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
                        {description && (
                            <p className="mt-0.5 text-sm text-stone-500">{description}</p>
                        )}
                    </div>
                    <button type="button" className={iconButton} onClick={onClose} aria-label="Close">
                        {icons.close}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {footer && (
                    <footer className="flex justify-end gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50 px-6 py-4">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}

function Field({ label, hint, counter, children }) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <label className="text-sm font-medium text-stone-700">{label}</label>
                {counter}
            </div>
            {children}
            {hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>}
        </div>
    );
}

function Counter({ value, max }) {
    const length = (value || "").length;
    const over = max && length > max;

    return (
        <span className={`text-xs tabular-nums ${over ? "text-red-600" : "text-stone-400"}`}>
            {length}
            {max ? ` / ${max}` : ""}
        </span>
    );
}

function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-stone-400"}`} />
            {active ? "Active" : "Inactive"}
        </span>
    );
}

function Toasts({ toasts, dismiss }) {
    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="status"
                    className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${toast.type === "error"
                        ? "border-red-200 bg-red-50 text-red-800"
                        : "border-emerald-200 bg-white text-stone-800"
                        }`}
                >
                    <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
                            }`}
                    />
                    <p className="flex-1">{toast.message}</p>
                    <button
                        type="button"
                        onClick={() => dismiss(toast.id)}
                        className="text-stone-400 hover:text-stone-700"
                        aria-label="Dismiss"
                    >
                        {icons.close}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function RecipeCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingParent, setSavingParent] = useState(false);
    const [savingSub, setSavingSub] = useState(false);
    const [busyId, setBusyId] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [parentModal, setParentModal] = useState(false);
    const [parentEditId, setParentEditId] = useState("");
    const [parentForm, setParentForm] = useState(EMPTY_PARENT);

    const [subModal, setSubModal] = useState(false);
    const [subEditId, setSubEditId] = useState("");
    const [subForm, setSubForm] = useState(EMPTY_SUB);
    const [subTab, setSubTab] = useState("details");

    const [expandedCategories, setExpandedCategories] = useState({});
    const [confirm, setConfirm] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [toasts, setToasts] = useState([]);

    const dismissToast = (id) => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
    };

    const notify = (message, type = "success") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((previous) => [...previous, { id, message, type }]);
        setTimeout(() => dismissToast(id), 4000);
    };

    const loadCategories = async () => {
        setLoading(true);

        try {
            const response = await getCategory(page, PAGE_SIZE);
            const result = getResponseData(response);

            const list = Array.isArray(result)
                ? result
                : result?.categories ??
                result?.category ??
                result?.data ??
                result?.results ??
                [];

            const safeList = Array.isArray(list) ? list : [];
            const count = Number(result?.total ?? result?.count ?? safeList.length ?? 0);

            setCategories(safeList.map(normalizeCategory));
            setTotal(count);
            setTotalPages(
                Math.max(1, Number(result?.totalPages ?? Math.ceil(count / PAGE_SIZE)))
            );
        } catch (error) {
            console.error("Failed to load recipe categories:", error);
            notify(errorMessage(error, "Failed to load categories"), "error");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [page]);

    const totalSubs = categories.reduce((n, c) => n + getSubcategories(c).length, 0);
    const activeParents = categories.filter((c) => toBoolean(c.status)).length;
    const activeSubs = categories.reduce(
        (n, c) => n + getSubcategories(c).filter((s) => toBoolean(s.status)).length,
        0
    );

    const allExpanded =
        categories.length > 0 &&
        categories.every((category) => expandedCategories[getId(category)]);

    const statCards = [
        { label: "Parent categories", value: total, note: `${activeParents} active on this page` },
        { label: "Subcategories", value: totalSubs, note: `${activeSubs} active` },
        {
            label: "Needs attention",
            value: categories.length - activeParents + (totalSubs - activeSubs),
            note: "Inactive categories and subcategories",
        },
    ];

    const toggleExpanded = (categoryId) =>
        setExpandedCategories((previous) => ({
            ...previous,
            [categoryId]: !previous[categoryId],
        }));

    const toggleAll = () => {
        const next = {};

        if (!allExpanded) {
            categories.forEach((category) => {
                next[getId(category)] = true;
            });
        }

        setExpandedCategories(next);
    };

    const updateParentField = (field, value) =>
        setParentForm((previous) => ({
            ...previous,
            [field]: value,
            ...(field === "name" && !parentEditId ? { slug: makeSlug(value) } : {}),
        }));

    const updatePoint = (index, value) =>
        setParentForm((previous) => ({
            ...previous,
            point: previous.point.map((item, i) => (i === index ? value : item)),
        }));

    const addPoint = () =>
        setParentForm((previous) => ({ ...previous, point: [...previous.point, ""] }));

    const removePoint = (index) =>
        setParentForm((previous) => ({
            ...previous,
            point:
                previous.point.length > 1
                    ? previous.point.filter((_, i) => i !== index)
                    : [""],
        }));

    const openCreateParent = () => {
        setParentEditId("");
        setParentForm({ ...EMPTY_PARENT, point: [""] });
        setParentModal(true);
    };

    const openEditParent = (category) => {
        setParentEditId(getId(category));
        setParentForm({
            name: category?.name || "",
            slug: category?.slug || "",
            shortdes: category?.shortdes || "",
            point: normalizePoints(category?.point),
            status: toBoolean(category?.status),
        });
        setParentModal(true);
    };

    const closeParentModal = () => {
        setParentModal(false);
        setParentEditId("");
        setParentForm({ ...EMPTY_PARENT, point: [""] });
    };

    const saveParent = async (event) => {
        event.preventDefault();

        if (!parentForm.name.trim()) return notify("Enter the category name", "error");
        if (!parentForm.slug.trim()) return notify("Enter the slug", "error");

        const payload = {
            name: parentForm.name.trim(),
            slug: parentForm.slug.trim(),
            shortdes: parentForm.shortdes.trim(),
            point: parentForm.point.map((item) => item.trim()).filter(Boolean),
            status: Boolean(parentForm.status),
        };

        setSavingParent(true);

        try {
            if (parentEditId) {
                await updateParentCategory(parentEditId, payload);
            } else {
                await createParent(payload);
            }

            const wasEditing = Boolean(parentEditId);
            closeParentModal();
            await loadCategories();
            notify(wasEditing ? "Category updated" : "Category created");
        } catch (error) {
            console.error("Save parent category failed:", error);
            notify(errorMessage(error, "Failed to save category"), "error");
        } finally {
            setSavingParent(false);
        }
    };

    const toggleParentStatus = async (category) => {
        const id = getId(category);
        if (!id) return notify("Category ID is missing", "error");

        setBusyId(id);

        try {
            await updateParentCategoryStatus(id, { status: !toBoolean(category.status) });
            await loadCategories();
        } catch (error) {
            console.error("Update parent status failed:", error);
            notify(errorMessage(error, "Failed to update status"), "error");
        } finally {
            setBusyId("");
        }
    };

    const removeParent = (category) => {
        const id = getId(category);
        if (!id) return notify("Category ID is missing", "error");

        const subCount = getSubcategories(category).length;

        setConfirm({
            title: `Delete "${category.name}"?`,
            message:
                subCount > 0
                    ? `This category has ${subCount} subcategor${subCount === 1 ? "y" : "ies"} that may also be removed. This can't be undone.`
                    : "This can't be undone.",
            action: async () => {
                await deleteParentCategory(id);

                if (categories.length === 1 && page > 1) {
                    setPage((previous) => previous - 1);
                } else {
                    await loadCategories();
                }

                notify("Category deleted");
            },
        });
    };

    const updateSubField = (field, value) =>
        setSubForm((previous) => ({
            ...previous,
            [field]: value,
            ...(field === "name" && !subEditId ? { slug: makeSlug(value) } : {}),
        }));

    const updateSeoField = (field, value) =>
        setSubForm((previous) => ({
            ...previous,
            seo: { ...previous.seo, [field]: value },
        }));

    const openCreateSub = (category) => {
        const categoryId = getId(category);
        if (!categoryId) return notify("Category ID is missing", "error");

        setSubEditId("");
        setSubForm({ ...EMPTY_SUB, categoryId, seo: { ...EMPTY_SUB.seo } });
        setSubTab("details");
        setSubModal(true);
        setExpandedCategories((previous) => ({ ...previous, [categoryId]: true }));
    };

    const openEditSub = (category, sub) => {
        const subId = getId(sub);
        if (!subId) return notify("Subcategory ID is missing", "error");

        setSubEditId(subId);
        setSubForm({
            categoryId: sub?.categoryId
                ? typeof sub.categoryId === "object"
                    ? getId(sub.categoryId)
                    : sub.categoryId
                : getId(category),
            name: sub?.name || "",
            slug: sub?.slug || "",
            shortdes: sub?.shortdes || "",
            status: toBoolean(sub?.status),
            seo: normalizeSeo(sub?.seo),
        });
        setSubTab("details");
        setSubModal(true);
    };

    const closeSubModal = () => {
        setSubModal(false);
        setSubEditId("");
        setSubForm({ ...EMPTY_SUB, seo: { ...EMPTY_SUB.seo } });
        setSubTab("details");
    };

    const saveSub = async (event) => {
        event.preventDefault();

        if (!subForm.categoryId) return notify("Select a parent category", "error");

        if (!subForm.name.trim()) {
            setSubTab("details");
            return notify("Enter the subcategory name", "error");
        }

        if (!subForm.slug.trim()) {
            setSubTab("details");
            return notify("Enter the subcategory slug", "error");
        }

        const payload = {
            categoryId: subForm.categoryId,
            name: subForm.name.trim(),
            slug: subForm.slug.trim(),
            shortdes: subForm.shortdes.trim(),
            status: Boolean(subForm.status),
            seo: { ...subForm.seo },
        };

        setSavingSub(true);

        try {
            if (subEditId) {
                await updateSubCategory(subEditId, payload);
            } else {
                await createSub(payload);
            }

            const wasEditing = Boolean(subEditId);
            closeSubModal();
            await loadCategories();
            notify(wasEditing ? "Subcategory updated" : "Subcategory created");
        } catch (error) {
            console.error("Save subcategory failed:", error);
            notify(errorMessage(error, "Failed to save subcategory"), "error");
        } finally {
            setSavingSub(false);
        }
    };

    const toggleSubStatus = async (sub) => {
        const id = getId(sub);
        if (!id) return notify("Subcategory ID is missing", "error");

        setBusyId(id);

        try {
            await updateSubCategoryStatus(id, { status: !toBoolean(sub.status) });
            await loadCategories();
        } catch (error) {
            console.error("Update subcategory status failed:", error);
            notify(errorMessage(error, "Failed to update status"), "error");
        } finally {
            setBusyId("");
        }
    };

    const removeSub = (sub) => {
        const id = getId(sub);
        if (!id) return notify("Subcategory ID is missing", "error");

        setConfirm({
            title: `Delete "${sub.name}"?`,
            message: "This subcategory will be removed permanently.",
            action: async () => {
                await deleteSubCategory(id);
                await loadCategories();
                notify("Subcategory deleted");
            },
        });
    };

    const closeConfirm = () => setConfirm(null);

    const runConfirm = async () => {
        if (!confirm) return;
        setConfirming(true);

        try {
            await confirm.action();
            setConfirm(null);
        } catch (error) {
            console.error("Delete failed:", error);
            notify(errorMessage(error, "Something went wrong"), "error");
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-100/70">
            <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                            Recipe categories
                        </h1>
                        <p className="text-sm text-stone-500">
                            Organise categories, subcategories and their SEO in one place.
                        </p>
                    </div>

                    <button type="button" className={primaryButton} onClick={openCreateParent}>
                        {icons.plus}
                        Add category
                    </button>
                </div>
            </div>

            <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border border-stone-200 bg-white px-5 py-4"
                        >
                            <p className="text-sm text-stone-500">{card.label}</p>
                            <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
                                {loading ? "–" : card.value}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">{card.note}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                        type="button"
                        className={secondaryButton}
                        onClick={toggleAll}
                        disabled={loading || categories.length === 0}
                    >
                        {allExpanded ? "Collapse all" : "Expand all"}
                    </button>

                    <button
                        type="button"
                        className={secondaryButton}
                        onClick={loadCategories}
                        disabled={loading}
                    >
                        <span className={loading ? "animate-spin" : ""}>{icons.refresh}</span>
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3" aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="animate-pulse rounded-xl border border-stone-200 bg-white p-5">
                                <div className="h-4 w-48 rounded bg-stone-200" />
                                <div className="mt-3 h-3 w-72 max-w-full rounded bg-stone-100" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                            {icons.folder}
                        </span>
                        <p className="mt-3 font-semibold text-stone-800">No categories found</p>
                        <p className="mt-1 text-sm text-stone-500">
                            Add your first category to start organising recipes.
                        </p>
                        <button type="button" className={`${primaryButton} mt-4`} onClick={openCreateParent}>
                            {icons.plus}
                            Add category
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map((category) => {
                            const categoryId = getId(category);
                            const subcategories = getSubcategories(category);
                            const isActive = toBoolean(category.status);
                            const isExpanded = Boolean(expandedCategories[categoryId]);
                            const points = normalizePoints(category.point).filter(Boolean);

                            return (
                                <section
                                    key={categoryId || category.slug || category.name}
                                    className="overflow-hidden rounded-xl border border-stone-200 bg-white"
                                >
                                    <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleExpanded(categoryId)}
                                            aria-expanded={isExpanded}
                                            className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none"
                                        >
                                            <span className="mt-1 text-stone-400">{icons.chevron(isExpanded)}</span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <span className="break-words text-base font-semibold text-stone-900">
                                                        {category.name}
                                                    </span>
                                                    <StatusBadge active={isActive} />
                                                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                                                        {subcategories.length}{" "}
                                                        {subcategories.length === 1 ? "subcategory" : "subcategories"}
                                                    </span>
                                                </span>

                                                <span className="mt-1 block break-all font-mono text-xs text-stone-400">
                                                    /{category.slug || "-"}
                                                </span>

                                                {category.shortdes && (
                                                    <span className="mt-2 block line-clamp-2 text-sm text-stone-600">
                                                        {category.shortdes}
                                                    </span>
                                                )}

                                                {points.length > 0 && (
                                                    <span className="mt-2 flex flex-wrap gap-1.5">
                                                        {points.slice(0, 4).map((point, i) => (
                                                            <span
                                                                key={i}
                                                                className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
                                                            >
                                                                {point}
                                                            </span>
                                                        ))}
                                                        {points.length > 4 && (
                                                            <span className="px-1 py-0.5 text-xs text-stone-400">
                                                                +{points.length - 4} more
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-1 pl-8 lg:pl-0">
                                            <Switch
                                                checked={isActive}
                                                onChange={() => toggleParentStatus(category)}
                                                disabled={busyId === categoryId}
                                                label={`Toggle ${category.name}`}
                                            />
                                            <span className="mx-2 h-5 w-px bg-stone-200" />
                                            <button
                                                type="button"
                                                className={secondaryButton}
                                                onClick={() => openCreateSub(category)}
                                            >
                                                {icons.plus}
                                                Subcategory
                                            </button>
                                            <button
                                                type="button"
                                                className={iconButton}
                                                onClick={() => openEditParent(category)}
                                                aria-label={`Edit ${category.name}`}
                                                title="Edit"
                                            >
                                                {icons.edit}
                                            </button>
                                            <button
                                                type="button"
                                                className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                                                onClick={() => removeParent(category)}
                                                aria-label={`Delete ${category.name}`}
                                                title="Delete"
                                            >
                                                {icons.trash}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-stone-200 bg-stone-50/60">
                                            {subcategories.length === 0 ? (
                                                <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                                                    <p className="text-sm text-stone-500">
                                                        No subcategories in {category.name} yet.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className={primaryButton}
                                                        onClick={() => openCreateSub(category)}
                                                    >
                                                        {icons.plus}
                                                        Add subcategory
                                                    </button>
                                                </div>
                                            ) : (
                                                <ul className="divide-y divide-stone-200">
                                                    {subcategories.map((sub) => {
                                                        const subId = getId(sub);
                                                        const subActive = toBoolean(sub.status);
                                                        const metaTitle = normalizeSeo(sub.seo).metaTitle;

                                                        return (
                                                            <li
                                                                key={subId || sub.slug || sub.name}
                                                                className="flex flex-col gap-3 px-4 py-3.5 pl-12 sm:flex-row sm:items-center sm:px-5 sm:pl-12"
                                                            >
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <h3 className="break-words text-sm font-semibold text-stone-900">
                                                                            {sub.name}
                                                                        </h3>
                                                                        <StatusBadge active={subActive} />
                                                                    </div>

                                                                    <p className="mt-0.5 break-all font-mono text-xs text-stone-400">
                                                                        /{category.slug}/{sub.slug || "-"}
                                                                    </p>

                                                                    <p className="mt-1.5 line-clamp-2 text-sm text-stone-600">
                                                                        {sub.shortdes || (
                                                                            <span className="text-stone-400">No short description</span>
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 text-xs">
                                                                        {metaTitle ? (
                                                                            <span className="text-stone-500">SEO: {metaTitle}</span>
                                                                        ) : (
                                                                            <span className="text-amber-600">SEO meta title missing</span>
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div className="flex shrink-0 items-center gap-1">
                                                                    <Switch
                                                                        checked={subActive}
                                                                        onChange={() => toggleSubStatus(sub)}
                                                                        disabled={busyId === subId}
                                                                        label={`Toggle ${sub.name}`}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className={iconButton}
                                                                        onClick={() => openEditSub(category, sub)}
                                                                        aria-label={`Edit ${sub.name}`}
                                                                        title="Edit"
                                                                    >
                                                                        {icons.edit}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                                                                        onClick={() => removeSub(sub)}
                                                                        aria-label={`Delete ${sub.name}`}
                                                                        title="Delete"
                                                                    >
                                                                        {icons.trash}
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
                        <p className="text-sm text-stone-500">
                            Page {page} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={secondaryButton}
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className={secondaryButton}
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {parentModal && (
                <Modal
                    title={parentEditId ? "Edit category" : "New category"}
                    description="Top-level group that subcategories live under."
                    onClose={closeParentModal}
                    footer={
                        <>
                            <button
                                type="button"
                                className={secondaryButton}
                                onClick={closeParentModal}
                                disabled={savingParent}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="parent-form"
                                className={primaryButton}
                                disabled={savingParent}
                            >
                                {savingParent ? "Saving…" : parentEditId ? "Save changes" : "Create category"}
                            </button>
                        </>
                    }
                >
                    <form id="parent-form" onSubmit={saveParent} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Name *">
                                <input
                                    className={inputClass}
                                    value={parentForm.name}
                                    onChange={(event) => updateParentField("name", event.target.value)}
                                    placeholder="e.g. Breakfast"
                                    autoFocus
                                    required
                                />
                            </Field>

                            <Field
                                label="Slug *"
                                hint={!parentEditId ? "Generated from the name. You can edit it." : undefined}
                            >
                                <input
                                    className={`${inputClass} font-mono`}
                                    value={parentForm.slug}
                                    onChange={(event) => updateParentField("slug", event.target.value)}
                                    placeholder="breakfast"
                                    required
                                />
                            </Field>
                        </div>

                        <Field label="Short description">
                            <textarea
                                className={inputClass}
                                rows={3}
                                value={parentForm.shortdes}
                                onChange={(event) => updateParentField("shortdes", event.target.value)}
                                placeholder="A line or two shown on the category page"
                            />
                        </Field>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className={`${labelClass} !mb-0`}>Key points</label>
                                <button
                                    type="button"
                                    onClick={addPoint}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                                >
                                    {icons.plus}
                                    Add point
                                </button>
                            </div>

                            <div className="space-y-2">
                                {parentForm.point.map((point, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className={inputClass}
                                            value={point}
                                            onChange={(event) => updatePoint(index, event.target.value)}
                                            placeholder={`Point ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePoint(index)}
                                            className={`${iconButton} h-10 w-10 shrink-0 hover:!bg-red-50 hover:!text-red-600`}
                                            aria-label={`Remove point ${index + 1}`}
                                            title="Remove point"
                                        >
                                            {icons.close}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-2 text-xs text-stone-500">
                                Each point is saved separately. Empty points are skipped.
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-stone-800">Active</p>
                                <p className="text-xs text-stone-500">Inactive categories are hidden from visitors.</p>
                            </div>
                            <Switch
                                checked={Boolean(parentForm.status)}
                                onChange={() => updateParentField("status", !parentForm.status)}
                                label="Active category"
                            />
                        </div>
                    </form>
                </Modal>
            )}

            {subModal && (
                <Modal
                    title={subEditId ? "Edit subcategory" : "New subcategory"}
                    description="Details, SEO and social sharing metadata."
                    width="max-w-3xl"
                    onClose={closeSubModal}
                    footer={
                        <>
                            <button
                                type="button"
                                className={secondaryButton}
                                onClick={closeSubModal}
                                disabled={savingSub}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="sub-form"
                                className={primaryButton}
                                disabled={savingSub}
                            >
                                {savingSub ? "Saving…" : subEditId ? "Save changes" : "Create subcategory"}
                            </button>
                        </>
                    }
                >
                    <div className="-mt-1 mb-5 flex gap-1 border-b border-stone-200" role="tablist">
                        {SUB_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={subTab === tab.id}
                                onClick={() => setSubTab(tab.id)}
                                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${subTab === tab.id
                                    ? "border-emerald-700 text-emerald-800"
                                    : "border-transparent text-stone-500 hover:text-stone-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form id="sub-form" onSubmit={saveSub}>
                        {subTab === "details" && (
                            <div className="space-y-5">
                                <Field label="Parent category *">
                                    <select
                                        className={inputClass}
                                        value={subForm.categoryId}
                                        onChange={(event) => updateSubField("categoryId", event.target.value)}
                                        required
                                    >
                                        <option value="">Select parent category</option>
                                        {categories.map((category) => (
                                            <option key={getId(category)} value={getId(category)}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="Name *">
                                        <input
                                            className={inputClass}
                                            value={subForm.name}
                                            onChange={(event) => updateSubField("name", event.target.value)}
                                            placeholder="e.g. Pancakes"
                                            required
                                        />
                                    </Field>

                                    <Field
                                        label="Slug *"
                                        hint={!subEditId ? "Generated from the name. You can edit it." : undefined}
                                    >
                                        <input
                                            className={`${inputClass} font-mono`}
                                            value={subForm.slug}
                                            onChange={(event) => updateSubField("slug", event.target.value)}
                                            placeholder="pancakes"
                                            required
                                        />
                                    </Field>
                                </div>

                                <Field label="Short description">
                                    <textarea
                                        className={inputClass}
                                        rows={3}
                                        value={subForm.shortdes}
                                        onChange={(event) => updateSubField("shortdes", event.target.value)}
                                        placeholder="A line or two shown on the subcategory page"
                                    />
                                </Field>

                                <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-stone-800">Active</p>
                                        <p className="text-xs text-stone-500">
                                            Inactive subcategories are hidden from visitors.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={Boolean(subForm.status)}
                                        onChange={() => updateSubField("status", !subForm.status)}
                                        label="Active subcategory"
                                    />
                                </div>
                            </div>
                        )}

                        {subTab === "seo" && (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                                    <p className="mb-2 text-xs text-stone-500">Search result preview</p>
                                    <p className="truncate text-xs text-stone-500">
                                        {subForm.seo.canonicalUrl || `/${subForm.slug || "subcategory-slug"}`}
                                    </p>
                                    <p className="mt-0.5 truncate text-lg text-blue-700">
                                        {subForm.seo.metaTitle || subForm.name || "Meta title"}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">
                                        {subForm.seo.metaDescription ||
                                            subForm.shortdes ||
                                            "Meta description will appear here."}
                                    </p>
                                </div>

                                {SEO_GROUPS.map((group) => (
                                    <fieldset key={group.title} className="space-y-4">
                                        <legend className="mb-3">
                                            <span className="block text-sm font-semibold text-stone-900">
                                                {group.title}
                                            </span>
                                            <span className="block text-xs text-stone-500">{group.hint}</span>
                                        </legend>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {group.fields.map((field) => (
                                                <div key={field.name} className={field.multiline ? "md:col-span-2" : ""}>
                                                    <Field
                                                        label={field.label}
                                                        counter={
                                                            field.max ? (
                                                                <Counter value={subForm.seo[field.name]} max={field.max} />
                                                            ) : null
                                                        }
                                                    >
                                                        {field.multiline ? (
                                                            <textarea
                                                                className={inputClass}
                                                                rows={3}
                                                                value={subForm.seo[field.name] || ""}
                                                                onChange={(event) =>
                                                                    updateSeoField(field.name, event.target.value)
                                                                }
                                                                placeholder={field.placeholder}
                                                            />
                                                        ) : (
                                                            <input
                                                                className={inputClass}
                                                                value={subForm.seo[field.name] || ""}
                                                                onChange={(event) =>
                                                                    updateSeoField(field.name, event.target.value)
                                                                }
                                                                placeholder={field.placeholder}
                                                            />
                                                        )}
                                                    </Field>
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>
                        )}
                    </form>
                </Modal>
            )}

            {confirm && (
                <Modal
                    title={confirm.title}
                    width="max-w-md"
                    onClose={confirming ? () => { } : closeConfirm}
                    footer={
                        <>
                            <button
                                type="button"
                                className={secondaryButton}
                                onClick={closeConfirm}
                                disabled={confirming}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={dangerButton}
                                onClick={runConfirm}
                                disabled={confirming}
                            >
                                {confirming ? "Deleting…" : "Delete"}
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-stone-600">{confirm.message}</p>
                </Modal>
            )}

            <Toasts toasts={toasts} dismiss={dismissToast} />
        </div>
    );
}