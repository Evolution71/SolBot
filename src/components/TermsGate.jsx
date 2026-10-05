import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "../lib/api";

export default function TermsGate({ children }) {
  const [status, setStatus] = useState(null); // null = loading

  useEffect(() => {
    api
      .getTermsStatus()
      .then((res) => setStatus(res))
      .catch(() => setStatus({ accepted: false, message: "Couldn't load your status." }));
  }, []);

  async function accept() {
    await api.acceptTerms();
    setStatus({ accepted: true, message: null });
  }

  if (status === null) return null;

  if (!status.accepted) {
    return (
      <div className="rounded-2xl border border-nexus-warn/40 bg-nexus-warn/5 p-6 text-center">
        <ShieldCheck className="mx-auto text-nexus-warn mb-3" size={28} />
        <p className="text-sm text-nexus-text max-w-md mx-auto whitespace-pre-line">{status.message}</p>
        <button
          onClick={accept}
          className="mt-4 rounded-lg bg-nexus-warn text-nexus-bg font-semibold px-6 py-2.5 text-sm"
        >
          I Understand — Continue
        </button>
      </div>
    );
  }

  return children;
}
