"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function StringListEditor({ label, items, onChange, placeholder }) {
  function updateItem(index, value) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus size={14} className="mr-1" /> Add
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-slate-400">No items yet.</p>
      )}

      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(e) => updateItem(i, e.target.value)}
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(i)}>
            <X size={16} className="text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}