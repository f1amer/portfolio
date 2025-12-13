import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// Allow frontend requests (local + deployed). For production you can lock this down.
app.use(cors({ origin: true }));

/**
 * Very simple rule-based IT Support bot (free, no API key).
 * - Detects common issues and returns structured steps.
 * - Keeps no personal data; no database.
 */

function normalize(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasAny(text, keywords) {
  return keywords.some(k => text.includes(k));
}

function replyFor(message) {
  const t = normalize(message);

  // Greetings
  if (hasAny(t, ["hi", "hello", "hey", "g'day", "gday"])) {
    return {
      title: "Hi! 👋",
      body: "Tell me the issue (e.g., Wi‑Fi, VPN, login, printer, slow PC). I’ll give a quick checklist."
    };
  }

  // No internet / Wi-Fi
  if (hasAny(t, ["no internet", "internet not working", "wifi", "wi-fi", "can't connect", "cannot connect", "network down"])) {
    return {
      title: "Wi‑Fi / No Internet – Quick Checklist",
      steps: [
        "Check if other devices work on the same Wi‑Fi.",
        "Turn Wi‑Fi off/on (or airplane mode on/off).",
        "Restart router (if you control it) and restart your PC.",
        "Run: ipconfig /all  (Windows) → confirm you have an IP + DNS.",
        "Run: ipconfig /flushdns then ipconfig /renew.",
        "Test: ping 8.8.8.8 (internet) and ping google.com (DNS).",
        "If VPN is on, disconnect and re-test.",
        "If still failing: check adapter driver / disable+enable adapter."
      ],
      tip: "If you tell me your OS (Windows/macOS) and error text, I can narrow it down."
    };
  }

  // VPN issues
  if (hasAny(t, ["vpn", "forticlient", "cisco anyconnect", "anyconnect", "tunnel", "ssl vpn"])) {
    return {
      title: "VPN Issue – Quick Checklist",
      steps: [
        "Confirm your internet works before VPN.",
        "Check your username/password (caps lock, correct domain).",
        "Disconnect → wait 10 seconds → reconnect.",
        "Try a different network (mobile hotspot) to rule out network blocking.",
        "Check date/time on your device (wrong time breaks certs).",
        "If error mentions 'certificate' or 'TLS': update client + OS.",
        "If account locked: request password reset / unlock from admin."
      ],
      tip: "Send me the exact VPN error code/message for a precise fix."
    };
  }

  // Login / password
  if (hasAny(t, ["can't login", "cannot login", "login failed", "password", "account locked", "locked out", "mfa", "2fa", "authenticator"])) {
    return {
      title: "Login / Password – Quick Checklist",
      steps: [
        "Check caps lock and keyboard layout.",
        "Try password reset (if available).",
        "If it’s a work/school account: verify the correct username format (e.g., user@domain).",
        "If MFA fails: check phone time sync and network.",
        "Try an incognito/private window for web logins.",
        "If locked: wait lockout period or request unlock."
      ],
      tip: "Tell me if this is Windows login, email (Microsoft/Google), or a website."
    };
  }

  // Printer
  if (hasAny(t, ["printer", "printing", "print queue", "spooler"])) {
    return {
      title: "Printer Not Printing – Quick Checklist",
      steps: [
        "Check power, paper, and any error lights on the printer.",
        "Confirm you’re on the same network as the printer (if network printer).",
        "Clear the print queue and try again.",
        "Restart the Print Spooler (Windows): services.msc → Print Spooler → Restart.",
        "Remove and re-add the printer (or reinstall driver).",
        "Try printing a test page."
      ],
      tip: "If you share the printer model and OS, I can give exact steps."
    };
  }

  // Slow PC
  if (hasAny(t, ["slow", "lag", "freezing", "high cpu", "high memory", "disk 100", "takes long"])) {
    return {
      title: "Slow Computer – Quick Checklist",
      steps: [
        "Restart the PC (quick win).",
        "Open Task Manager → sort by CPU/Memory/Disk and identify top process.",
        "Disable heavy startup apps (Task Manager → Startup).",
        "Free disk space (aim for 15–20% free).",
        "Run Windows Update and reboot after updates.",
        "Run a malware scan (Defender).",
        "If disk is always 100%: check for Windows Search/Update loops; consider SSD upgrade."
      ],
      tip: "Tell me your device specs (RAM/SSD) and what is slow (boot, apps, internet)."
    };
  }

  // Blue screen / crash
  if (hasAny(t, ["blue screen", "bsod", "crash", "rebooting", "stuck", "boot loop"])) {
    return {
      title: "Crash / BSOD – Quick Checklist",
      steps: [
        "Note the STOP code or error text on the screen.",
        "Disconnect external devices (USB, docks) and reboot.",
        "Boot into Safe Mode if it keeps crashing.",
        "Update drivers (especially display/network) and Windows updates.",
        "Check disk + memory: chkdsk /f and Windows Memory Diagnostic.",
        "If recent changes: roll back driver or System Restore."
      ],
      tip: "Send the STOP code (e.g., MEMORY_MANAGEMENT) for targeted help."
    };
  }

  // Default / fallback
  return {
    title: "Tell me a bit more",
    body: "What issue are you facing (Wi‑Fi, VPN, login, printer, slow PC)? Also tell me: OS (Windows/macOS), any error message, and what changed recently."
  };
}

app.post("/api/chat", (req, res) => {
  const message = (req.body?.message || "").toString();
  if (!message.trim()) return res.status(400).json({ error: "message is required" });

  const r = replyFor(message);

  // Return a simple text reply + structured fields (frontend can render either)
  const text = r.steps
    ? `${r.title}\n\n- ${r.steps.join("\n- ")}\n\nTip: ${r.tip || ""}`.trim()
    : `${r.title}\n\n${r.body || ""}`.trim();

  res.json({ reply: text, ...r });
});

app.get("/health", (_, res) => res.send("ok"));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`RuleBot backend running on http://localhost:${PORT}`));
