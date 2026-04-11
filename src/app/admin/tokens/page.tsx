import TokenGenerator from "@/components/admin/TokenGenerator";
import TokenVerifier from "@/components/admin/TokenVerifier";

export default function TokensPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Token Management</h1>
      <div className="space-y-8">
        <TokenGenerator />
        <TokenVerifier />
      </div>
    </div>
  );
}
