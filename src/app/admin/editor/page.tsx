import CVEditorForm from "@/components/admin/CVEditorForm";
import PDFUpload from "@/components/admin/PDFUpload";
import ProfileImageUpload from "@/components/admin/ProfileImageUpload";

export default function EditorPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">CV Editor</h1>

      {/* Profile Image & PDF side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileImageUpload />
        <PDFUpload />
      </div>

      {/* Personal Info, Links, Experience, Education, Skills + Save */}
      <CVEditorForm />
    </div>
  );
}
