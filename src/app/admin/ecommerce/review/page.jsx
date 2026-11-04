"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, Upload, X, Search, Loader2 } from "lucide-react";
import { searchProduct, addReview } from "@/apiService/productApi";

export default function ReviewUpdatePage({
  review = null,
  productReview = null,
}) {
  const currentReview = productReview || review;

  const [productQuery, setProductQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [des, setDes] = useState("");
  const [images, setImages] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentReview) return;

    setRating(currentReview?.rating || 5);
    setName(currentReview?.name || "");
    setDes(currentReview?.des || "");

    if (currentReview?.productId) {
      setSelectedProduct(
        typeof currentReview.productId === "object"
          ? currentReview.productId
          : {
              _id: currentReview.productId,
              name: currentReview.productName || "Selected Product",
            }
      );
    }
  }, [currentReview]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!productQuery.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoadingProducts(true);

        const response = await searchProduct(productQuery);

        const data =
          response?.data?.products ||
          response?.data ||
          response?.products ||
          [];

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Product search error:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [productQuery]);

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);

    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);

    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const image = prev[index];

      if (image?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const productId =
      selectedProduct?._id ||
      currentReview?.productId?._id ||
      currentReview?.productId ||
      null;

    if (!productId) {
      setMessage("Product ID is missing.");
      return;
    }

    if (!name.trim()) {
      setMessage("Please enter user name.");
      return;
    }

    if (!des.trim()) {
      setMessage("Please write user review.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const productReview = new FormData();

      productReview.append("productId", String(productId));
      productReview.append("rating", String(rating));
      productReview.append("name", name.trim());
      productReview.append("des", des.trim());

      images.forEach((image) => {
        if (image?.file instanceof File) {
          productReview.append("images", image.file);
        }
      });

      console.log("Product ID:", productId);

      const response = await addReview(
        productId,
        productReview
      );

      if (response?.success) {
        setMessage("Review updated successfully.");
      } else {
        setMessage(
          response?.message || "Failed to update review."
        );
      }
    } catch (error) {
      console.error("Update review error:", error);

      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">
            Customer Reviews
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Update Product Review
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the customer review and product information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
        >
          <div className="space-y-7 p-5 sm:p-8">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product
              </label>

              {selectedProduct ? (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {selectedProduct?.featureImage && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
                        <Image
                          src={selectedProduct.featureImage}
                          alt={
                            selectedProduct.name || "Product"
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {selectedProduct.name ||
                          selectedProduct.title ||
                          "Selected Product"}
                      </p>

                      {selectedProduct._id && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Product ID: {selectedProduct._id}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductQuery("");
                    }}
                    className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) =>
                      setProductQuery(e.target.value)
                    }
                    placeholder="Search product..."
                    className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                  {loadingProducts && (
                    <Loader2
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  )}

                  {products.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-72 overflow-auto rounded-2xl border border-border bg-card p-2 shadow-xl">
                      {products.map((product) => (
                        <button
                          type="button"
                          key={product._id}
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductQuery("");
                            setProducts([]);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-muted"
                        >
                          {product.featureImage && (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border">
                              <Image
                                src={product.featureImage}
                                alt={
                                  product.name || "Product"
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {product.name ||
                                product.title ||
                                "Unnamed Product"}
                            </p>

                            {product._id && (
                              <p className="text-xs text-muted-foreground">
                                ID: {product._id}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {productQuery &&
                    !loadingProducts &&
                    products.length === 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground shadow-xl">
                        No products found
                      </div>
                    )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold">
                Rating
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRating(value)}
                    className="rounded-xl p-1 transition hover:scale-105"
                    aria-label={`${value} star`}
                  >
                    <Star
                      size={32}
                      className={
                        value <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }
                    />
                  </button>
                ))}

                <span className="ml-2 text-sm font-medium">
                  {rating}/5
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                User Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter user name"
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                User Review
              </label>

              <textarea
                value={des}
                onChange={(e) => setDes(e.target.value)}
                placeholder="Write your experience with this product..."
                rows={6}
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <div className="mt-2 text-right text-xs text-muted-foreground">
                {des.length} characters
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Add Photos
              </label>

              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background px-5 py-6 text-center transition hover:border-primary hover:bg-primary/[0.03]">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload size={22} />
                </div>

                <span className="text-sm font-semibold">
                  Upload product photos
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG or WEBP
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-background"
                    >
                      <Image
                        src={image.url}
                        alt={`Review image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  message
                    .toLowerCase()
                    .includes("success")
                    ? "border-green-500/20 bg-green-500/10 text-green-600"
                    : "border-red-500/20 bg-red-500/10 text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-muted/20 p-5 sm:px-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Updating Review..."
                : "Update Review"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}