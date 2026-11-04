"use client";

import {
  getContact,
  updateContact,
  deleteContact,
} from "@/apiService/contactApi.js";

import { useEffect, useState } from "react";

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response = await getContact();

      const data = response?.data || response;

      if (data?.success) {
        setContacts(data?.contacts || []);

        setPagination({
          page: data?.pagination?.page || 1,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
        });
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
  };

  const handleStatusChange = async (contact) => {
    try {
      setUpdatingId(contact._id);

      const newStatus = !contact.status;

      await updateContact(contact._id,newStatus);

      setContacts((prev) =>
        prev.map((item) =>
          item._id === contact._id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update contact status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteContact(id);

      setContacts((prev) => prev.filter((item) => item._id !== id));

      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    } finally {
      setDeletingId(null);
    }
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

  const getInitials = (name = "") => {
    const words = name.trim().split(" ").filter(Boolean);

    if (words.length === 0) return "C";

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Contacts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer contact enquiries
            </p>
          </div>

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
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  All Contacts
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage customer enquiries
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {pagination.total}{" "}
                {pagination.total === 1 ? "contact" : "contacts"}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : contacts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Phone
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Message
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {contacts.map((contact) => (
                      <tr
                        key={contact._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                              {getInitials(contact.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {contact.name || "-"}
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {contact.email || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-700">
                            {contact.phone || "-"}
                          </span>
                        </td>

                        <td className="max-w-[180px] px-5 py-4">
                          <p
                            className="truncate text-sm font-medium text-gray-800"
                            title={contact.subject || ""}
                          >
                            {contact.subject || "-"}
                          </p>
                        </td>

                        <td className="max-w-[280px] px-5 py-4">
                          <p
                            className="line-clamp-2 text-sm text-gray-600"
                            title={contact.message || ""}
                          >
                            {contact.message || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={contact.status} />
                        </td>

                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap text-sm text-gray-600">
                            {formatDate(contact.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedContact(contact)
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                              title="View"
                            >
                              <EyeIcon />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(contact)
                              }
                              disabled={updatingId === contact._id}
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                              title={
                                contact.status
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              {updatingId === contact._id ? (
                                <Spinner />
                              ) : contact.status ? (
                                <ToggleOffIcon />
                              ) : (
                                <ToggleOnIcon />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(contact._id)
                              }
                              disabled={deletingId === contact._id}
                              className="rounded-lg border border-red-100 bg-white p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === contact._id ? (
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
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {getInitials(contact.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {contact.name || "-"}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {contact.email || "-"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={contact.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoItem
                        label="Phone"
                        value={contact.phone}
                      />

                      <InfoItem
                        label="Subject"
                        value={contact.subject}
                      />

                      <InfoItem
                        label="Date"
                        value={formatDate(contact.createdAt)}
                      />

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Message
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                          {contact.message || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedContact(contact)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <EyeIcon />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(contact)
                        }
                        disabled={updatingId === contact._id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        {updatingId === contact._id ? (
                          <Spinner />
                        ) : contact.status ? (
                          <ToggleOffIcon />
                        ) : (
                          <ToggleOnIcon />
                        )}

                        {contact.status
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(contact._id)
                        }
                        disabled={deletingId === contact._id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === contact._id ? (
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
                <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of{" "}
                    {pagination.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400"
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

      {selectedContact && (
        <ContactViewModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          formatDateTime={formatDateTime}
        />
      )}
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

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-gray-700">
        {value || "-"}
      </p>
    </div>
  );
}

function ContactViewModal({
  contact,
  onClose,
  formatDateTime,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View customer enquiry details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="mb-5 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-700 shadow-sm">
              {getInitials(contact.name)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {contact.name || "-"}
              </h3>

              <p className="truncate text-sm text-gray-500">
                {contact.email || "-"}
              </p>
            </div>

            <div className="ml-auto">
              <StatusBadge status={contact.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <DetailItem
              label="Name"
              value={contact.name}
            />

            <DetailItem
              label="Email"
              value={contact.email}
            />

            <DetailItem
              label="Phone"
              value={contact.phone}
            />

            <DetailItem
              label="Subject"
              value={contact.subject}
            />

            <DetailItem
              label="Created At"
              value={formatDateTime(contact.createdAt)}
            />

            <DetailItem
              label="Updated At"
              value={formatDateTime(contact.updatedAt)}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-gray-900">
              Message
            </p>

            <div className="min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {contact.message || "No message available."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Spinner />
        Loading contacts...
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <MailIcon />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        No contacts found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Customer contact enquiries will appear here.
      </p>
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

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="12" cy="12" r="2.5" />
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
        d="M6 6l12 12M18 6L6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-6 w-6 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path
        d="m3 7 9 6 9-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name = "") {
  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) return "C";

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}