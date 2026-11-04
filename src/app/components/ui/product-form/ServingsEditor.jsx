// "use client";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Plus, X } from "lucide-react";

// export default function ServingsEditor({ servings, onChange }) {
//   function updateRow(index, field, value) {
//     const next = [...servings];
//     next[index] = { ...next[index], [field]: value };
//     onChange(next);
//   }

//   function addRow() {
//     onChange([...servings, { size: "", price: "" }]);
//   }

//   function removeRow(index) {
//     onChange(servings.filter((_, i) => i !== index));
//   }

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <label className="text-sm font-medium">Servings</label>
//         <Button type="button" size="sm" variant="outline" onClick={addRow}>
//           <Plus size={14} className="mr-1" /> Add Serving
//         </Button>
//       </div>

//       {servings.map((s, i) => (
//         <div key={i} className="flex gap-2 items-center">
//           <Input
//             placeholder="Size (e.g. 35)"
//             value={s.size}
//             onChange={(e) => updateRow(i, "size", e.target.value)}
//           />
//           <Input
//             placeholder="Price"
//             type="number"
//             value={s.price}
//             onChange={(e) => updateRow(i, "price", e.target.value)}
//           />
//           <Button type="button" size="icon" variant="ghost" onClick={() => removeRow(i)}>
//             <X size={16} className="text-red-500" />
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// }