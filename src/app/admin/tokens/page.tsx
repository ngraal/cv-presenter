import TokenGenerator from "@/components/admin/TokenGenerator";

export default function TokensPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Token Management</h1>
      <TokenGenerator />
    </div>
  );
}
