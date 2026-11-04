"use client"

import { useEffect, useState } from "react";

export default function CategoryModal({
  form,
  editingCategory,
  saving,
  onClose,
  onSubmit,
  onInputChange,
  onSeoChange,
  onImageChange,
  onKeywordsChange,
}) {
  const [imagePreview, setImagePreview] =
    useState(
      form.image instanceof File
        ? URL.createObjectURL(form.image)
        : form.image
    );

  useEffect(() => {
    if (form.image instanceof File) {
      const url = URL.createObjectURL(
        form.image
      );

      setImagePreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setImagePreview(form.image || "");
  }, [form.image]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              {editingCategory
                ? "Edit Category"
                : "Create Category"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {editingCategory
                ? "Update category and SEO information"
                : "Create a new blog category"}
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
                  Category Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Basic information about the category.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Input
                  label="Category Name"
                  name="name"
                  value={form.name}
                  onChange={onInputChange}
                  placeholder="Enter category name"
                  required
                />

                <Input
                  label="Slug"
                  name="slug"
                  value={form.slug}
                  onChange={onInputChange}
                  placeholder="enter-category-slug"
                  required
                />

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Image
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
                        alt="Category preview"
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

                {editingCategory &&
                  !(form.image instanceof File) && (
                    <p className="mt-2 text-xs text-gray-400">
                      Select a new image if you want
                      to replace the current image.
                    </p>
                  )}

              </div>

            </section>

            <section className="rounded-xl border border-gray-200 p-5">

              <div className="mb-6">

                <h3 className="text-base font-semibold text-gray-900">
                  SEO Settings
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Configure metadata for search engines
                  and social media.
                </p>

              </div>

              <div className="space-y-6">

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Meta Title
                    </label>

                    <input
                      type="text"
                      maxLength={60}
                      value={
                        form.seo.metaTitle
                      }
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
                        {
                          form.seo
                            .metaTitle
                            .length
                        }
                        /60
                      </span>

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Canonical URL
                    </label>

                    <input
                      type="url"
                      value={
                        form.seo
                          .canonicalUrl
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "canonicalUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/category/slug"
                      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
                    />

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Meta Description
                  </label>

                  <textarea
                    maxLength={160}
                    rows={3}
                    value={
                      form.seo
                        .metaDescription
                    }
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
                      {
                        form.seo
                          .metaDescription
                          .length
                      }
                      /160
                    </span>

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Keywords
                  </label>

                  <input
                    type="text"
                    value={form.seo.keywords.join(
                      ", "
                    )}
                    onChange={(e) =>
                      onKeywordsChange(
                        e.target.value
                      )
                    }
                    placeholder="protein, whey protein, supplements"
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Separate keywords using commas.
                  </p>

                  {form.seo.keywords.length >
                    0 && (
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

                <div className="border-t border-gray-200 pt-6">

                  <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    Open Graph
                  </h4>

                  <div className="space-y-4">

                    <Input
                      label="OG Title"
                      value={
                        form.seo.ogTitle
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "ogTitle",
                          e.target.value
                        )
                      }
                      placeholder="Open Graph title"
                    />

                    <TextArea
                      label="OG Description"
                      value={
                        form.seo
                          .ogDescription
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "ogDescription",
                          e.target.value
                        )
                      }
                      placeholder="Open Graph description"
                    />

                    <Input
                      label="OG Image URL"
                      type="url"
                      value={
                        form.seo.ogImage
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "ogImage",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/og-image.jpg"
                    />

                  </div>

                </div>

                <div className="border-t border-gray-200 pt-6">

                  <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    Twitter
                  </h4>

                  <div className="space-y-4">

                    <Input
                      label="Twitter Title"
                      value={
                        form.seo
                          .twitterTitle
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "twitterTitle",
                          e.target.value
                        )
                      }
                      placeholder="Twitter title"
                    />

                    <TextArea
                      label="Twitter Description"
                      value={
                        form.seo
                          .twitterDescription
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "twitterDescription",
                          e.target.value
                        )
                      }
                      placeholder="Twitter description"
                    />

                    <Input
                      label="Twitter Image URL"
                      type="url"
                      value={
                        form.seo
                          .twitterImage
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "twitterImage",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/twitter-image.jpg"
                    />

                  </div>

                </div>

                <div className="border-t border-gray-200 pt-6">

                  <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    Facebook
                  </h4>

                  <div className="space-y-4">

                    <Input
                      label="Facebook Title"
                      value={
                        form.seo
                          .facebookTitle
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "facebookTitle",
                          e.target.value
                        )
                      }
                      placeholder="Facebook title"
                    />

                    <TextArea
                      label="Facebook Description"
                      value={
                        form.seo
                          .facebookDescription
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "facebookDescription",
                          e.target.value
                        )
                      }
                      placeholder="Facebook description"
                    />

                    <Input
                      label="Facebook Image URL"
                      type="url"
                      value={
                        form.seo
                          .facebookImage
                      }
                      onChange={(e) =>
                        onSeoChange(
                          "facebookImage",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/facebook-image.jpg"
                    />

                  </div>

                </div>

              </div>

            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-gray-900">
                    Category Status
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Active categories can be used for
                    publishing blogs.
                  </p>

                </div>

                <label className="relative inline-flex cursor-pointer items-center">

                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={onInputChange}
                    className="peer sr-only"
                  />

                  <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-5" />

                </label>

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
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-black"
      />

    </div>
  );
}