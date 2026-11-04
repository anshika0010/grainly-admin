"use client";

import {
  getInstagramPost,
  createInstagram,
  updateInstagram,
  deleteInstagram,
} from "@/apiService/instagramApi";

import { useEffect, useState } from "react";

export default function InstagramPost() {
  const [posts, setPosts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [form, setForm] = useState({
    link: "",
    status: true,
  });

  const handleGetInstaPost = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getInstagramPost(page);

      const data = response?.data || response;

      if (data?.success) {
        setPosts(data?.posts || []);

        setPagination({
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
        });
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error:", err?.message);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleGetInstaPost();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleGetInstaPost(pagination.page);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = () => {
    setEditingPost(null);

    setForm({
      link: "",
      status: true,
    });

    setShowModal(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);

    setForm({
      link: post?.link || "",
      status: Boolean(post?.status),
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPost(null);

    setForm({
      link: "",
      status: true,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.link.trim()) {
      alert("Please enter Instagram post link");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        link: form.link.trim(),
        status: form.status,
      };

      if (editingPost?._id) {
        await updateInstagram(editingPost._id, payload);
      } else {
        await createInstagram(payload);
      }

      setShowModal(false);
      setEditingPost(null);

      setForm({
        link: "",
        status: true,
      });

      await handleGetInstaPost(pagination.page);
    } catch (err) {
      console.error("Save Instagram post error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (post) => {
    try {
      setUpdatingId(post._id);

      const newStatus = !post.status;

      await updateInstagram(post._id, {
        link: post.link,
        status: newStatus,
      });

      setPosts((prev) =>
        prev.map((item) =>
          item._id === post._id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Status update error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Instagram post?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteInstagram(id);

      const remainingPosts = posts.filter(
        (post) => post._id !== id
      );

      setPosts(remainingPosts);

      if (remainingPosts.length === 0 && pagination.page > 1) {
        await handleGetInstaPost(pagination.page - 1);
      } else {
        await handleGetInstaPost(pagination.page);
      }
    } catch (err) {
      console.error("Delete error:", err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete Instagram post"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrevious = () => {
    if (pagination.page <= 1) return;

    handleGetInstaPost(pagination.page - 1);
  };

  const handleNext = () => {
    if (pagination.page >= pagination.totalPages) return;

    handleGetInstaPost(pagination.page + 1);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Instagram Posts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage Instagram post links
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
            >
              <PlusIcon />
              Add Post
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Instagram Posts
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage your Instagram post links and status
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {pagination.total}{" "}
              {pagination.total === 1 ? "post" : "posts"}
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : posts.length === 0 ? (
            <EmptyState onAdd={handleCreate} />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        #
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Instagram Link
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Updated
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {posts.map((post, index) => (
                      <tr
                        key={post._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-500">
                            {(pagination.page - 1) *
                              pagination.limit +
                              index +
                              1}
                          </span>
                        </td>

                        <td className="max-w-[500px] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <InstagramIcon />
                            </div>

                            <div className="min-w-0">
                              <a
                                href={post.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-sm font-medium text-gray-800 hover:text-gray-900 hover:underline"
                                title={post.link}
                              >
                                {post.link || "-"}
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={post.status} />
                        </td>

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-sm text-gray-600">
                            {formatDate(post.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-sm text-gray-600">
                            {formatDate(post.updatedAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={post.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                              title="Open Instagram"
                            >
                              <ExternalLinkIcon />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleEdit(post)}
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                              title="Edit"
                            >
                              <EditIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(post)
                              }
                              disabled={
                                updatingId === post._id
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                              title={
                                post.status
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              {updatingId === post._id ? (
                                <Spinner />
                              ) : post.status ? (
                                <ToggleOffIcon />
                              ) : (
                                <ToggleOnIcon />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(post._id)
                              }
                              disabled={
                                deletingId === post._id
                              }
                              className="rounded-lg border border-red-100 bg-white p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === post._id ? (
                                <Spinner />
                              ) : (
                                <TrashIcon />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {posts.map((post, index) => (
                  <div
                    key={post._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <InstagramIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="mb-1 text-xs text-gray-400">
                            Post #
                            {(pagination.page - 1) *
                              pagination.limit +
                              index +
                              1}
                          </p>

                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-sm font-medium text-gray-800 hover:underline"
                          >
                            {post.link || "-"}
                          </a>
                        </div>
                      </div>

                      <StatusBadge status={post.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Created
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Updated
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          {formatDate(post.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <ExternalLinkIcon />
                        Open
                      </a>

                      <button
                        type="button"
                        onClick={() => handleEdit(post)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <EditIcon />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(post)
                        }
                        disabled={updatingId === post._id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        {updatingId === post._id ? (
                          <Spinner />
                        ) : post.status ? (
                          <ToggleOffIcon />
                        ) : (
                          <ToggleOnIcon />
                        )}

                        {post.status
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(post._id)
                        }
                        disabled={deletingId === post._id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === post._id ? (
                          <Spinner />
                        ) : (
                          <TrashIcon />
                        )}

                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Showing page {pagination.page} of{" "}
                    {pagination.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={
                        pagination.page <= 1 || loading
                      }
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-900 px-3 text-sm font-medium text-white">
                      {pagination.page}
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        pagination.page >=
                          pagination.totalPages ||
                        loading
                      }
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <InstagramModal
          form={form}
          editingPost={editingPost}
          saving={saving}
          onChange={handleInputChange}
          onClose={handleCloseModal}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

function InstagramModal({
  form,
  editingPost,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingPost
                ? "Edit Instagram Post"
                : "Add Instagram Post"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingPost
                ? "Update Instagram post details"
                : "Add a new Instagram post link"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Instagram Post Link
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="link"
                value={form.link}
                onChange={onChange}
                placeholder="https://www.instagram.com/p/..."
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Enter the complete Instagram post URL.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Post Status
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {form.status
                      ? "This post is currently active."
                      : "This post is currently inactive."}
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={onChange}
                  className="peer sr-only"
                />

                <div
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.status
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      form.status
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </div>
              </label>
            </div>

            {editingPost && (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-xs text-gray-400">
                  Post ID
                </p>

                <p className="mt-1 break-all text-xs font-medium text-gray-600">
                  {editingPost._id}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Spinner />}

              {saving
                ? "Saving..."
                : editingPost
                ? "Update Post"
                : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        status
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      {status ? "Active" : "Inactive"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Spinner />
        Loading Instagram posts...
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <InstagramIcon />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        No Instagram posts found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Add your first Instagram post link to display it here.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        <PlusIcon />
        Add Post
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon({ className = "" }) {
  return (
    <svg
      className={`h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M3 4v7h7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 13a8.1 8.1 0 0 0 14.9 3L21 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M21 20v-7h-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 5v14M5 12h14"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      className="h-5 w-5 text-gray-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M14 5h5v5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10 14 19 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 20h9"
        strokeLinecap="round"
      />

      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M4 7h16"
        strokeLinecap="round"
      />

      <path
        d="M10 11v6M14 11v6"
        strokeLinecap="round"
      />

      <path
        d="M6 7l1 13h10l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 7V4h6v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToggleOnIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="5"
      />

      <circle cx="16" cy="12" r="2.5" />
    </svg>
  );
}

function ToggleOffIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="10"
        rx="5"
      />

      <circle cx="8" cy="12" r="2.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}