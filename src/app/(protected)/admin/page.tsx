export const metadata = {
  title: 'Admin Dashboard - WaggingTails',
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-main">Admin Dashboard</h1>

      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-text-muted">
          Admin tools will appear here.
        </p>
      </div>
    </div>
  );
}
