"use client";

import { useEffect, useState, useRef } from "react";
import {
    getBooking,
    updateBookingStatus,
    searchBooking,
} from "@/apiService/bookingApi.js";

const STATUSES = ["Processing", "Confirm", "Done", "Cancelled", "Reject"];
const LIMIT = 20;

const STATUS_STYLES = {
    Processing: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
    Confirm: { pill: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
    Done: { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
    Cancelled: { pill: "bg-rose-50 text-rose-800 ring-rose-200", dot: "bg-rose-500" },
    Reject: { pill: "bg-rose-50 text-rose-800 ring-rose-200", dot: "bg-rose-500" }
};

const formatCreated = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });

function describeDate(raw) {
    if (!raw) {
        return {
            label: "-",
            hint: "",
            soon: false,
        };
    }

    const [day, month, year] = raw.split("/").map(Number);

    const d = new Date(year, month - 1, day);

    if (
        isNaN(d.getTime()) ||
        d.getDate() !== day ||
        d.getMonth() !== month - 1 ||
        d.getFullYear() !== year
    ) {
        return {
            label: raw,
            hint: "",
            soon: false,
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diff = Math.round(
        (d.getTime() - today.getTime()) / 86400000
    );

    let hint = "";

    if (diff === 0) {
        hint = "Today";
    }
    else if (diff === 1) {
        hint = "Tomorrow";
    }
    else if (diff > 1) {
        hint = `In ${diff} days`;
    }
    else {
        const days = Math.abs(diff);
        hint = `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return {
        label: d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }),
        hint,
        soon: diff >= 0 && diff <= 3,
    };
}

const whatsappLink = (phone) => `https://wa.me/${String(phone).replace(/\D/g, "")}`;

export default function Booking() {
    const [bookings, setBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [updatingId, setUpdatingId] = useState(null);
    const requestId = useRef(0);

    const applyResponse = (res) => {
        setBookings(res?.bookings || []);
        setTotalPages(res?.totalPages || 1);
        setTotal(res?.total || 0);
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2200);
    };

    const loadBookings = async () => {
        const id = ++requestId.current;
        setLoading(true);
        setError("");
        try {
            const res = await getBooking(page, LIMIT);
            if (id === requestId.current) applyResponse(res);
        } catch (err) {
            console.error("Error:", err.message);
            if (id === requestId.current)
                setError("Could not load bookings. Check your connection and try again.");
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    };

    useEffect(() => {
        const term = query.trim();

        if (!term) {
            loadBookings();
            return;
        }

        const timer = setTimeout(async () => {
            const id = ++requestId.current;
            setLoading(true);
            setError("");
            try {
                const res = await searchBooking(term);
                if (id === requestId.current) applyResponse(res);
            } catch (err) {
                console.error("Error:", err.message);
                if (id === requestId.current) setError("Search failed. Try again.");
            } finally {
                if (id === requestId.current) setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, page]);

    const handleStatusChange = async (id, newStatus) => {
        const previous = bookings;
        setUpdatingId(id);
        setBookings((list) => list.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
        try {
            await updateBookingStatus(id, newStatus);
            showToast(`Status changed to ${newStatus}`);
        } catch (err) {
            console.error("Error:", err.message);
            setBookings(previous);
            setError("Could not update status. Try again.");
        } finally {
            setUpdatingId(null);
        }
    };

    const visible = statusFilter === "All" ? bookings : bookings.filter((b) => b.status === statusFilter);
    const searching = query.trim().length > 0;
    const isFiltered = searching || statusFilter !== "All";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {total} {total === 1 ? "booking" : "bookings"} in total
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <svg
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <circle cx="9" cy="9" r="6" />
                            <path d="m14 14 4 4" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search name, phone or venue"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            aria-label="Search bookings"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                    >
                        <span>{error}</span>
                        <button
                            onClick={() => {
                                setError("");
                                loadBookings();
                            }}
                            className="shrink-0 font-semibold underline underline-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] border-collapse text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                                <tr className="border-b border-slate-200">
                                    {["Customer", "Event", "Venue", "Guests", "Flavour", "Addons", "Status", "Booked"].map((h) => (
                                        <th key={h} className="whitespace-nowrap px-4 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : visible.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <EmptyState filtered={isFiltered} onReset={() => { setQuery(""); setStatusFilter("All"); }} />
                                        </td>
                                    </tr>
                                ) : (
                                    visible.map((b) => {
                                        const date = describeDate(b.date);
                                        return (
                                            <tr key={b._id} className="align-top transition-colors hover:bg-slate-50/70">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={b.name} />
                                                        <div>
                                                            <div className="font-semibold">{b.name}</div>
                                                            <ContactLinks phone={b.phone} onCopy={() => showToast("Phone number copied")} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <div className="font-medium">{date.label}</div>
                                                    <div className={`text-xs ${date.soon ? "font-semibold text-violet-700" : "text-slate-500"}`}>
                                                        {date.hint}
                                                    </div>
                                                </td>
                                                <td className="max-w-[220px] px-4 py-4">
                                                    <div className="font-medium">{b.venue}</div>
                                                    <div className="text-xs text-slate-500">{b.address}</div>
                                                </td>
                                                <td className="px-4 py-4 tabular-nums">{b.guestNumber}</td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1.5">
                                                        <Chips items={b.flavour} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1.5">
                                                        <Chips items={b.addon} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusSelect booking={b} busy={updatingId === b._id} onChange={handleStatusChange} />
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                                                    {formatCreated(b.createdAt)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-4 md:hidden">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-48 animate-pulse rounded-2xl bg-slate-200/70"
                            />
                        ))
                    ) : visible.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white">
                            <EmptyState
                                filtered={isFiltered}
                                onReset={() => {
                                    setQuery("");
                                    setStatusFilter("All");
                                }}
                            />
                        </div>
                    ) : (
                        visible.map((b) => {
                            const date = describeDate(b.date);

                            return (
                                <article
                                    key={b._id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="border-b border-slate-100 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <Avatar name={b.name} />

                                                <div className="min-w-0">
                                                    <div className="truncate text-base font-semibold text-slate-900">
                                                        {b.name}
                                                    </div>

                                                    <ContactLinks
                                                        phone={b.phone}
                                                        onCopy={() => showToast("Phone number copied")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                <StatusSelect
                                                    booking={b}
                                                    busy={updatingId === b._id}
                                                    onChange={handleStatusChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <dl className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <dt className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Event
                                                </dt>

                                                <dd className="text-sm font-semibold text-slate-800">
                                                    {date.label}
                                                </dd>

                                                <dd
                                                    className={`mt-0.5 text-xs ${date.soon
                                                            ? "font-semibold text-violet-600"
                                                            : "text-slate-500"
                                                        }`}
                                                >
                                                    {date.hint}
                                                </dd>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <dt className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Guests
                                                </dt>

                                                <dd className="text-sm font-semibold text-slate-800 tabular-nums">
                                                    {b.guestNumber}
                                                </dd>
                                            </div>

                                            <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                                                <dt className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                    Venue
                                                </dt>

                                                <dd className="text-sm font-semibold text-slate-800">
                                                    {b.venue}
                                                </dd>

                                                {b.address && (
                                                    <dd className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                        {b.address}
                                                    </dd>
                                                )}
                                            </div>
                                        </dl>

                                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                                            <div className="p-3.5">
                                                <div className="mb-2.5 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-orange-500" />

                                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                                                        Flavours
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Chips items={b.flavour} />
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100" />

                                            <div className="p-3.5">
                                                <div className="mb-2.5 flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-violet-500" />

                                                    <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                                                        Add-On
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Chips items={b.addon} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">
                                                Booking created
                                            </span>

                                            <span className="text-xs font-medium text-slate-500">
                                                {formatCreated(b.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                {!searching && totalPages > 1 && (
                    <footer className="mt-6 flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-4 font-medium hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="h-10 rounded-lg bg-slate-900 px-4 font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </footer>
                )}
            </div>

            <div
                role="status"
                aria-live="polite"
                className={`pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg transition-all duration-200 ${toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
            >
                {toast}
            </div>
        </div>
    );
}

function StatusSelect({ booking, busy, onChange }) {
    const style = STATUS_STYLES[booking.status] || STATUS_STYLES.Processing;
    return (
        <div className={`relative inline-flex items-center rounded-full ring-1 ${style.pill} ${busy ? "opacity-60" : ""}`}>
            <span className={`pointer-events-none absolute left-3 h-2 w-2 rounded-full ${style.dot}`} />
            <select
                value={booking.status}
                disabled={busy}
                onChange={(e) => onChange(booking._id, e.target.value)}
                aria-label={`Status for ${booking.name}`}
                className="h-8 cursor-pointer appearance-none rounded-full bg-transparent pl-7 pr-7 text-[13px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-wait"
            >
                {STATUSES.map((st) => (
                    <option key={st} value={st}>
                        {st}
                    </option>
                ))}
            </select>
            <svg
                className="pointer-events-none absolute right-2.5 h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="m3 4.5 3 3 3-3" />
            </svg>
        </div>
    );
}

function Avatar({ name }) {
    const initials = (name || "?")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-800">
            {initials}
        </span>
    );
}

function ContactLinks({ phone, onCopy }) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(phone);
            onCopy();
        } catch { }
    };
    return (
        <div className="mt-0.5 flex items-center gap-3 text-xs">
            <a href={`tel:${phone}`} className="text-slate-600 hover:text-violet-700 hover:underline">
                {phone}
            </a>
            <a
                href={whatsappLink(phone)}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-emerald-700 hover:underline"
            >
                WhatsApp
            </a>
            <button onClick={copy} className="text-slate-400 hover:text-slate-700" aria-label="Copy phone number">
                Copy
            </button>
        </div>
    );
}

function Chips({ items, tone = "neutral" }) {
    if (!items || items.length === 0) {
        return <span className="text-xs text-slate-400">-</span>;
    }
    const color =
        tone === "accent" ? "bg-violet-50 text-violet-800 ring-violet-100" : "bg-slate-100 text-slate-700 ring-slate-200";
    return (
        <div className="flex flex-wrap gap-1">
            {items.map((item, i) => (
                <span key={`${item}-${i}`} className={`rounded-md px-2 py-0.5 text-xs ring-1 ${color}`}>
                    {item}
                </span>
            ))}
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {[40, 28, 36, 8, 44, 24, 20].map((w, i) => (
                <td key={i} className="px-4 py-5">
                    <div className="h-4 rounded bg-slate-200" style={{ width: `${w * 2}px`, maxWidth: "100%" }} />
                </td>
            ))}
        </tr>
    );
}

function EmptyState({ filtered, onReset }) {
    return (
        <div className="flex flex-col items-center px-4 py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                {filtered ? "🔍" : "📋"}
            </div>
            <p className="font-semibold">{filtered ? "No bookings found" : "No bookings yet"}</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
                {filtered
                    ? "Try a different name, phone or venue, or clear the filters."
                    : "New bookings will show up here as soon as customers place them."}
            </p>
            {filtered && (
                <button
                    onClick={onReset}
                    className="mt-4 h-9 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
                >
                    Clear search and filters
                </button>
            )}
        </div>
    );
}