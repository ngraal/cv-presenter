import CVEditorForm from "@/components/admin/CVEditorForm";
import PDFUpload from "@/components/admin/PDFUpload";

export default function EditorPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-on-surface">CV Editor</h1>

      {/* Personal Info, Links, Sections, Skills + Save */}
      <CVEditorForm />

      {/* PDF Documents — full width at the bottom */}
      <PDFUpload />
    </div>
  );
}
