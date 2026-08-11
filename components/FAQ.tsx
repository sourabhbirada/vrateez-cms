"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Search, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";

type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
};

export default function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "General", sortOrder: 0, isActive: true });

  const loadFaqs = async () => {
    const data = await apiFetch<{ items: FaqItem[] }>("/faqs/admin");
    setFaqs(data.items);
  };

  useEffect(() => {
    void loadFaqs();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
    return values.length ? values : ["General"];
  }, [faqs]);

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const startNew = () => {
    setEditId(null);
    setForm({ question: "", answer: "", category: "General", sortOrder: 0, isActive: true });
    setShowForm(true);
  };

  const handleEdit = (faq: FaqItem) => {
    setEditId(faq._id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sortOrder: faq.sortOrder || 0,
      isActive: faq.isActive,
    });
    setShowForm(true);
  };

  const saveFaq = async () => {
    if (editId) {
      await apiFetch(`/faqs/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
    } else {
      await apiFetch("/faqs", { method: "POST", body: JSON.stringify(form) });
    }
    setShowForm(false);
    setEditId(null);
    await loadFaqs();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">FAQ Management</h1>
          <p className="text-sm text-muted mt-1">{faqs.length} questions across {categories.length} categories</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Question
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-white shadow-sm"
                : "bg-card border border-border text-stone-600 hover:border-stone-300"
            }`}
          >
            {cat}
            <span className="ml-1.5 text-xs opacity-70">
              ({cat === "All" ? faqs.length : faqs.filter((f) => f.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 animate-fadeIn">
          <h2 className="text-base font-semibold text-stone-900 mb-4">{editId ? "Edit FAQ" : "New FAQ"}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Question</label>
                <input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Enter the question..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Answer</label>
              <textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Detailed answer..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"></textarea>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="flex items-center gap-2">
                <input id="faq-active" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-border" />
                <label htmlFor="faq-active" className="text-sm text-stone-700">Visible on site</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={saveFaq} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">{editId ? "Update Question" : "Save Question"}</button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors text-stone-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {filtered.map((faq) => (
          <div key={faq._id} className="bg-card rounded-xl border border-border overflow-hidden group">
            <button
              onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-surface/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium shrink-0">{faq.category}</span>
                <h3 className="text-sm font-medium text-stone-800 truncate">{faq.question}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await apiFetch(`/faqs/${faq._id}`, { method: "PATCH", body: JSON.stringify({ isActive: !faq.isActive }) });
                    await loadFaqs();
                  }}
                  className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-stone-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {faq.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(faq); }} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <Edit size={15} />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await apiFetch(`/faqs/${faq._id}`, { method: "DELETE" });
                    await loadFaqs();
                  }}
                  className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
                {expandedId === faq._id ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
              </div>
            </button>
            {expandedId === faq._id && (
              <div className="px-5 pb-5 pt-0 text-sm text-stone-600 leading-relaxed border-t border-border bg-surface/20 animate-fadeIn">
                <p className="pt-4">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
