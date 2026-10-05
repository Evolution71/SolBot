export default function ReferralCard({ referral, botUsername = "NexusSolBot" }) {
  if (!referral) return null;
  const link = `https://t.me/${botUsername}?start=${referral.referralCode}`;

  return (
    <div className="rounded-2xl border border-nexus-line bg-nexus-panel p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-nexus-muted mb-2">Referrals</p>
      <p className="font-mono text-3xl font-semibold text-nexus-accent2">
        {referral.totalReferrals}
      </p>
      <p className="text-xs text-nexus-muted mt-1">real, verified invites</p>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-nexus-bg border border-nexus-line px-3 py-2">
        <span className="font-mono text-xs text-nexus-muted truncate">{link}</span>
        <button
          onClick={() => navigator.clipboard.writeText(link)}
          className="shrink-0 text-xs font-medium text-nexus-accent2 hover:text-nexus-accent transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
