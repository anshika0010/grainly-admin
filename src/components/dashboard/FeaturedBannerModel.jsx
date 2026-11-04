"use client";

import { useEffect, useRef, useState } from "react";
import {
  updateFeaturedBanner,
  createFeaturedBanner,
} from "@/apiService/featuredBanerApi";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

    const objectUrl = URL.createObjectURL(selected);

    setFile(selected);
    setPreviewUrl(objectUrl);
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
  }, [previewUrl]);

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

function ImageDropzone({
  label,
  hint,
  field,
  onError,
  required = false,
}) {
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

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
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
          className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
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
            className="h-36 w-full object-cover"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
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
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [linkType, setLinkType] = useState("product");
  const [buttonText, setButtonText] = useState("");
  const [position, setPosition] = useState("home");
  const [displayOrder, setDisplayOrder] = useState(0);
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
      setSubtitle(banner.subtitle || "");
      setLink(banner.link || "");
      setLinkType(banner.linkType || "product");
      setButtonText(banner.buttonText || "");
      setPosition(banner.position || "home");
      setDisplayOrder(
        Number.isFinite(Number(banner.displayOrder))
          ? Number(banner.displayOrder)
          : 0
      );
      setIsActive(banner.isActive ?? true);

      desktopImage.setInitial(banner.image);
      mobileImage.setInitial(banner.mobileImage);
    } else {
      setTitle("");
      setSubtitle("");
      setLink("");
      setLinkType("product");
      setButtonText("");
      setPosition("home");
      setDisplayOrder(0);
      setIsActive(true);

      desktopImage.reset();
      mobileImage.reset();
    }
  }, [open, banner]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (
      e.target === dialogRef.current &&
      !submitting
    ) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!desktopImage.file && !isEditMode) {
      setError("Desktop image is required.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());

      if (subtitle.trim()) {
        formData.append("subtitle", subtitle.trim());
      }

      if (link.trim()) {
        formData.append("link", link.trim());
      }

      formData.append("linkType", linkType);
      formData.append("position", position);
      formData.append(
        "displayOrder",
        String(displayOrder)
      );
      formData.append("isActive", String(isActive));

      if (buttonText.trim()) {
        formData.append(
          "buttonText",
          buttonText.trim()
        );
      }

      if (desktopImage.file) {
        formData.append("image", desktopImage.file);
      }

      if (mobileImage.file) {
        formData.append(
          "mobileImage",
          mobileImage.file
        );
      }

      let response;

      if (isEditMode) {
        response = await updateFeaturedBanner(
          banner.id,
          formData
        );
      } else {
        response = await createFeaturedBanner(
          formData
        );
      }

      onSaved?.(response?.data || response);
      onClose();
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} banner:`,
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
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
      // onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="banner-modal-title"
    >
      <div className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="flex justify-center pt-2 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="banner-modal-title"
              className="text-base font-semibold text-gray-900 sm:text-lg"
            >
              {isEditMode
                ? "Edit Banner"
                : "Add Banner"}
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Configure banner content and display settings.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
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
          className="flex-1 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="space-y-5">
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Banner Images
                </h3>

                <p className="text-xs text-gray-500">
                  Upload the main banner and an optional mobile version.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageDropzone
                  label="Main image"
                  hint="JPG, PNG or WEBP • Max 5MB"
                  field={desktopImage}
                  onError={setError}
                  required
                />

                <ImageDropzone
                  label="Mobile image"
                  hint="Optional • JPG, PNG or WEBP"
                  field={mobileImage}
                  onError={setError}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="banner-title"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Title
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="banner-title"
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter banner title"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="banner-subtitle"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Subtitle
                </label>

                <input
                  id="banner-subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) =>
                    setSubtitle(e.target.value)
                  }
                  placeholder="Enter optional subtitle"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="banner-link-type"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Link Type
                </label>

                <select
                  id="banner-link-type"
                  value={linkType}
                  onChange={(e) =>
                    setLinkType(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="product">
                    Product
                  </option>
                  <option value="category">
                    Category
                  </option>
                  <option value="subcategory">
                    Subcategory
                  </option>
                  <option value="brand">
                    Brand
                  </option>
                  <option value="collection">
                    Collection
                  </option>
                  <option value="url">
                    URL
                  </option>
                  <option value="none">
                    None
                  </option>
                </select>
              </div>

              <div>
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
                  onChange={(e) =>
                    setLink(e.target.value)
                  }
                  placeholder="e.g. product slug or URL"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="banner-button-text"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Button Text
                </label>

                <input
                  id="banner-button-text"
                  type="text"
                  value={buttonText}
                  onChange={(e) =>
                    setButtonText(e.target.value)
                  }
                  placeholder="e.g. Shop Now"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="banner-position"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Position
                </label>

                <select
                  id="banner-position"
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="home">
                    Home
                  </option>
                  <option value="category">
                    Category
                  </option>
                  <option value="product">
                    Product
                  </option>
                  <option value="shop">
                    Shop
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="banner-display-order"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Display Order
                </label>

                <input
                  id="banner-display-order"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Banner Status
                </p>

                <p className="text-xs text-gray-500">
                  {isActive
                    ? "This banner is visible on the storefront."
                    : "This banner is hidden from the storefront."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsActive((prev) => !prev)
                }
                className={`relative h-6 w-11 cursor-pointer rounded-full transition ${
                  isActive
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle banner status"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    isActive
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}