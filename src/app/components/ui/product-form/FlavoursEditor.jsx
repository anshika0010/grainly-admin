// "use client";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import StringListEditor from "./StringListEditor";
// import { Plus, X } from "lucide-react";

// export default function FlavoursEditor({ flavours, onChange }) {
//   function updateName(index, value) {
//     const next = [...flavours];
//     next[index] = { ...next[index], name: value };
//     onChange(next);
//   }

//   function updateImages(index, images) {
//     const next = [...flavours];
//     next[index] = { ...next[index], images };
//     onChange(next);
//   }

//   function addFlavour() {
//     onChange([...flavours, { name: "", images: [] }]);
//   }

//   function removeFlavour(index) {
//     onChange(flavours.filter((_, i) => i !== index));
//   }

//   return (
//     <div className="space-y-3">
//       <div className="flex items-center justify-between">
//         <label className="text-sm font-medium">Flavours</label>
//         <Button type="button" size="sm" variant="outline" onClick={addFlavour}>
//           <Plus size={14} className="mr-1" /> Add Flavour
//         </Button>
//       </div>

//       {flavours.map((f, i) => (
//         <div key={i} className="border rounded-md p-3 space-y-3 relative">
//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             className="absolute top-2 right-2"
//             onClick={() => removeFlavour(i)}
//           >
//             <X size={16} className="text-red-500" />
//           </Button>

//           <Input
//             placeholder="Flavour name"
//             value={f.name}
//             onChange={(e) => updateName(i, e.target.value)}
//           />

//           <StringListEditor
//             label="Images"
//             items={f.images}
//             onChange={(images) => updateImages(i, images)}
//             placeholder="/path/to/image.webp"
//           />
//         </div>
//       ))}
//     </div>
//   );
// }