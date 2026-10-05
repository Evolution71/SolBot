import { useEffect, useRef } from "react";

/**
 * Wraps Cloudflare Turnstile (https://developers.cloudflare.com/turnstile/).
 * This renders a real challenge widget and returns a token — but the token
 * only proves anything once your BACKEND verifies it against Cloudflare's
 * siteverify endpoint (see backend/src/routes/waitlist.ts). A widget alone,
 * with no server-side check, is not a real CAPTCHA — it's decoration.
 */
export default function TurnstileWidget({ siteKey, onVerify, onExpire }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    function render() {
      if (!window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onVerify(token),
        "expired-callback": () => onExpire?.(),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire]);

  if (!siteKey) {
    return (
      <p className="text-xs text-nexus-warn text-center">
        Set VITE_TURNSTILE_SITE_KEY to enable human verification.
      </p>
    );
  }

  return <div ref={containerRef} />;
}
