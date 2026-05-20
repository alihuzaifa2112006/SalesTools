"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  DollarSign,
  Clock,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PAYMENT_STATUSES,
  type LeadSource,
  type LeadStatus,
  type PaymentStatus,
} from "@/types";
import { cn, formatCurrency, formatRelativeDate } from "@/lib/utils";

interface Lead {
  _id: string;
  clientName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  source: LeadSource;
  country: string;
  city: string;
  status: LeadStatus;
  totalValue: number;
  paymentReceived: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  nextFollowUpAt?: string;
  lastContactedByName?: string;
  notes?: string;
}

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    source: "",
    status: "",
    paymentStatus: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    clientName: "",
    whatsapp: "",
    phone: "",
    source: "instagram" as LeadSource,
    country: "",
    city: "",
    status: "new" as LeadStatus,
    totalValue: 0,
    paymentReceived: 0,
    notes: "",
    nextFollowUpAt: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filters.country) params.set("country", filters.country);
    if (filters.source) params.set("source", filters.source);
    if (filters.status) params.set("status", filters.status);
    if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);

    try {
      const res = await fetch(`/api/leads?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = selectedLead ? `/api/leads/${selectedLead._id}` : "/api/leads";
    const method = selectedLead ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setSelectedLead(null);
      resetForm();
      fetchLeads();
    }
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      whatsapp: "",
      phone: "",
      source: "instagram",
      country: "",
      city: "",
      status: "new",
      totalValue: 0,
      paymentReceived: 0,
      notes: "",
      nextFollowUpAt: "",
    });
  };

  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setForm({
      clientName: lead.clientName,
      whatsapp: lead.whatsapp || "",
      phone: lead.phone || "",
      source: lead.source,
      country: lead.country,
      city: lead.city,
      status: lead.status,
      totalValue: lead.totalValue,
      paymentReceived: lead.paymentReceived,
      notes: lead.notes || "",
      nextFollowUpAt: lead.nextFollowUpAt
        ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16)
        : "",
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: LeadStatus) => {
    const s = LEAD_STATUSES.find((x) => x.value === status);
    return (
      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", s?.color)}>
        {s?.label}
      </span>
    );
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const s = PAYMENT_STATUSES.find((x) => x.value === status);
    return (
      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", s?.color)}>
        {s?.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Lead Tracker
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage clients from Instagram, Facebook, Google Maps & more
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedLead(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, country, phone..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 border-t border-neutral-100 pt-4">
            <Input
              label="Country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              placeholder="Filter by country"
            />
            <Select
              label="Source"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              options={[{ value: "", label: "All Sources" }, ...LEAD_SOURCES]}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[{ value: "", label: "All Statuses" }, ...LEAD_STATUSES]}
            />
            <Select
              label="Payment"
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters({ ...filters, paymentStatus: e.target.value })
              }
              options={[{ value: "", label: "All Payments" }, ...PAYMENT_STATUSES]}
            />
          </div>
        )}
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Follow-Up
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">
                    No leads found. Add your first lead to get started.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => openEdit(lead)}
                    className="cursor-pointer transition hover:bg-neutral-50/80"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-neutral-900">
                        {lead.clientName}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                        {lead.whatsapp && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {lead.whatsapp}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize text-neutral-600">
                        {lead.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-neutral-600">
                        <MapPin className="h-3 w-3 text-neutral-400" />
                        {lead.city}, {lead.country}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getPaymentBadge(lead.paymentStatus)}
                        <p className="flex items-center gap-1 text-xs text-neutral-500">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(lead.paymentReceived)} /{" "}
                          {formatCurrency(lead.totalValue)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.nextFollowUpAt ? (
                        <span className="flex items-center gap-1 text-xs text-neutral-600">
                          <Clock className="h-3 w-3" />
                          {formatRelativeDate(lead.nextFollowUpAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {selectedLead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <Input
                label="Client Name"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="WhatsApp"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <Select
                label="Lead Source"
                value={form.source}
                onChange={(e) =>
                  setForm({ ...form, source: e.target.value as LeadSource })
                }
                options={LEAD_SOURCES}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  required
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as LeadStatus })
                }
                options={LEAD_STATUSES}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Value ($)"
                  type="number"
                  value={form.totalValue}
                  onChange={(e) =>
                    setForm({ ...form, totalValue: Number(e.target.value) })
                  }
                />
                <Input
                  label="Payment Received ($)"
                  type="number"
                  value={form.paymentReceived}
                  onChange={(e) =>
                    setForm({ ...form, paymentReceived: Number(e.target.value) })
                  }
                />
              </div>
              <Input
                label="Next Follow-Up"
                type="datetime-local"
                value={form.nextFollowUpAt}
                onChange={(e) =>
                  setForm({ ...form, nextFollowUpAt: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {selectedLead ? "Update Lead" : "Create Lead"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
