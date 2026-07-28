"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { API_BASE_URL } from "@/lib/auth";

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" ? (value as ApiRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function asBoolean(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
}

function pickList(data: unknown): ApiRecord[] {
  if (Array.isArray(data)) return data.map(asRecord);

  const root = asRecord(data);
  const nested = asRecord(root.data);

  if (nested.banner && typeof nested.banner === "object") {
    return [asRecord(nested.banner)];
  }
  if (root.banner && typeof root.banner === "object") {
    return [asRecord(root.banner)];
  }
  if (nested._id || nested.id || nested.product_name || nested.title) {
    return [nested];
  }

  const keys = ["data", "banners", "upcoming", "items", "results"];
  for (const key of keys) {
    const rootValue = root[key];
    if (Array.isArray(rootValue)) return rootValue.map(asRecord);

    const nestedValue = nested[key];
    if (Array.isArray(nestedValue)) return nestedValue.map(asRecord);
  }

  if (root._id || root.id || root.product_name) {
    return [root];
  }

  return [];
}

function toDateInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function toTimeInput(value: string): string {
  if (!value) return "";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
}

function ComingProductFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [sectionLabel, setSectionLabel] = useState("COMING SOON");
  const [productTitle, setProductTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("Honey");
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [buttonText, setButtonText] = useState("Pre Order Now");
  const [buttonLink, setButtonLink] = useState("/shop");
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(editId));
  const [message, setMessage] = useState("");

  const isEditMode = Boolean(editId);
  const previewDate = useMemo(() => {
    if (!launchDate) return "Launch date";
    return new Date(`${launchDate}T${launchTime || "00:00"}`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [launchDate, launchTime]);

  useEffect(() => {
    if (!editId) return;

    const loadBanner = async () => {
      setFetching(true);
      setMessage("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/upcoming/all-banners`, {
          credentials: "include",
        });
        const data: unknown = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(asString(asRecord(data).message) || "Failed to load coming product");
        }

        const banner = pickList(data).find((item) => {
          return (
            asString(item._id) === editId ||
            asString(item.id) === editId ||
            asString(item.bannerId) === editId
          );
        });

        if (!banner) throw new Error("Coming product not found");

        const imageRecord = asRecord(banner.image);
        const image =
          asString(banner.banner_image) ||
          asString(banner.image) ||
          asString(banner.image_url) ||
          asString(banner.imageUrl) ||
          asString(banner.productImage) ||
          asString(imageRecord.url) ||
          asString(imageRecord.path) ||
          asString(imageRecord.location);

        setImagePreview(normalizeImageUrl(image));
        setSectionLabel(asString(banner.tag) || asString(banner.sectionLabel) || asString(banner.section_label) || "COMING SOON");
        setProductTitle(
          asString(banner.product_name) ||
            asString(banner.productName) ||
            asString(banner.productTitle) ||
            asString(banner.title)
        );
        setShortDescription(
          asString(banner.product_description) ||
            asString(banner.shortDescription) ||
            asString(banner.short_description) ||
            asString(banner.description) ||
            asString(banner.subtitle)
        );
        setCategory(asString(banner.categoryName) || asString(banner.category) || "Honey");
        setLaunchDate(toDateInput(asString(banner.launch_date) || asString(banner.launchDate)));
        setLaunchTime(toTimeInput(asString(banner.launch_time) || asString(banner.launchTime)));
        setButtonLink(asString(banner.pre_order_url) || asString(banner.buttonLink) || asString(banner.button_link) || "/shop");
        setVisible(asBoolean(banner.isActive ?? banner.isVisible ?? banner.visible ?? banner.showOnHomepage, true));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to load coming product");
      } finally {
        setFetching(false);
      }
    };

    void loadBanner();
  }, [editId]);

  const handleImageChange = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!productTitle.trim()) {
      setMessage("Product title is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      if (editId) {
        formData.append("bannerId", editId);
        formData.append("_id", editId);
        formData.append("id", editId);
      }
      if (imageFile) formData.append("image", imageFile);

      // Backend API Fields mapping
      formData.append("title", "Upcoming Product");
      formData.append("subtitle", shortDescription.trim() || "Something sweet is on the way");
      formData.append("tag", sectionLabel.trim());
      formData.append("product_name", productTitle.trim());
      formData.append("productName", productTitle.trim());
      formData.append("product_description", shortDescription.trim());
      formData.append("shortDescription", shortDescription.trim());
      
      const fullLaunchDateTime = launchDate 
        ? new Date(`${launchDate}T${launchTime || "00:00"}`).toISOString() 
        : new Date().toISOString();

      formData.append("launch_date", fullLaunchDateTime);
      formData.append("launchDate", fullLaunchDateTime);
      formData.append("pre_order_url", buttonLink.trim());
      formData.append("buttonLink", buttonLink.trim());
      formData.append("isActive", String(publish && visible));
      formData.append("isVisible", String(visible));
      formData.append("status", publish && visible ? "Active" : "Draft");

      const res = await fetch(`${API_BASE_URL}/api/upcoming/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(asString(asRecord(data).message) || "Save failed");
      }

      router.push("/website-content/coming-product");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="animate-spin text-[#D97706]" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 text-slate-900">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Coming Soon Section
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Manage the homepage Coming Soon section.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3 text-xs font-bold text-slate-600">
            Website Preview
          </div>
          <div className="grid gap-8 bg-[#FFF9EC] px-8 py-9 md:grid-cols-[260px_1fr] md:items-center">
            <div className="h-28 w-full overflow-hidden rounded-sm bg-white shadow-xl md:w-48">
              {imagePreview ? (
                <img src={imagePreview} alt="Coming product preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <ImageIcon size={30} />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D97706]">
                {sectionLabel || "COMING SOON"}
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900">
                {productTitle || "Upcoming Product"}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {shortDescription || "Something sweet is on the way"}
              </p>
              <p className="mt-5 text-xs font-bold text-slate-500">
                {previewDate} {launchTime ? `at ${launchTime}` : ""}
              </p>
              <button className="mt-6 rounded-lg bg-[#D97706] px-8 py-3 text-sm font-bold text-white">
                {buttonText || "Pre Order Now"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <label className="text-sm font-black text-slate-700">1. Product Image</label>
            <div className="mt-4 flex gap-3">
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Upload size={13} className="mr-1 inline" />
                Replace Image
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
              className="hidden"
            />
          </div>

          <label className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-sm font-black text-slate-700">2. Section Label (Tag)</span>
            <input
              value={sectionLabel}
              onChange={(event) => setSectionLabel(event.target.value)}
              maxLength={20}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
            />
          </label>

          <label className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-sm font-black text-slate-700">3. Product Title</span>
            <input
              value={productTitle}
              onChange={(event) => setProductTitle(event.target.value)}
              maxLength={60}
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
            />
          </label>

          <label className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-sm font-black text-slate-700">4. Short Description</span>
            <textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              maxLength={100}
              rows={4}
              className="mt-4 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-700">5. Countdown Settings</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-xs font-bold text-slate-500">Launch Date</span>
                <input
                  type="date"
                  value={launchDate}
                  onChange={(event) => setLaunchDate(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
                />
              </label>
              <label>
                <span className="text-xs font-bold text-slate-500">Launch Time</span>
                <input
                  type="time"
                  value={launchTime}
                  onChange={(event) => setLaunchTime(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-700">6. Button Settings</h3>
            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-500">Button Text</span>
              <input
                value={buttonText}
                onChange={(event) => setButtonText(event.target.value)}
                maxLength={20}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-bold text-slate-500">Pre Order URL Link</span>
              <input
                value={buttonLink}
                onChange={(event) => setButtonLink(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D97706]"
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-slate-700">7. Visibility</h3>
            <label className="mt-5 flex items-center gap-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={visible}
                onChange={(event) => setVisible(event.target.checked)}
                className="h-4 w-4 accent-[#D97706]"
              />
              Show Section on Homepage (Active)
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/website-content/coming-product")}
            className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-8 py-3 text-sm font-bold text-[#D97706] hover:bg-amber-100 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D97706] px-8 py-3 text-sm font-bold text-white hover:bg-[#B45309] disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
            {isEditMode ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComingProductForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="animate-spin text-[#D97706]" size={30} />
        </div>
      }
    >
      <ComingProductFormInner />
    </Suspense>
  );
}