"use client";

import {getBlogCategory,updateBlogCategory,deleteBlogCategory,createBlogCategory,} from "@/apiService/blogCategory";
import { useEffect, useState } from "react";
import CategoryModal from "@/app/components/BlogCategory/CategoryModel.jsx"

export default function BlogCategory() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(getInitialForm());

  function getInitialForm(category = null) {
    return {
      name: category?.name || "",
      slug: category?.slug || "",
      image: category?.image || "",
      status: category?.status ?? true,

      seo: {
        metaTitle: category?.seo?.metaTitle || "",
        metaDescription:
          category?.seo?.metaDescription || "",
        keywords: category?.seo?.keywords || [],
        canonicalUrl:
          category?.seo?.canonicalUrl || "",

        ogTitle: category?.seo?.ogTitle || "",
        ogDescription:
          category?.seo?.ogDescription || "",
        ogImage: category?.seo?.ogImage || "",

        twitterTitle:
          category?.seo?.twitterTitle || "",
        twitterDescription:
          category?.seo?.twitterDescription || "",
        twitterImage:
          category?.seo?.twitterImage || "",

        facebookTitle:
          category?.seo?.facebookTitle || "",
        facebookDescription:
          category?.seo?.facebookDescription || "",
        facebookImage:
          category?.seo?.facebookImage || "",
      },
    };
  }

  const handleGetCategory = async () => {
    try {
      setLoading(true);

      const response = await getBlogCategory();

      const data = response?.data || response;

      setCategories(data?.categories || []);
    } catch (error) {
      console.error("Get category error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetCategory();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setForm(getInitialForm());
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm(getInitialForm(category));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setForm(getInitialForm());
  };

  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSeoChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleKeywordsChange = (value) => {
    const keywords = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter category name.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Please enter category slug.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("status", String(form.status));

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      formData.append(
        "seo",
        JSON.stringify({
          metaTitle: form.seo.metaTitle,
          metaDescription:
            form.seo.metaDescription,
          keywords: form.seo.keywords,
          canonicalUrl:
            form.seo.canonicalUrl,

          ogTitle: form.seo.ogTitle,
          ogDescription:
            form.seo.ogDescription,
          ogImage: form.seo.ogImage,

          twitterTitle:
            form.seo.twitterTitle,
          twitterDescription:
            form.seo.twitterDescription,
          twitterImage:
            form.seo.twitterImage,

          facebookTitle:
            form.seo.facebookTitle,
          facebookDescription:
            form.seo.facebookDescription,
          facebookImage:
            form.seo.facebookImage,
        })
      );

      let response;

      if (editingCategory?._id) {
        response = await updateBlogCategory(
          editingCategory._id,
          formData
        );
      } else {
        response = await createBlogCategory(
          formData
        );
      }

      const responseData =
        response?.data?.category ||
        response?.category ||
        response?.data;

      if (editingCategory?._id) {
        setCategories((prev) =>
          prev.map((category) =>
            category._id ===
            editingCategory._id
              ? {
                  ...category,
                  ...(responseData || {}),
                }
              : category
          )
        );
      } else if (responseData) {
        setCategories((prev) => [
          responseData,
          ...prev,
        ]);
      }

      setShowModal(false);
      setEditingCategory(null);
      setForm(getInitialForm());

      await handleGetCategory();
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await deleteBlogCategory(id);

      setCategories((prev) =>
        prev.filter(
          (category) => category._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete category."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-6">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blog Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage blog categories.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <span className="text-xl leading-none">
              +
            </span>

            Create Category
          </button>

        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            title="Total Categories"
            value={categories.length}
            icon="▦"
          />

          <StatCard
            title="Active"
            value={
              categories.filter(
                (category) =>
                  category.status === true
              ).length
            }
            icon="✓"
          />

          <StatCard
            title="Inactive"
            value={
              categories.filter(
                (category) =>
                  category.status === false
              ).length
            }
            icon="◷"
          />

        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Categories
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {categories.length} categor
                {categories.length === 1
                  ? "y"
                  : "ies"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetCategory}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <LoadingState />
          ) : categories.length === 0 ? (
            <EmptyState
              onCreate={handleCreate}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Slug
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Updated
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {categories.map(
                    (category) => (
                      <tr
                        key={category._id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">

                              {category.image ? (
                                <img
                                  src={
                                    category.image
                                  }
                                  alt={
                                    category.name ||
                                    "Category"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                                  ▦
                                </div>
                              )}

                            </div>

                            <div>

                              <h3 className="text-sm font-semibold text-gray-900">
                                {category.name}
                              </h3>

                              <p className="mt-1 text-xs text-gray-400">
                                Created{" "}
                                {formatDate(
                                  category.createdAt
                                )}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
                            /{category.slug}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          {category.status ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                              Inactive
                            </span>
                          )}

                        </td>

                        <td className="px-5 py-4">

                          <p className="text-sm text-gray-700">
                            {formatDate(
                              category.updatedAt
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {formatTime(
                              category.updatedAt
                            )}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  category
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  category._id
                                )
                              }
                              disabled={
                                deleteLoading ===
                                category._id
                              }
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleteLoading ===
                              category._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {showModal && (
        <CategoryModal
          form={form}
          categories={categories}
          editingCategory={
            editingCategory
          }
          saving={saving}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onInputChange={
            handleInputChange
          }
          onSeoChange={handleSeoChange}
          onImageChange={
            handleImageChange
          }
          onKeywordsChange={
            handleKeywordsChange
          }
        />
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </h3>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>

      </div>

    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[350px] items-center justify-center">

      <div className="text-center">

        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />

        <p className="text-sm text-gray-500">
          Loading categories...
        </p>

      </div>

    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        ▦
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No categories found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Create your first blog category to get
        started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Create Category
      </button>

    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}