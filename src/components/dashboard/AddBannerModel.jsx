"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const BANNERS_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/banners/dashboard`;

function useImageField() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef(null);
  const isBlobUrl = useRef(false);

  const validateAndSet = (selected, setError) => {
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    if (isBlobUrl.current && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    isBlobUrl.current = true;
  };

  const setInitial = (url) => {
    if (isBlobUrl.current && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    isBlobUrl.current = false;
    setFile(null);
    setPreviewUrl(url || null);
  };

  const reset = () => {
    if (isBlobUrl.current && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    isBlobUrl.current = false;
    setFile(null);
    setPreviewUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (isBlobUrl.current && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return {
    file,
    previewUrl,
    isDragging,
    setIsDragging,
    inputRef,
    validateAndSet,
    setInitial,
    reset,
  };
}

function ImageDropzone({ label, hint, field, onError }) {
  const {
    previewUrl,
    isDragging,
    setIsDragging,
    inputRef,
    validateAndSet,
    reset,
  } = field;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onError("");

    validateAndSet(e.dataTransfer.files?.[0], onError);
  };

  const handleChange = (e) => {
    onError("");

    validateAndSet(e.target.files?.[0], onError);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            isDragging
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V4m0 0L7 9m5-5 5 5M20 16.5v2.25A1.25 1.25 0 0 1 18.75 20H5.25A1.25 1.25 0 0 1 4 18.75V16.5"
            />
          </svg>

          <p className="text-sm text-gray-600">
            <span className="font-medium text-indigo-600">
              Tap to upload
            </span>{" "}
            <span className="hidden sm:inline">
              or drag and drop
            </span>
          </p>

          <p className="text-xs text-gray-400">{hint}</p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="h-32 w-full object-cover sm:h-36"
          />

          <button
            type="button"
            onClick={reset}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/75"
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function AddBannerModal({
  open,
  onClose,
  onSaved,
  banner,
}) {
  const isEditMode = Boolean(banner?.id);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(1);


  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const desktopImage = useImageField();
  const mobileImage = useImageField();

  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    setError("");
    setSubmitting(false);

    if (banner) {
      setTitle(banner.title || "");
      setLink(banner.link || "");
      setOrder(banner.order ?? 1);

      setIsActive(banner.isActive ?? true);

      desktopImage.setInitial(banner.desktopImage);
      mobileImage.setInitial(banner.mobileImage);
    } else {
      setTitle("");
      setLink("");
      setOrder(1);

      setIsActive(true);

      desktopImage.reset();
      mobileImage.reset();
    }
  }, [open, banner]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Give the banner a title.");
      return;
    }

    if (!link.trim()) {
      setError("Add a link for the banner to point to.");
      return;
    }

    if (!desktopImage.previewUrl) {
      setError("Upload a desktop banner image.");
      return;
    }

    if (!mobileImage.previewUrl) {
      setError("Upload a mobile banner image.");
      return;
    }

    setSubmitting(true);

    try {
      const token = sessionStorage.getItem("pm_admin_token");

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("link", link.trim());
      formData.append("linkType", "product");
      formData.append("order", String(order));

      formData.append("isActive", String(isActive));

      if (desktopImage.file) {
        formData.append(
          "desktopImage",
          desktopImage.file
        );
      }

      if (mobileImage.file) {
        formData.append(
          "mobileImage",
          mobileImage.file
        );
      }

      const response = isEditMode
        ? await axios.put(
            `${BANNERS_BASE_URL}/${banner.id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        : await axios.post(
            BANNERS_BASE_URL,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

      onSaved?.(response.data);

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Couldn't ${
            isEditMode ? "update" : "create"
          } the banner. Try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-banner-title"
    >
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:rounded-2xl">
        <div className="flex justify-center pt-2 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2
            id="add-banner-title"
            className="text-base font-semibold text-gray-900 sm:text-lg"
          >
            {isEditMode ? "Edit banner" : "Add banner"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageDropzone
              label="Desktop image"
              hint="Wide banner, e.g. 1920×600"
              field={desktopImage}
              onError={setError}
            />

            <ImageDropzone
              label="Mobile image"
              hint="Tall banner, e.g. 750×1000"
              field={mobileImage}
              onError={setError}
            />
          </div>

          <div>
            <label
              htmlFor="banner-title"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="banner-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer sale"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div>
              <label
                htmlFor="banner-link-type"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Link type
              </label>

              <p className="mt-3 text-sm text-gray-700">
                Product
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="banner-link"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Link
              </label>

              <input
                id="banner-link"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. warflex"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="banner-order"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Order
              </label>

              <input
                id="banner-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) =>
                  setOrder(Number(e.target.value))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <button
                type="button"
                onClick={() =>
                  setIsActive((prev) => !prev)
                }
                className={`flex h-10 w-full items-center rounded-lg border px-2 transition cursor-pointer ${
                  isActive
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <span
                  className={`h-2.5 w-2 rounded-full mr-1 ${
                    isActive
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />

                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                />
              </svg>
            )}

            {submitting
              ? isEditMode
                ? "Saving..."
                : "Adding..."
              : isEditMode
              ? "Save changes"
              : "Add banner"}
          </button>
        </div>
      </div>
    </div>
  );
}