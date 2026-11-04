"use client";

import {
  getBlogs,
  getBlogsById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@/apiService/blogApi";
import { useEffect, useState } from "react";
import BlogModal from "@/app/components/Blog/BlogModal";

const MIN_CONTENT_LENGTH = 100;

function getInitialForm(blog = null) {
  return {
    title: blog?.title || "",
    author: blog?.author?.name || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    category: blog?.category || "Nutrition",
    tags: (blog?.tags || []).join(", "),
    image: blog?.image || "",
    published: blog?.published ?? false,
    featured: blog?.featured ?? false,

    seo: {
      metaTitle: blog?.seo?.metaTitle || "",
      metaDescription: blog?.seo?.metaDescription || "",
      keywords: blog?.seo?.keywords || [],
    },
  };
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const textLength = (html) => html.replace(/<[^>]*>/g, "").trim().length;

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editLoading, setEditLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  // Drafts can't be fetched individually, so their full content isn't available for editing.
  const [contentUnavailable, setContentUnavailable] = useState(false);

  const [form, setForm] = useState(getInitialForm());
  const [initialForm, setInitialForm] = useState(getInitialForm());

  const handleGetBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogs();
      setBlogs(response?.blogs || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetBlog();
  }, []);

  const openModal = (blog, unavailable = false) => {
    const initial = getInitialForm(blog);
    setEditingBlog(blog);
    setContentUnavailable(unavailable);
    setForm(initial);
    setInitialForm(initial);
    setShowModal(true);
  };

  const handleCreate = () => openModal(null);

  const handleEdit = async (blog) => {
    if (!blog.published) {
      openModal(blog, true);
      return;
    }

    try {
      setEditLoading(blog._id);
      const fullBlog = await getBlogsById(blog._id);
      openModal(fullBlog || blog, !fullBlog);
    } catch {
      openModal(blog, true);
    } finally {
      setEditLoading(null);
    }
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingBlog(null);
    setForm(getInitialForm());
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await deleteBlog(id);

      setBlogs((prev) =>
        prev.filter((blog) => blog._id !== id)
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setDeleteLoading(null);
    }
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
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: parseTags(value),
      },
    }));
  };

  const buildPayload = async () => {
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      category: form.category,
      tags: parseTags(form.tags),
      author: { name: form.author.trim() || "Grainly Team" },
      published: form.published,
      featured: form.featured,
      seo: {
        metaTitle: form.seo.metaTitle.trim(),
        metaDescription: form.seo.metaDescription.trim(),
        keywords: form.seo.keywords,
      },
    };

    if (form.image instanceof File) {
      payload.image = await fileToDataUrl(form.image);
    }

    if (!editingBlog) return payload;

    // On update, only send what changed (the list view truncates excerpt and omits content).
    const initial = {
      title: initialForm.title.trim(),
      excerpt: initialForm.excerpt.trim(),
      content: initialForm.content.trim(),
      category: initialForm.category,
      tags: parseTags(initialForm.tags),
      author: { name: initialForm.author.trim() || "Grainly Team" },
      published: initialForm.published,
      featured: initialForm.featured,
      seo: initialForm.seo,
    };

    return Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) =>
          key === "image" ||
          JSON.stringify(value) !== JSON.stringify(initial[key])
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contentChanged = form.content !== initialForm.content;
    const excerptChanged = form.excerpt !== initialForm.excerpt;

    if (!form.title.trim()) {
      alert("Please enter blog title.");
      return;
    }

    if ((!editingBlog || excerptChanged) && !form.excerpt.trim()) {
      alert("Please enter blog excerpt.");
      return;
    }

    if (
      (!editingBlog || contentChanged) &&
      textLength(form.content) < MIN_CONTENT_LENGTH
    ) {
      alert(`Content must be at least ${MIN_CONTENT_LENGTH} characters.`);
      return;
    }

    try {
      setSaving(true);

      const payload = await buildPayload();

      if (editingBlog && Object.keys(payload).length === 0) {
        handleCloseModal();
        return;
      }

      const response = editingBlog
        ? await updateBlog(editingBlog._id, payload)
        : await createBlog(payload);

      const savedBlog = response?.blog;

      if (editingBlog) {
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === editingBlog._id
              ? { ...blog, ...(savedBlog || payload) }
              : blog
          )
        );
      } else if (savedBlog) {
        setBlogs((prev) => [savedBlog, ...prev]);
      }

      setShowModal(false);
      setEditingBlog(null);
      setForm(getInitialForm());
    } catch (error) {
      alert(error.message || "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-6">
      <div className="mx-auto max-w-[1600px]">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blog Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your blogs and SEO information.
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

            Create Blog
          </button>

        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Blogs"
            value={blogs.length}
            icon="📝"
          />

          <StatCard
            title="Published"
            value={
              blogs.filter(
                (blog) => blog.published
              ).length
            }
            icon="✓"
          />

          <StatCard
            title="Draft"
            value={
              blogs.filter(
                (blog) => !blog.published
              ).length
            }
            icon="◷"
          />

          <StatCard
            title="Featured"
            value={
              blogs.filter(
                (blog) => blog.featured
              ).length
            }
            icon="★"
          />

        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Blogs
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {blogs.length} blog
                {blogs.length === 1 ? "" : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetBlog}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <LoadingState />
          ) : blogs.length === 0 ? (
            <EmptyState
              onCreate={handleCreate}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Blog
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Author
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

                  {blogs.map((blog) => (

                    <tr
                      key={blog._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">

                            {blog.image ? (
                              <img
                                src={blog.image}
                                alt={
                                  blog.title ||
                                  "Blog"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                                📝
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <h3 className="max-w-[360px] truncate text-sm font-semibold text-gray-900">
                              {blog.title}
                            </h3>

                            <p className="mt-1 max-w-[360px] truncate text-xs text-gray-500">
                              {blog.excerpt}
                            </p>

                            <p className="mt-1 max-w-[360px] truncate text-[11px] text-gray-400">
                              /{blog.slug}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        {blog.category ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {blog.category}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Category
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-700">
                          {blog.author?.name || "-"}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        {blog.published ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            Draft
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-700">
                          {formatDate(
                            blog.updatedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatTime(
                            blog.updatedAt
                          )}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(blog)
                            }
                            disabled={
                              editLoading ===
                              blog._id
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {editLoading ===
                            blog._id
                              ? "Loading..."
                              : "Edit"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                blog._id
                              )
                            }
                            disabled={
                              deleteLoading ===
                              blog._id
                            }
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteLoading ===
                            blog._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {showModal && (
        <BlogModal
          form={form}
          editingBlog={editingBlog}
          contentUnavailable={contentUnavailable}
          saving={saving}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onSeoChange={handleSeoChange}
          onImageChange={handleImageChange}
          onKeywordsChange={handleKeywordsChange}
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
          Loading blogs...
        </p>

      </div>

    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        📝
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No blogs found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Create your first blog to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Create Blog
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