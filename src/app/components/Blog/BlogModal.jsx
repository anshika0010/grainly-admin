"use client";

import { useEffect, useRef, useState } from "react";
import BlogEditor from "../ui/blogEditor";
import { BLOG_CATEGORIES } from "@/apiService/blogApi";

export default function BlogModal({form,editingBlog,contentUnavailable,saving,onClose,onSubmit,onInputChange,onSeoChange,onImageChange,onKeywordsChange,
}) {
    const editorRef = useRef(null);

    const [imagePreview, setImagePreview] = useState(
        form.image instanceof File
            ? URL.createObjectURL(form.image)
            : form.image
    );

    useEffect(() => {
        if (form.image instanceof File) {
            const url = URL.createObjectURL(form.image);
            setImagePreview(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }

        setImagePreview(form.image || "");
    }, [form.image]);

    const handleEditorInputChange = (field, value) => {
        onInputChange({
            target: {
                name: field,
                value,
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingBlog ? "Edit Blog" : "Create Blog"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {editingBlog
                                ? "Update blog information and SEO"
                                : "Create a new blog with SEO information"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-gray-500 hover:bg-gray-100 hover:text-black disabled:opacity-50"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="overflow-y-auto"
                >
                    <div className="space-y-6 p-6">
                        <section className="rounded-xl border border-gray-200 p-5">
                            <div className="mb-5">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Blog Information
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    Basic information about the blog.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    label="Title"
                                    name="title"
                                    value={form.title}
                                    onChange={onInputChange}
                                    placeholder="Enter blog title"
                                    required
                                />

                                <Input
                                    label="Author"
                                    name="author"
                                    value={form.author}
                                    onChange={onInputChange}
                                    placeholder="Enter author"
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={onInputChange}
                                        required
                                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-black"
                                    >
                                        {BLOG_CATEGORIES.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Tags"
                                    name="tags"
                                    value={form.tags}
                                    onChange={onInputChange}
                                    placeholder="breakfast, rice, healthy (max 10)"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Blog Image
                                </label>

                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={onImageChange}
                                    className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700"
                                />

                                {imagePreview && (
                                    <div className="mt-4">
                                        <div className="h-44 w-72 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                            <img
                                                src={imagePreview}
                                                alt="Blog preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {form.image instanceof File && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Selected:{" "}
                                                {form.image.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {editingBlog &&
                                    !(form.image instanceof File) && (
                                        <p className="mt-2 text-xs text-gray-400">
                                            Select a new image if you want
                                            to replace the current image.
                                        </p>
                                    )}
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Excerpt
                                </label>

                                <textarea
                                    name="excerpt"
                                    value={form.excerpt}
                                    onChange={onInputChange}
                                    rows={3}
                                    maxLength={500}
                                    placeholder="Short summary shown on blog cards"
                                    className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-black"
                                />

                                <div className="mt-1 flex justify-end">
                                    <span className="text-xs text-gray-400">
                                        {form.excerpt.length}/500
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Content
                                </label>

                                {contentUnavailable && (
                                    <p className="mb-2 text-xs text-amber-600">
                                        The current content of this draft can&apos;t be loaded.
                                        Leave this empty to keep it, or write new content to replace it.
                                    </p>
                                )}

                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <BlogEditor
                                        blogForm={form}
                                        handleInputChange={
                                            handleEditorInputChange
                                        }
                                        editorRef={editorRef}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-gray-200 p-5">
                            <div className="mb-6">
                                <h3 className="text-base font-semibold text-gray-900">
                                    SEO Settings
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    Configure metadata for search engines.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Meta Title
                                        </label>

                                        <input
                                            type="text"
                                            maxLength={60}
                                            value={form.seo.metaTitle}
                                            onChange={(e) =>
                                                onSeoChange(
                                                    "metaTitle",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter meta title"
                                            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
                                        />

                                        <div className="mt-1 flex justify-end">
                                            <span className="text-xs text-gray-400">
                                                {form.seo.metaTitle.length}/60
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Meta Description
                                    </label>

                                    <textarea
                                        maxLength={160}
                                        rows={3}
                                        value={form.seo.metaDescription}
                                        onChange={(e) =>
                                            onSeoChange(
                                                "metaDescription",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter meta description"
                                        className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-black"
                                    />

                                    <div className="mt-1 flex justify-end">
                                        <span className="text-xs text-gray-400">
                                            {form.seo.metaDescription.length}/160
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Keywords
                                    </label>

                                    <input
                                        type="text"
                                        value={form.seo.keywords.join(", ")}
                                        onChange={(e) =>
                                            onKeywordsChange(
                                                e.target.value
                                            )
                                        }
                                        placeholder="whey protein, protein powder, fitness"
                                        className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
                                    />

                                    <p className="mt-1 text-xs text-gray-400">
                                        Separate keywords using commas.
                                    </p>

                                    {form.seo.keywords.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {form.seo.keywords.map(
                                                (keyword, index) => (
                                                    <span
                                                        key={`${keyword}-${index}`}
                                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                                                    >
                                                        {keyword}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </section>

                        <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Publish Blog
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Published blogs will be visible
                                        on the website.
                                    </p>
                                </div>

                                <Toggle
                                    name="published"
                                    checked={form.published}
                                    onChange={onInputChange}
                                />
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Featured
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Featured blogs are highlighted on the website.
                                    </p>
                                </div>

                                <Toggle
                                    name="featured"
                                    checked={form.featured}
                                    onChange={onInputChange}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingBlog
                                ? "Update Blog"
                                : "Create Blog"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Input({label, name, value, onChange, placeholder, type = "text", required = false,}) {
    return (
        <div>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black"
            />
        </div>
    );
}

function Toggle({ name, checked, onChange }) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
            />

            <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-5" />
        </label>
    );
}
