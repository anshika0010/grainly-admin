"use client";

import { useEffect, useState } from "react";

import {
    createRecipe,
    updateRecipeRecipe,
    updateRecipeRecipeStatus,
    deleteRecipeRecipe,
    getRecipe,
} from "@/apiService/recipe.js";

import { getCategory } from "@/apiService/recipeSubCategory.js";

import {
    Plus,
    Pencil,
    Trash2,
    X,
    ChefHat,
    Image as ImageIcon,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    ListChecks,
    Utensils,
    UploadCloud,
} from "lucide-react";

const LIMIT = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const initialForm = {
    name: "",
    slug: "",
    categoryId: "",
    ingredient: [""],
    makingstep: [""],
    status: true,
    seo: {
        title: "",
        description: "",
        keywords: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
    },
};

const FORM_TABS = [
    { id: "basics", label: "Basics" },
    { id: "method", label: "Ingredients & steps" },
    { id: "seo", label: "SEO" },
];

const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-stone-100";

const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-400/20 disabled:cursor-not-allowed disabled:opacity-50";

const dangerButton =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 disabled:opacity-50";

const iconButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600";

const getResponseData = (response) => response?.data ?? response;

const getCategoryList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data?.category)) return data.category;
    if (Array.isArray(data?.data?.category)) return data.data.category;

    return [];
};

const getRecipeId = (recipe) => recipe?._id || "";

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

