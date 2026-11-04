"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function FaqsEditor({ faqs, onChange }) {
  function updateRow(index, field, value) {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function addRow() {
    onChange([...faqs, { question: "", answer: "" }]);
  }

  function removeRow(index) {
    onChange(faqs.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">FAQs</label>
        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <Plus size={14} className="mr-1" /> Add FAQ
        </Button>
      </div>

      {faqs.map((f, i) => (
        <div key={i} className="border rounded-md p-3 space-y-2 relative">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => removeRow(i)}
          >
            <X size={16} className="text-red-500" />
          </Button>
          <Input
            placeholder="Question"
            value={f.question}
            onChange={(e) => updateRow(i, "question", e.target.value)}
          />
          <Textarea
            placeholder="Answer"
            value={f.answer}
            onChange={(e) => updateRow(i, "answer", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}