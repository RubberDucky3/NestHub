import { insertStickyNoteSchema } from "../shared/schema";
try {
  const result = insertStickyNoteSchema.parse({
    content: "Test note",
    color: "yellow",
    x: 150,
    y: 150
  });
  console.log("Success:", result);
} catch (err: any) {
  console.log("Zod Error:", err.errors || err);
}
