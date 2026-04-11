import { requireAuth } from '@/lib/auth/helpers';

export const metadata = {
  title: 'Dashboard - WaggingTails',
};

export default async function DashboardPage() {
  const profile = await requireAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-main">
        Welcome, {profile.email}
      </h1>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-text-main mb-2">
          Account Status
        </h2>
        <p className="text-text-muted">
          Payment status:{' '}
          <span
            className={
              profile.has_paid
                ? 'text-success font-medium'
                : 'text-warning font-medium'
            }
          >
            {profile.has_paid ? 'Paid' : 'Free'}
          </span>
        </p>
        <p className="text-text-muted">
          Role:{' '}
          <span className="font-medium text-text-main">{profile.role}</span>
        </p>
      </div>
    </div>
  );
}
