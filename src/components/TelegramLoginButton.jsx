import { useEffect, useRef } from "react";

/**
 * Wraps Telegram's official Login Widget script.
 * https://core.telegram.org/widgets/login
 *
 * The widget itself talks to Telegram and returns a signed payload — we
 * never see the user's Telegram credentials, only a hash-verified profile
 * object that the backend re-verifies against the bot token before issuing
 * a session (see backend/src/services/authService.ts).
 */
export default function TelegramLoginButton({ botUsername, onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    // Telegram's widget calls a global callback by name.
    window.onTelegramAuth = (user) => onAuth(user);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  if (!botUsername) {
    return (
      <p className="text-xs text-nexus-warn text-center">
        Set VITE_TELEGRAM_BOT_USERNAME to enable Telegram login.
      </p>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
