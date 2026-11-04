"use client";

import {
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/apiService/bannerApi.js";

import { useEffect, useState } from "react";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState(getInitialForm());

  function getInitialForm(banner = null) {
    return {
      title: banner?.title || "",
      tag: banner?.tag || "",
      shortdes: banner?.shortdes || "",
      link: banner?.link || "",
      status: banner?.status ?? true,

      desktopImg: banner?.desktopImg || "",
      mobileImg: banner?.mobileImg || "",
    };
  }

  const handleGetBanner = async () => {
    try {
      setLoading(true);

      const response = await getBanner();

      const data = response?.data || response;

      setBanners(data?.banners || []);

      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Get banner error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to load banners"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetBanner();
  }, []);

  const handleCreate = () => {
    setEditingBanner(null);
    setForm(getInitialForm());
    setShowModal(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setForm(getInitialForm(banner));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingBanner(null);
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

  const handleDesktopImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid desktop image.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      desktopImg: file,
    }));
  };

  const handleMobileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid mobile image.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      mobileImg: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Please enter banner title.");
      return;
    }

    if (!form.tag.trim()) {
      alert("Please enter banner tag.");
      return;
    }

    if (!form.shortdes.trim()) {
      alert("Please enter short description.");
      return;
    }

    if (!form.link.trim()) {
      alert("Please enter banner link.");
      return;
    }

    if (
      !editingBanner &&
      !(form.desktopImg instanceof File)
    ) {
      alert("Please select desktop image.");
      return;
    }

    if (
      !editingBanner &&
      !(form.mobileImg instanceof File)
    ) {
      alert("Please select mobile image.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("tag", form.tag);
      formData.append("shortdes", form.shortdes);
      formData.append("link", form.link);
      formData.append(
        "status",
        String(form.status)
      );

      if (form.desktopImg instanceof File) {
        formData.append(
          "desktopImg",
          form.desktopImg
        );
      }

      if (form.mobileImg instanceof File) {
        formData.append(
          "mobileImg",
          form.mobileImg
        );
      }

      let response;

      if (editingBanner?._id) {
        response = await updateBanner(
          editingBanner._id,
          formData
        );
      } else {
        response = await createBanner(formData);
      }

      const responseData =
        response?.data?.banner ||
        response?.banner ||
        response?.data;

      if (editingBanner?._id) {
        setBanners((prev) =>
          prev.map((banner) =>
            banner._id === editingBanner._id
              ? {
                  ...banner,
                  ...(responseData || {}),
                }
              : banner
          )
        );
      } else if (responseData) {
        setBanners((prev) => [
          responseData,
          ...prev,
        ]);
      }

      setShowModal(false);
      setEditingBanner(null);
      setForm(getInitialForm());

      await handleGetBanner();
    } catch (error) {
      console.error(
        "Save banner error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save banner."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await deleteBanner(id);

      setBanners((prev) =>
        prev.filter(
          (banner) => banner._id !== id
        )
      );

      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (error) {
      console.error(
        "Delete banner error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete banner."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-6">
      <div className="mx-auto max-w-[1600px]">

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Banner Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage website banners.
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

            Create Banner
          </button>

        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            title="Total Banners"
            value={pagination.total}
            icon="▣"
          />

          <StatCard
            title="Active"
            value={
              banners.filter(
                (banner) =>
                  banner.status === true
              ).length
            }
            icon="✓"
          />

          <StatCard
            title="Inactive"
            value={
              banners.filter(
                (banner) =>
                  banner.status === false
              ).length
            }
            icon="◷"
          />

        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                All Banners
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {pagination.total} banner
                {pagination.total === 1
                  ? ""
                  : "s"} found
              </p>
            </div>

            <button
              type="button"
              onClick={handleGetBanner}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <LoadingState />
          ) : banners.length === 0 ? (
            <EmptyState
              onCreate={handleCreate}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Banner
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tag
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description
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

                  {banners.map((banner) => (

                    <tr
                      key={banner._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-4">

                          <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">

                            {banner.desktopImg ? (
                              <img
                                src={
                                  banner.desktopImg
                                }
                                alt={
                                  banner.title ||
                                  "Banner"
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <h3 className="max-w-[300px] truncate text-sm font-semibold text-gray-900">
                              {banner.title}
                            </h3>

                            <p className="mt-1 max-w-[300px] truncate text-xs text-gray-500">
                              {banner.shortdes}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-400">
                              Mobile image available
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {banner.tag || "-"}
                        </span>

                      </td>

                      <td className="max-w-[300px] px-5 py-4">

                        <p className="truncate text-sm text-gray-700">
                          {banner.link || "-"}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        {banner.status ? (
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
                            banner.updatedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatTime(
                            banner.updatedAt
                          )}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                banner
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
                                banner._id
                              )
                            }
                            disabled={
                              deleteLoading ===
                              banner._id
                            }
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleteLoading ===
                            banner._id
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

          {!loading &&
            banners.length > 0 &&
            pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">

                <p className="text-xs text-gray-500">
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </p>

                <div className="flex gap-2">

                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1
                    }
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              </div>
            )}

        </div>

      </div>

      {showModal && (
        <BannerModal
          form={form}
          editingBanner={editingBanner}
          saving={saving}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onDesktopImageChange={
            handleDesktopImageChange
          }
          onMobileImageChange={
            handleMobileImageChange
          }
        />
      )}

    </div>
  );
}

function BannerModal({
  form,
  editingBanner,
  saving,
  onClose,
  onSubmit,
  onInputChange,
  onDesktopImageChange,
  onMobileImageChange,
}) {
  const [desktopPreview, setDesktopPreview] =
    useState(
      form.desktopImg instanceof File
        ? URL.createObjectURL(
            form.desktopImg
          )
        : form.desktopImg
    );

  const [mobilePreview, setMobilePreview] =
    useState(
      form.mobileImg instanceof File
        ? URL.createObjectURL(
            form.mobileImg
          )
        : form.mobileImg
    );

  useEffect(() => {
    if (form.desktopImg instanceof File) {
      const url = URL.createObjectURL(
        form.desktopImg
      );

      setDesktopPreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setDesktopPreview(
      form.desktopImg || ""
    );
  }, [form.desktopImg]);

  useEffect(() => {
    if (form.mobileImg instanceof File) {
      const url = URL.createObjectURL(
        form.mobileImg
      );

      setMobilePreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }

    setMobilePreview(
      form.mobileImg || ""
    );
  }, [form.mobileImg]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              {editingBanner
                ? "Edit Banner"
                : "Create Banner"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {editingBanner
                ? "Update banner information and images"
                : "Create a new website banner"}
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
                  Banner Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Add the content that will be displayed
                  on the banner.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Input
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={onInputChange}
                  placeholder="Enter banner title"
                  required
                />

                <Input
                  label="Tag"
                  name="tag"
                  value={form.tag}
                  onChange={onInputChange}
                  placeholder="Enter banner tag"
                  required
                />

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Short Description
                </label>

                <textarea
                  name="shortdes"
                  value={form.shortdes}
                  onChange={onInputChange}
                  rows={3}
                  placeholder="Enter short description"
                  className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-black"
                />

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Link
                </label>

                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={onInputChange}
                  placeholder="Enter banner link"
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
                />

              </div>

            </section>

            <section className="rounded-xl border border-gray-200 p-5">

              <div className="mb-6">

                <h3 className="text-base font-semibold text-gray-900">
                  Banner Images
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Upload separate images for desktop
                  and mobile devices.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <ImageUpload
                  label="Desktop Image"
                  name="desktopImg"
                  preview={desktopPreview}
                  file={form.desktopImg}
                  onChange={
                    onDesktopImageChange
                  }
                />

                <ImageUpload
                  label="Mobile Image"
                  name="mobileImg"
                  preview={mobilePreview}
                  file={form.mobileImg}
                  onChange={
                    onMobileImageChange
                  }
                />

              </div>

            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-semibold text-gray-900">
                    Banner Status
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Active banners will be displayed
                    on the website.
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
                : editingBanner
                ? "Update Banner"
                : "Create Banner"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

function ImageUpload({
  label,
  name,
  preview,
  file,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">

        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="block w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-700"
        />

        {preview ? (
          <div className="mt-4">

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              <img
                src={preview}
                alt={`${label} preview`}
                className="h-48 w-full object-cover"
              />

            </div>

            {file instanceof File && (
              <p className="mt-2 truncate text-xs text-gray-500">
                Selected: {file.name}
              </p>
            )}

          </div>
        ) : (
          <div className="mt-4 flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white">

            <div className="text-center">

              <div className="text-3xl text-gray-300">
                ▣
              </div>

              <p className="mt-2 text-xs text-gray-400">
                No image selected
              </p>

            </div>

          </div>
        )}

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

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

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
          Loading banners...
        </p>

      </div>

    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
        ▣
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        No banners found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Create your first banner to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Create Banner
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