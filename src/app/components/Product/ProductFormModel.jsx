"use client";

import { useEffect, useRef, useState } from "react";
import {
    Plus, RefreshCw, Pencil, Trash2, Image as ImageIcon,
    X, XCircle, Upload, Wine, HelpCircle, Info, Globe, Undo2,
} from "lucide-react";

import {
    createProduct,
    updateProduct,
} from "@/apiService/productApi.js";

const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


const errorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;


function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function ChipInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 transition focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
      <div className="flex flex-wrap gap-1.5">
        {values.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-lg bg-teal-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-teal-700"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(values.filter((v) => v !== item))}
              className="rounded p-0.5 hover:bg-teal-100"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function PairRows({ title, note, addLabel, rows, namePlaceholder, valuePlaceholder, onAdd, onChange, onRemove }) {
  return (
    <section>
      <SectionHeader title={title} note={note} actionLabel={addLabel} onAction={onAdd} />
      {rows.length === 0 ? (
        <EmptyRows text={`No ${title.toLowerCase()} yet.`} />
      ) : (
        <div className="space-y-2.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.name}
                onChange={(e) => onChange(i, "name", e.target.value)}
                placeholder={namePlaceholder}
                className={inputClass}
              />
              <input
                value={row.value}
                onChange={(e) => onChange(i, "value", e.target.value)}
                placeholder={valuePlaceholder}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${title.toLowerCase()} row`}
                className="rounded-lg p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ImageDrop({ title, description, preview, error, changed, onFile, onUndo }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 text-slate-700">
          <span className="rounded-lg bg-slate-100 p-2">
            <ImageIcon size={18} />
          </span>
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
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition ${
          dragging
            ? "border-teal-500 bg-teal-50"
            : "border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40"
        }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={`${title} preview`} className="h-full w-full object-cover" />
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
            <p className="text-sm font-semibold text-slate-700">Drop an image or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5 MB</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

const TABS = [
  { id: "basics", label: "Basics", icon: Info },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "details", label: "Details", icon: Wine },
  { id: "extras", label: "Variants & FAQ", icon: HelpCircle },
  { id: "seo", label: "SEO", icon: Globe },
];

const SOCIALS = [
  { label: "Open Graph", prefix: "og" },
  { label: "Twitter", prefix: "twitter" },
  { label: "Facebook", prefix: "facebook" },
];

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

function SectionHeader({ title, note, actionLabel, onAction, disabled }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{note}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyRows({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}


function validateImage(file) {
  if (!file.type.startsWith("image/")) return "Please select a valid image.";
  if (file.size > 5 * 1024 * 1024) return "Image size must not exceed 5 MB.";
  return "";
}

const MAX_VARIANTS = 10;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

  const getProductId = (product) => product?._id || product?.id;

export default function ProductFormModal({ product, onClose, onSaved }) {
    const isEdit = Boolean(product);
    const seoData = product?.seo || {};


    const imageFields = [
        { key: "featureImage", title: "Feature image", description: "Main picture shown on product cards", existing: product?.featureImage || "" },
        { key: "image", title: "Product image", description: "Secondary product picture", existing: product?.image || "" },
        { key: "bottle", title: "Bottle image", description: "Bottle shot for the product page", existing: product?.bottleImage || "" },
    ];

    const [tab, setTab] = useState("basics");
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [errors, setErrors] = useState({});
    const [slugTouched, setSlugTouched] = useState(isEdit);

    const [form, setForm] = useState(() => ({
        name: product?.name || "",
        slug: product?.slug || "",
        shortDes: product?.shortDes || "",
        description: product?.description || "",
        flavourName: product?.flavour?.name || "",
        flavourDes: product?.flavour?.des || "",
        serve: product?.serve || "",
        spirits: product?.spirits || [],
        pairs: product?.pairs || [],
        nutrition: (product?.nutrition || []).map((n) => ({ name: n.name || "", value: n.value || "" })),
        intgredient: (product?.intgredient || []).map((n) => ({ name: n.name || "", value: n.value || "" })),
        variants: (product?.variants || []).map((v) => ({
            name: v.name || "",
            image: v.image || "",
            file: null,
            preview: v.image || "",
        })),
        faq: (product?.faq || []).map((f) => ({ question: f.question || "", answer: f.answer || "" })),
        status: product?.status ?? true,
        seo: {
            metaTitle: seoData.metaTitle || "",
            metaDescription: seoData.metaDescription || "",
            keywords: seoData.keywords || [],
            canonicalUrl: seoData.canonicalUrl || "",
            ogTitle: seoData.ogTitle || "",
            ogDescription: seoData.ogDescription || "",
            ogImage: seoData.ogImage || "",
            twitterTitle: seoData.twitterTitle || "",
            twitterDescription: seoData.twitterDescription || "",
            twitterImage: seoData.twitterImage || "",
            facebookTitle: seoData.facebookTitle || "",
            facebookDescription: seoData.facebookDescription || "",
            facebookImage: seoData.facebookImage || "",
        },
    }));

    const [images, setImages] = useState({ featureImage: null, image: null, bottle: null });
    const [previews, setPreviews] = useState(() =>
        Object.fromEntries(imageFields.map((f) => [f.key, f.existing]))
    );
    const [imageErrors, setImageErrors] = useState({});

    const blobUrls = useRef(new Set());
    const makePreview = (file) => {
        const url = URL.createObjectURL(file);
        blobUrls.current.add(url);
        return url;
    };
    const dropPreview = (url) => {
        if (url && blobUrls.current.has(url)) {
            URL.revokeObjectURL(url);
            blobUrls.current.delete(url);
        }
    };

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && !saving && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [saving]);

    useEffect(() => {
        const urls = blobUrls.current;
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, []);

    const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const setSeo = (key, value) =>
        setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "name" && !slugTouched) updated.slug = slugify(value);
            return updated;
        });
        if (name === "slug") setSlugTouched(true);
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const setImage = (key, file) => {
        if (!file) return;
        const err = validateImage(file);
        setImageErrors((p) => ({ ...p, [key]: err }));
        if (err) return;

        dropPreview(previews[key]);
        const url = makePreview(file);
        setPreviews((p) => ({ ...p, [key]: url }));
        setImages((p) => ({ ...p, [key]: file }));
    };

    const undoImage = (key, existing) => {
        dropPreview(previews[key]);
        setPreviews((p) => ({ ...p, [key]: existing }));
        setImages((p) => ({ ...p, [key]: null }));
        setImageErrors((p) => ({ ...p, [key]: "" }));
    };

    const updateRow = (key, index, field, value) =>
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
        }));
    const addRow = (key, row) => setForm((prev) => ({ ...prev, [key]: [...prev[key], row] }));
    const removeRow = (key, index) =>
        setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

    const setVariantImage = (index, file) => {
        if (!file) return;
        const err = validateImage(file);
        if (err) return setSubmitError(err);

        setSubmitError("");
        dropPreview(form.variants[index].preview);
        const url = makePreview(file);
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((v, i) => (i === index ? { ...v, file, preview: url } : v)),
        }));
    };

    const removeVariant = (index) => {
        dropPreview(form.variants[index].preview);
        removeRow("variants", index);
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Enter a product name.";
        if (!form.slug.trim()) next.slug = "Enter a slug.";
        setErrors(next);
        if (Object.keys(next).length) setTab("basics");
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        if (!validate()) return;

        const clean = (rows) =>
            rows
                .filter((r) => r.name.trim())
                .map((r) => ({ name: r.name.trim(), value: r.value.trim() }));

        const variantRows = form.variants.filter((v) => v.name.trim());
        const nullable = (v) => (v.trim() ? v.trim() : null);
        const s = form.seo;

        const seo = {
            metaTitle: s.metaTitle.trim(),
            metaDescription: s.metaDescription.trim(),
            keywords: s.keywords.map((k) => k.toLowerCase()),
            canonicalUrl: nullable(s.canonicalUrl),
            ogTitle: nullable(s.ogTitle),
            ogDescription: nullable(s.ogDescription),
            ogImage: nullable(s.ogImage),
            twitterTitle: nullable(s.twitterTitle),
            twitterDescription: nullable(s.twitterDescription),
            twitterImage: nullable(s.twitterImage),
            facebookTitle: nullable(s.facebookTitle),
            facebookDescription: nullable(s.facebookDescription),
            facebookImage: nullable(s.facebookImage),
        };

        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("slug", form.slug.trim());
        formData.append("shortDes", form.shortDes.trim());
        formData.append("description", form.description.trim());
        formData.append("serve", form.serve.trim());
        formData.append("status", String(form.status));
        formData.append(
            "flavour",
            JSON.stringify({ name: form.flavourName.trim(), des: form.flavourDes.trim() })
        );
        formData.append("spirits", JSON.stringify(form.spirits));
        formData.append("pairs", JSON.stringify(form.pairs));
        formData.append("nutrition", JSON.stringify(clean(form.nutrition)));
        formData.append("intgredient", JSON.stringify(clean(form.intgredient)));
        formData.append(
            "variants",
            JSON.stringify(variantRows.map((v) => ({ name: v.name.trim(), image: v.file ? "" : v.image })))
        );
        formData.append(
            "faq",
            JSON.stringify(form.faq.filter((f) => f.question.trim() && f.answer.trim()))
        );
        formData.append("seo", JSON.stringify(seo));

        Object.entries(images).forEach(([key, file]) => {
            if (file instanceof File) formData.append(key, file);
        });
        variantRows.forEach((v) => {
            if (v.file instanceof File) formData.append("variant", v.file);
        });

        try {
            setSaving(true);
            const response = isEdit
                ? await updateProduct(getProductId(product), formData)
                : await createProduct(formData);
            const data = response?.data ?? response;

            if (data?.success === false) {
                throw new Error(data.message || "Failed to save product");
            }
            await onSaved(isEdit ? "Product updated." : "Product created.");
        } catch (err) {
            console.error("Save product error:", err);
            setSubmitError(errorMessage(err, "Failed to save product."));
        } finally {
            setSaving(false);
        }
    };

    const tabHasError = (id) => id === "basics" && (errors.name || errors.slug);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={isEdit ? "Edit product" : "Add product"}
                className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            >
                <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                            {isEdit ? <Pencil size={20} /> : <Plus size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {isEdit ? "Edit product" : "Add product"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {isEdit ? `Updating ${product.name}` : "Fill in the details to add it to your catalogue."}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-2 sm:px-6" role="tablist">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={tab === id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${tab === id
                                ? "border-teal-600 text-teal-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                            {tabHasError(id) && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
                    <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
                        {tab === "basics" && (
                            <>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <Field label="Product name" required error={errors.name}>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Smoked Maple Old Fashioned"
                                            autoFocus
                                            className={`${inputClass} ${errors.name ? "border-rose-400" : ""}`}
                                        />
                                    </Field>

                                    <Field label="Slug" required error={errors.slug} hint={!slugTouched ? "Generated from the name" : ""}>
                                        <input
                                            name="slug"
                                            value={form.slug}
                                            onChange={handleChange}
                                            placeholder="smoked-maple-old-fashioned"
                                            className={`${inputClass} ${errors.slug ? "border-rose-400" : ""}`}
                                        />
                                    </Field>
                                </div>

                                <Field label="Short description">
                                    <input
                                        name="shortDes"
                                        value={form.shortDes}
                                        onChange={handleChange}
                                        placeholder="One line shown on product cards"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Full description">
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Tell shoppers what makes this product special"
                                        className={`${inputClass} resize-y`}
                                    />
                                </Field>

                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{form.status ? "Active" : "Inactive"}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {form.status ? "Visible to shoppers." : "Hidden from shoppers until you activate it."}
                                        </p>
                                    </div>
                                    <StatusSwitch checked={form.status} hideLabel onClick={() => set("status", !form.status)} />
                                </div>
                            </>
                        )}

                        {tab === "images" && (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {imageFields.map((f) => (
                                    <ImageDrop
                                        key={f.key}
                                        title={f.title}
                                        description={f.description}
                                        preview={previews[f.key]}
                                        error={imageErrors[f.key]}
                                        changed={images[f.key] instanceof File}
                                        onFile={(file) => setImage(f.key, file)}
                                        onUndo={() => undoImage(f.key, f.existing)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ---- Details ---- */}
                        {tab === "details" && (
                            <>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <Field label="Flavour name">
                                        <input name="flavourName" value={form.flavourName} onChange={handleChange} placeholder="e.g. Smoky maple" className={inputClass} />
                                    </Field>
                                    <Field label="Flavour notes">
                                        <input name="flavourDes" value={form.flavourDes} onChange={handleChange} placeholder="Short tasting note" className={inputClass} />
                                    </Field>
                                </div>

                                <Field label="Serving instructions">
                                    <textarea
                                        name="serve"
                                        value={form.serve}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="How to serve it, e.g. over a large ice cube with an orange peel"
                                        className={`${inputClass} resize-y`}
                                    />
                                </Field>

                                <Field label="Spirits" hint="Press Enter to add">
                                    <ChipInput values={form.spirits} onChange={(v) => set("spirits", v)} placeholder="Add a spirit, e.g. Bourbon" />
                                </Field>

                                <Field label="Pairs well with" hint="Press Enter to add">
                                    <ChipInput values={form.pairs} onChange={(v) => set("pairs", v)} placeholder="Add a pairing, e.g. Dark chocolate" />
                                </Field>

                                <PairRows
                                    title="Nutrition"
                                    note="Facts per serving, e.g. Calories: 120 kcal."
                                    addLabel="Add nutrition fact"
                                    rows={form.nutrition}
                                    namePlaceholder="Name"
                                    valuePlaceholder="Value"
                                    onAdd={() => addRow("nutrition", { name: "", value: "" })}
                                    onChange={(i, field, value) => updateRow("nutrition", i, field, value)}
                                    onRemove={(i) => removeRow("nutrition", i)}
                                />

                                <PairRows
                                    title="Ingredients"
                                    note="What goes into the product, with amounts."
                                    addLabel="Add ingredient"
                                    rows={form.intgredient}
                                    namePlaceholder="Ingredient"
                                    valuePlaceholder="Amount"
                                    onAdd={() => addRow("intgredient", { name: "", value: "" })}
                                    onChange={(i, field, value) => updateRow("intgredient", i, field, value)}
                                    onRemove={(i) => removeRow("intgredient", i)}
                                />
                            </>
                        )}

                        {/* ---- Variants & FAQ ---- */}
                        {tab === "extras" && (
                            <>
                                <section>
                                    <SectionHeader
                                        title="Variants"
                                        note={`Sizes or pack options with their own image (up to ${MAX_VARIANTS}).`}
                                        actionLabel="Add variant"
                                        disabled={form.variants.length >= MAX_VARIANTS}
                                        onAction={() => addRow("variants", { name: "", image: "", file: null, preview: "" })}
                                    />
                                    {form.variants.length === 0 ? (
                                        <EmptyRows text="No variants yet." />
                                    ) : (
                                        <div className="space-y-2.5">
                                            {form.variants.map((v, i) => (
                                                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5">
                                                    <label
                                                        title="Upload variant image"
                                                        className="group relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 transition hover:border-teal-400"
                                                    >
                                                        {v.preview ? (
                                                            <img src={v.preview} alt={v.name || "Variant"} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Upload size={18} className="text-slate-400" />
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={(e) => {
                                                                setVariantImage(i, e.target.files?.[0]);
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                    </label>
                                                    <input
                                                        value={v.name}
                                                        onChange={(e) => updateRow("variants", i, "name", e.target.value)}
                                                        placeholder="Variant name, e.g. 500 ml"
                                                        className={inputClass}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(i)}
                                                        aria-label="Remove variant"
                                                        className="rounded-lg p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <SectionHeader
                                        title="FAQs"
                                        note="Questions shoppers often ask about this product."
                                        actionLabel="Add FAQ"
                                        onAction={() => addRow("faq", { question: "", answer: "" })}
                                    />
                                    {form.faq.length === 0 ? (
                                        <EmptyRows text="No FAQs yet." />
                                    ) : (
                                        <div className="space-y-3">
                                            {form.faq.map((f, i) => (
                                                <div key={i} className="space-y-2 rounded-xl border border-slate-200 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={f.question}
                                                            onChange={(e) => updateRow("faq", i, "question", e.target.value)}
                                                            placeholder="Question"
                                                            className={inputClass}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow("faq", i)}
                                                            aria-label="Remove FAQ"
                                                            className="rounded-lg p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={f.answer}
                                                        onChange={(e) => updateRow("faq", i, "answer", e.target.value)}
                                                        rows={2}
                                                        placeholder="Answer"
                                                        className={`${inputClass} resize-y`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {/* ---- SEO ---- */}
                        {tab === "seo" && (
                            <>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                                    <p className="mb-2 text-xs font-medium text-slate-500">Search result preview</p>
                                    <p className="truncate text-xs text-emerald-700">
                                        {form.seo.canonicalUrl || `/products/${form.slug || "product-slug"}`}
                                    </p>
                                    <p className="mt-0.5 truncate text-base font-semibold text-sky-700">
                                        {form.seo.metaTitle || form.name || "Product title"}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                                        {form.seo.metaDescription || form.shortDes || "Your meta description appears here."}
                                    </p>
                                </div>

                                <Field label="Meta title" hint={`${form.seo.metaTitle.length}/60`}>
                                    <input
                                        value={form.seo.metaTitle}
                                        onChange={(e) => setSeo("metaTitle", e.target.value)}
                                        maxLength={60}
                                        placeholder="Title shown in search results"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Meta description" hint={`${form.seo.metaDescription.length}/160`}>
                                    <textarea
                                        value={form.seo.metaDescription}
                                        onChange={(e) => setSeo("metaDescription", e.target.value)}
                                        maxLength={160}
                                        rows={3}
                                        placeholder="Summary shown under the title in search results"
                                        className={`${inputClass} resize-y`}
                                    />
                                </Field>

                                <Field label="Keywords" hint="Press Enter to add">
                                    <ChipInput
                                        values={form.seo.keywords}
                                        onChange={(v) => setSeo("keywords", v.map((k) => k.toLowerCase()))}
                                        placeholder="Add a keyword"
                                    />
                                </Field>

                                <Field label="Canonical URL">
                                    <input
                                        value={form.seo.canonicalUrl}
                                        onChange={(e) => setSeo("canonicalUrl", e.target.value)}
                                        placeholder="https://example.com/products/..."
                                        className={inputClass}
                                    />
                                </Field>

                                <div>
                                    <h3 className="mb-1 text-sm font-semibold text-slate-900">Social sharing</h3>
                                    <p className="mb-3 text-xs text-slate-500">
                                        Optional overrides for how links look when shared. Image fields take a full image URL.
                                    </p>
                                    <div className="space-y-3">
                                        {SOCIALS.map(({ label, prefix }) => (
                                            <div key={prefix} className="space-y-3 rounded-xl border border-slate-200 p-4">
                                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                                <input
                                                    value={form.seo[`${prefix}Title`]}
                                                    onChange={(e) => setSeo(`${prefix}Title`, e.target.value)}
                                                    placeholder="Title"
                                                    className={inputClass}
                                                />
                                                <textarea
                                                    value={form.seo[`${prefix}Description`]}
                                                    onChange={(e) => setSeo(`${prefix}Description`, e.target.value)}
                                                    rows={2}
                                                    placeholder="Description"
                                                    className={`${inputClass} resize-y`}
                                                />
                                                <input
                                                    value={form.seo[`${prefix}Image`]}
                                                    onChange={(e) => setSeo(`${prefix}Image`, e.target.value)}
                                                    placeholder="Image URL"
                                                    className={inputClass}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {submitError && (
                        <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
                            <XCircle size={18} className="mt-0.5 shrink-0" />
                            {submitError}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-xs text-slate-500">
                            Fields marked <span className="text-rose-500">*</span> are required.
                        </p>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}