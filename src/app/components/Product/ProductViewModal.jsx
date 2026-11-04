"use client";

import { useEffect, } from "react";
import { Pencil, Image as ImageIcon, X, } from "lucide-react";



function DetailSection({ title, children }) {
    return (
        <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-900">{title}</h4>
            <div className="text-sm text-slate-600">{children}</div>
        </div>
    );
}

function Chips({ items }) {
    if (!items?.length) return "—";
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
                <span key={`${item}-${i}`} className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    {item}
                </span>
            ))}
        </div>
    );
}


export default function ProductViewModal({ product, onClose, onEdit }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, []);

    const gallery = [
        { label: "Feature", src: product.featureImage },
        { label: "Product", src: product.image },
        { label: "Bottle", src: product.bottleImage },
    ].filter((g) => g.src);

    const pairsText = (rows) =>
        (rows || []).length ? (
            <div className="space-y-1.5">
                {rows.map((r, i) => (
                    <div key={i} className="flex justify-between gap-4 border-b border-slate-200/70 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-600">{r.name}</span>
                        <span className="font-medium text-slate-800">{r.value}</span>
                    </div>
                ))}
            </div>
        ) : (
            "—"
        );

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Product details"
                className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Product details</h2>
                        <p className="text-sm text-slate-500">{product.slug}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.status ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    }`}
                            >
                                {product.status ? "Active" : "Inactive"}
                            </span>
                        </div>
                        {product.shortDes && <p className="text-sm font-medium text-slate-700">{product.shortDes}</p>}
                        {product.description && <p className="text-sm text-slate-500">{product.description}</p>}
                    </div>

                    {gallery.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {gallery.map((g) => (
                                <figure key={g.label}>
                                    <div className="aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                        <img src={g.src} alt={`${product.name} ${g.label}`} className="h-full w-full object-cover" />
                                    </div>
                                    <figcaption className="mt-1 text-center text-xs text-slate-500">{g.label}</figcaption>
                                </figure>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-28 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
                            <ImageIcon size={30} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailSection title="Flavour">
                            {product.flavour?.name ? (
                                <>
                                    <p className="font-medium text-slate-800">{product.flavour.name}</p>
                                    {product.flavour.des && <p className="mt-0.5 text-slate-500">{product.flavour.des}</p>}
                                </>
                            ) : (
                                "—"
                            )}
                        </DetailSection>
                        <DetailSection title="Serving instructions">{product.serve || "—"}</DetailSection>
                        <DetailSection title="Spirits">
                            <Chips items={product.spirits} />
                        </DetailSection>
                        <DetailSection title="Pairs well with">
                            <Chips items={product.pairs} />
                        </DetailSection>
                        <DetailSection title="Nutrition">{pairsText(product.nutrition)}</DetailSection>
                        <DetailSection title="Ingredients">{pairsText(product.intgredient)}</DetailSection>
                    </div>

                    <DetailSection title="Variants">
                        {(product.variants || []).length ? (
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((v, i) => (
                                    <div key={`${v.name}-${i}`} className="flex items-center gap-2 rounded-lg bg-white p-1.5 pr-3 ring-1 ring-slate-200">
                                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-slate-100">
                                            {v.image ? (
                                                <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon size={14} className="text-slate-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700">{v.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            "—"
                        )}
                    </DetailSection>

                    <DetailSection title="FAQs">
                        {(product.faq || []).length ? (
                            <div className="space-y-3">
                                {product.faq.map((faq, i) => (
                                    <div key={i}>
                                        <p className="font-medium text-slate-800">{faq.question}</p>
                                        <p className="mt-0.5 text-slate-600">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            "No FAQs yet."
                        )}
                    </DetailSection>

                    {(product.seo?.metaTitle || product.seo?.metaDescription || product.seo?.keywords?.length > 0) && (
                        <DetailSection title="SEO">
                            {product.seo.metaTitle && <p className="font-medium text-slate-800">{product.seo.metaTitle}</p>}
                            {product.seo.metaDescription && <p className="mt-0.5 text-slate-500">{product.seo.metaDescription}</p>}
                            {product.seo.keywords?.length > 0 && (
                                <div className="mt-2">
                                    <Chips items={product.seo.keywords} />
                                </div>
                            )}
                        </DetailSection>
                    )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        <Pencil size={16} />
                        Edit product
                    </button>
                </div>
            </div>
        </div>
    );
}