const makeSlug = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
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
                        <X size={18} />
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

    return (
        <span className={`text-xs tabular-nums ${length > max ? "text-red-600" : "text-stone-400"}`}>
            {length} / {max}
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
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

function ListEditor({
    icon,
    title,
    hint,
    addLabel,
    items,
    multiline,
    placeholder,
    onChange,
    onAdd,
    onRemove,
}) {
    return (
        <section>
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        {icon}
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
                        <p className="text-xs text-stone-500">{hint}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                    <Plus size={15} />
                    {addLabel}
                </button>
            </div>

            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                            {index + 1}
                        </span>

                        {multiline ? (
                            <textarea
                                rows={2}
                                value={item}
                                onChange={(event) => onChange(index, event.target.value)}
                                placeholder={`${placeholder} ${index + 1}`}
                                className={`${inputClass} resize-y`}
                            />
                        ) : (
                            <input
                                value={item}
                                onChange={(event) => onChange(index, event.target.value)}
                                placeholder={`${placeholder} ${index + 1}`}
                                className={inputClass}
                            />
                        )}

                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className={`${iconButton} mt-1 shrink-0 hover:!bg-red-50 hover:!text-red-600`}
                            aria-label={`Remove ${placeholder.toLowerCase()} ${index + 1}`}
                            title="Remove"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function Recipe() {
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState("");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [formTab, setFormTab] = useState("basics");
    const [formError, setFormError] = useState("");

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loadError, setLoadError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toasts, setToasts] = useState([]);

    const dismissToast = (id) => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id));
    };

    const notify = (message, type = "success") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((previous) => [...previous, { id, message, type }]);
        setTimeout(() => dismissToast(id), 4000);
    };

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setLoadError("");

            const response = await getRecipe(page, LIMIT);
            const data = getResponseData(response);

            if (data?.success === false) {
                throw new Error(data.message || "Failed to fetch recipes.");
            }

            setRecipes(Array.isArray(data?.recipes) ? data.recipes : []);
            setTotal(Number(data?.total ?? data?.count ?? 0));
            setTotalPages(Math.max(1, Number(data?.totalPages || 1)));
        } catch (error) {
            console.error("Error fetching recipes:", error);
            setLoadError(getErrorMessage(error, "Unable to load recipes."));
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);

            const response = await getCategory();
            const data = response?.data ?? response;

            if (data?.success === false) {
                throw new Error(data.message || "Failed to fetch categories.");
            }

            setCategories(
                getCategoryList(response).filter(
                    (category) => category?._id && category?.status !== false
                )
            );
        } catch (error) {
            console.error("Error fetching recipe categories:", error);
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, [page]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const activeCount = recipes.filter((recipe) => recipe.status).length;

    const statCards = [
        { label: "Total recipes", value: total, note: "In your collection" },
        { label: "Active", value: activeCount, note: "On this page" },
        { label: "Inactive", value: recipes.length - activeCount, note: "On this page" },
    ];

    const getRecipeCategoryName = (recipe) => {
        if (recipe.categoryId && typeof recipe.categoryId === "object") {
            return recipe.categoryId.name || "Uncategorized";
        }

        const match = categories.find(
            (category) => String(category._id) === String(recipe.categoryId || "")
        );

        return match?.name || "Uncategorized";
    };

    const updateField = (field, value) =>
        setForm((previous) => ({
            ...previous,
            [field]: value,
            ...(field === "name" && !editingRecipe ? { slug: makeSlug(value) } : {}),
        }));

    const updateSeo = (field, value) =>
        setForm((previous) => ({
            ...previous,
            seo: { ...previous.seo, [field]: value },
        }));

    const updateArrayField = (field, index, value) =>
        setForm((previous) => ({
            ...previous,
            [field]: previous[field].map((item, i) => (i === index ? value : item)),
        }));

    const addArrayField = (field) =>
        setForm((previous) => ({ ...previous, [field]: [...previous[field], ""] }));

    const removeArrayField = (field, index) =>
        setForm((previous) => ({
            ...previous,
            [field]:
                previous[field].length > 1
                    ? previous[field].filter((_, i) => i !== index)
                    : [""],
        }));

    const resetImage = () => {
        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setImageFile(null);
        setImagePreview("");
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFormError("Please select an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setFormError("Image must be smaller than 5 MB.");
            event.target.value = "";
            return;
        }

        if (imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const openCreateModal = () => {
        setEditingRecipe(null);
        setForm({
            ...initialForm,
            ingredient: [""],
            makingstep: [""],
            seo: { ...initialForm.seo },
        });
        resetImage();
        setFormTab("basics");
        setFormError("");
        setModalOpen(true);

        if (categories.length === 0) fetchCategories();
    };

    const openEditModal = (recipe) => {
        const seo = recipe.seo || {};

        const selectedCategoryId =
            recipe.categoryId && typeof recipe.categoryId === "object"
                ? recipe.categoryId._id || recipe.categoryId.id || ""
                : recipe.categoryId || "";

        setEditingRecipe(recipe);
        setForm({
            name: recipe.name || "",
            slug: recipe.slug || "",
            categoryId: String(selectedCategoryId),
            ingredient:
                Array.isArray(recipe.ingredient) && recipe.ingredient.length
                    ? [...recipe.ingredient]
                    : [""],
            makingstep:
                Array.isArray(recipe.makingstep) && recipe.makingstep.length
                    ? [...recipe.makingstep]
                    : [""],
            status: recipe.status ?? true,
            seo: {
                title: seo.title || "",
                description: seo.description || "",
                keywords: Array.isArray(seo.keywords)
                    ? seo.keywords.join(", ")
                    : seo.keywords || "",
                canonicalUrl: seo.canonicalUrl || "",
                ogTitle: seo.ogTitle || "",
                ogDescription: seo.ogDescription || "",
                ogImage: seo.ogImage || "",
            },
        });
        resetImage();
        setImagePreview(recipe.image || "");
        setFormTab("basics");
        setFormError("");
        setModalOpen(true);

        if (categories.length === 0) fetchCategories();
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingRecipe(null);
        setFormError("");
        resetImage();
    };

    const failValidation = (message, tab) => {
        setFormTab(tab);
        setFormError(message);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setFormError("");

        if (!form.name.trim()) return failValidation("Recipe name is required.", "basics");
        if (!form.slug.trim()) return failValidation("Recipe slug is required.", "basics");
        if (!form.categoryId) return failValidation("Please select a recipe category.", "basics");
        if (!imageFile && !imagePreview) {
            return failValidation("Please upload a recipe image.", "basics");
        }

        const ingredients = form.ingredient.map((item) => item.trim()).filter(Boolean);
        const makingSteps = form.makingstep.map((item) => item.trim()).filter(Boolean);

        if (!ingredients.length) {
            return failValidation("Please add at least one ingredient.", "method");
        }

        if (!makingSteps.length) {
            return failValidation("Please add at least one making step.", "method");
        }

        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("slug", form.slug.trim());
        formData.append("categoryId", form.categoryId);
        formData.append("ingredient", JSON.stringify(ingredients));
        formData.append("makingstep", JSON.stringify(makingSteps));
        formData.append("status", String(form.status));
        formData.append(
            "seo",
            JSON.stringify({
                title: form.seo.title.trim(),
                description: form.seo.description.trim(),
                keywords: form.seo.keywords
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                canonicalUrl: form.seo.canonicalUrl.trim() || null,
                ogTitle: form.seo.ogTitle.trim() || null,
                ogDescription: form.seo.ogDescription.trim() || null,
                ogImage: form.seo.ogImage.trim() || null,
            })
        );

        if (imageFile) formData.append("image", imageFile);

        try {
            setSaving(true);

            const wasEditing = Boolean(editingRecipe);

            if (wasEditing) {
                const id = getRecipeId(editingRecipe);
                if (!id) throw new Error("Recipe ID is missing.");

                await updateRecipeRecipe(id, formData);
            } else {
                await createRecipe(formData);
            }

            closeModal();

            if (!wasEditing && page !== 1) {
                setPage(1);
            } else {
                await fetchRecipes();
            }

            notify(wasEditing ? "Recipe updated" : "Recipe created");
        } catch (error) {
            console.error("Error saving recipe:", error);
            setFormError(getErrorMessage(error, "Failed to save recipe."));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = async (recipe) => {
        const id = getRecipeId(recipe);
        if (!id) return;

        try {
            setActionLoading(id);

            await updateRecipeRecipeStatus(id, { status: !recipe.status });

            setRecipes((previous) =>
                previous.map((item) =>
                    getRecipeId(item) === id ? { ...item, status: !item.status } : item
                )
            );
        } catch (error) {
            console.error("Error updating recipe status:", error);
            notify(getErrorMessage(error, "Failed to update status."), "error");
        } finally {
            setActionLoading("");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const id = getRecipeId(deleteTarget);

        try {
            setActionLoading(id);

            await deleteRecipeRecipe(id);
            setDeleteTarget(null);

            if (recipes.length === 1 && page > 1) {
                setPage((previous) => previous - 1);
            } else {
                await fetchRecipes();
            }

            notify("Recipe deleted");
        } catch (error) {
            console.error("Error deleting recipe:", error);
            notify(getErrorMessage(error, "Failed to delete recipe."), "error");
        } finally {
            setActionLoading("");
        }
    };

    const refreshAll = () => {
        fetchRecipes();
        fetchCategories();
    };

    return (
        <div className="min-h-screen bg-stone-100/70">
            <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                            Recipes
                        </h1>
                        <p className="text-sm text-stone-500">
                            Create, publish and manage every recipe in your collection.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={refreshAll}
                            disabled={loading}
                            className={secondaryButton}
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            Refresh
                        </button>

                        <button type="button" onClick={openCreateModal} className={primaryButton}>
                            <Plus size={17} />
                            Add recipe
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
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

                {loadError && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <p>{loadError}</p>
                        <button
                            type="button"
                            onClick={fetchRecipes}
                            className="shrink-0 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left">
                            <thead className="border-b border-stone-200 bg-stone-50 text-sm text-stone-500">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Recipe</th>
                                    <th className="px-5 py-3 font-medium">Category</th>
                                    <th className="px-5 py-3 font-medium">Contents</th>
                                    <th className="px-5 py-3 font-medium">Created</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-stone-100">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 6 }).map((__, j) => (
                                                <td key={j} className="px-5 py-5">
                                                    <div className="h-5 animate-pulse rounded bg-stone-100" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : recipes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-16 text-center">
                                            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                                                <ChefHat size={22} />
                                            </span>
                                            <p className="mt-3 font-semibold text-stone-800">
                                                No recipes yet
                                            </p>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Add your first recipe to start building the collection.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={openCreateModal}
                                                className={`${primaryButton} mt-4`}
                                            >
                                                <Plus size={17} />
                                                Add recipe
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    recipes.map((recipe) => {
                                        const id = getRecipeId(recipe);
                                        const isActive = Boolean(recipe.status);

                                        return (
                                            <tr key={id} className="transition hover:bg-stone-50/70">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-100 text-stone-400">
                                                            {recipe.image ? (
                                                                <img
                                                                    src={recipe.image}
                                                                    alt={recipe.name || "Recipe"}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon size={20} />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="max-w-xs truncate font-semibold text-stone-900">
                                                                {recipe.name || "Untitled recipe"}
                                                            </p>
                                                            <p className="mt-0.5 max-w-xs truncate font-mono text-xs text-stone-400">
                                                                /{recipe.slug || "no-slug"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                                                        {getRecipeCategoryName(recipe)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-sm text-stone-600">
                                                    <p>{recipe.ingredient?.length || 0} ingredients</p>
                                                    <p className="mt-0.5 text-xs text-stone-400">
                                                        {recipe.makingstep?.length || 0} steps
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-stone-600">
                                                    {formatDate(recipe.createdAt)}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <Switch
                                                            checked={isActive}
                                                            onChange={() => handleStatusToggle(recipe)}
                                                            disabled={actionLoading === id}
                                                            label={`Toggle ${recipe.name}`}
                                                        />
                                                        <span
                                                            className={`text-xs font-medium ${isActive ? "text-emerald-700" : "text-stone-500"
                                                                }`}
                                                        >
                                                            {isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            title="Edit"
                                                            aria-label={`Edit ${recipe.name}`}
                                                            onClick={() => openEditModal(recipe)}
                                                            className={iconButton}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Delete"
                                                            aria-label={`Delete ${recipe.name}`}
                                                            onClick={() => setDeleteTarget(recipe)}
                                                            className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col justify-between gap-3 border-t border-stone-200 px-5 py-3.5 sm:flex-row sm:items-center">
                        <p className="text-sm text-stone-500">
                            Page <span className="font-semibold text-stone-800">{page}</span> of{" "}
                            <span className="font-semibold text-stone-800">{totalPages}</span>
                            {" – "}
                            {total} {total === 1 ? "recipe" : "recipes"}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                                className={secondaryButton}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={page >= totalPages || loading}
                                onClick={() =>
                                    setPage((previous) => Math.min(totalPages, previous + 1))
                                }
                                className={secondaryButton}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {modalOpen && (
                <Modal
                    title={editingRecipe ? "Edit recipe" : "New recipe"}
                    description="Details, method and SEO for this recipe."
                    width="max-w-3xl"
                    onClose={closeModal}
                    footer={
                        <>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={closeModal}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="recipe-form"
                                disabled={saving}
                                className={primaryButton}
                            >
                                {saving && <LoaderCircle size={16} className="animate-spin" />}
                                {saving
                                    ? "Saving…"
                                    : editingRecipe
                                        ? "Save changes"
                                        : "Create recipe"}
                            </button>
                        </>
                    }
                >
                    {formError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError}
                        </div>
                    )}

                    <div className="-mt-1 mb-5 flex gap-1 border-b border-stone-200" role="tablist">
                        {FORM_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={formTab === tab.id}
                                onClick={() => setFormTab(tab.id)}
                                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${formTab === tab.id
                                    ? "border-emerald-700 text-emerald-800"
                                    : "border-transparent text-stone-500 hover:text-stone-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form id="recipe-form" onSubmit={handleSave}>
                        {formTab === "basics" && (
                            <div className="space-y-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Recipe name *">
                                        <input
                                            value={form.name}
                                            onChange={(event) => updateField("name", event.target.value)}
                                            placeholder="e.g. Masala dosa"
                                            className={inputClass}
                                            autoFocus
                                        />
                                    </Field>

                                    <Field
                                        label="Slug *"
                                        hint={!editingRecipe ? "Generated from the name. You can edit it." : undefined}
                                    >
                                        <input
                                            value={form.slug}
                                            onChange={(event) => updateField("slug", event.target.value)}
                                            placeholder="masala-dosa"
                                            className={`${inputClass} font-mono`}
                                        />
                                    </Field>
                                </div>

                                <Field label="Recipe category *">
                                    <select
                                        value={form.categoryId}
                                        onChange={(event) => updateField("categoryId", event.target.value)}
                                        disabled={categoriesLoading}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {categoriesLoading
                                                ? "Loading categories…"
                                                : "Select recipe category"}
                                        </option>

                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>

                                    {!categoriesLoading && categories.length === 0 && (
                                        <p className="mt-1.5 text-xs text-red-600">
                                            No active categories found.
                                            <button
                                                type="button"
                                                onClick={fetchCategories}
                                                className="ml-1 font-semibold underline"
                                            >
                                                Retry
                                            </button>
                                        </p>
                                    )}
                                </Field>

                                <Field label="Recipe image *">
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <label className="flex min-h-40 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 text-center transition hover:border-emerald-500 hover:bg-emerald-50/40">
                                            <UploadCloud size={28} className="mb-2 text-stone-400" />
                                            <span className="text-sm font-semibold text-stone-700">
                                                {imageFile ? imageFile.name : "Choose an image"}
                                            </span>
                                            <span className="mt-1 text-xs text-stone-500">
                                                PNG, JPG or WEBP, up to 5 MB
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>

                                        {imagePreview && (
                                            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-stone-200 sm:w-56">
                                                <img
                                                    src={imagePreview}
                                                    alt="Recipe preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={resetImage}
                                                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow hover:bg-white hover:text-red-600"
                                                    aria-label="Remove image"
                                                    title="Remove image"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Field>

                                <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-stone-800">Active</p>
                                        <p className="text-xs text-stone-500">
                                            Inactive recipes are hidden from visitors.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={form.status}
                                        onChange={() => updateField("status", !form.status)}
                                        label="Active recipe"
                                    />
                                </div>
                            </div>
                        )}

                        {formTab === "method" && (
                            <div className="space-y-8">
                                <ListEditor
                                    icon={<Utensils size={18} />}
                                    title="Ingredients"
                                    hint="One ingredient per line, with quantity."
                                    addLabel="Add ingredient"
                                    placeholder="Ingredient"
                                    items={form.ingredient}
                                    onChange={(index, value) =>
                                        updateArrayField("ingredient", index, value)
                                    }
                                    onAdd={() => addArrayField("ingredient")}
                                    onRemove={(index) => removeArrayField("ingredient", index)}
                                />

                                <ListEditor
                                    icon={<ListChecks size={18} />}
                                    title="Making steps"
                                    hint="Describe each preparation step in order."
                                    addLabel="Add step"
                                    placeholder="Step"
                                    multiline
                                    items={form.makingstep}
                                    onChange={(index, value) =>
                                        updateArrayField("makingstep", index, value)
                                    }
                                    onAdd={() => addArrayField("makingstep")}
                                    onRemove={(index) => removeArrayField("makingstep", index)}
                                />
                            </div>
                        )}

                        {formTab === "seo" && (
                            <div className="space-y-5">
                                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                                    <p className="mb-2 text-xs text-stone-500">Search result preview</p>
                                    <p className="truncate text-xs text-stone-500">
                                        {form.seo.canonicalUrl || `/${form.slug || "recipe-slug"}`}
                                    </p>
                                    <p className="mt-0.5 truncate text-lg text-blue-700">
                                        {form.seo.title || form.name || "SEO title"}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">
                                        {form.seo.description || "SEO description will appear here."}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="SEO title" counter={<Counter value={form.seo.title} max={60} />}>
                                        <input
                                            value={form.seo.title}
                                            onChange={(event) => updateSeo("title", event.target.value)}
                                            placeholder="SEO title"
                                            className={inputClass}
                                        />
                                    </Field>

                                    <Field label="Canonical URL">
                                        <input
                                            value={form.seo.canonicalUrl}
                                            onChange={(event) => updateSeo("canonicalUrl", event.target.value)}
                                            placeholder="https://example.com/recipe"
                                            className={inputClass}
                                        />
                                    </Field>

                                    <div className="sm:col-span-2">
                                        <Field
                                            label="SEO description"
                                            counter={<Counter value={form.seo.description} max={160} />}
                                        >
                                            <textarea
                                                rows={3}
                                                value={form.seo.description}
                                                onChange={(event) => updateSeo("description", event.target.value)}
                                                placeholder="SEO description"
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Field label="Keywords" hint="Separate keywords with commas.">
                                            <input
                                                value={form.seo.keywords}
                                                onChange={(event) => updateSeo("keywords", event.target.value)}
                                                placeholder="recipe, cooking, food"
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-stone-900">Social sharing</h3>
                                    <p className="mb-3 text-xs text-stone-500">
                                        Used when a link to this recipe is shared on social platforms.
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Open Graph title">
                                            <input
                                                value={form.seo.ogTitle}
                                                onChange={(event) => updateSeo("ogTitle", event.target.value)}
                                                placeholder="Social sharing title"
                                                className={inputClass}
                                            />
                                        </Field>

                                        <Field label="Open Graph image URL">
                                            <input
                                                value={form.seo.ogImage}
                                                onChange={(event) => updateSeo("ogImage", event.target.value)}
                                                placeholder="https://"
                                                className={inputClass}
                                            />
                                        </Field>

                                        <div className="sm:col-span-2">
                                            <Field label="Open Graph description">
                                                <textarea
                                                    rows={2}
                                                    value={form.seo.ogDescription}
                                                    onChange={(event) =>
                                                        updateSeo("ogDescription", event.target.value)
                                                    }
                                                    placeholder="Social sharing description"
                                                    className={inputClass}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </Modal>
            )}

            {deleteTarget && (
                <Modal
                    title={`Delete "${deleteTarget.name || "this recipe"}"?`}
                    width="max-w-md"
                    onClose={() => setDeleteTarget(null)}
                    footer={
                        <>
                            <button
                                type="button"
                                disabled={actionLoading === getRecipeId(deleteTarget)}
                                onClick={() => setDeleteTarget(null)}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading === getRecipeId(deleteTarget)}
                                onClick={handleDelete}
                                className={dangerButton}
                            >
                                {actionLoading === getRecipeId(deleteTarget) && (
                                    <LoaderCircle size={16} className="animate-spin" />
                                )}
                                Delete recipe
                            </button>
                        </>
                    }
                >
                    <p className="text-sm text-stone-600">
                        This recipe will be removed permanently. This can&apos;t be undone.
                    </p>
                </Modal>
            )}

            <Toasts toasts={toasts} dismiss={dismissToast} />
        </div>
    );
}