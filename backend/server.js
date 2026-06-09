const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "593980919560";
const STATIC_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "data");
const LEADS_FILE = path.resolve(DATA_DIR, "leads.jsonl");
const MAX_BODY_SIZE = 24 * 1024;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"]
]);

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  setSecurityHeaders(res);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendText(res, status, text) {
  setSecurityHeaders(res);
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store"
  });
  res.end(text);
}

function cleanSingleLine(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 500);
}

function buildWhatsAppMessage(lead) {
  return [
    "Hola Zenit, quiero enviar una consulta.",
    "",
    "Datos de contacto:",
    `- Nombre: ${lead.name}`,
    `- Numero de WhatsApp: ${lead.contact}`,
    ...(lead.company ? [`- Empresa: ${lead.company}`] : []),
    "",
    "Resumen del proyecto:",
    `- Tipo de proyecto: ${lead.project}`,
    `- Prioridad: ${lead.priority || "Quiero explorar"}`,
    ...(lead.message ? ["", "Mensaje del cliente:", lead.message] : [])
  ].join("\n");
}

function makeWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function normalizeLead(body) {
  return {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    name: cleanSingleLine(body.name, 80),
    contact: String(body.contact || "").replace(/\D/g, "").slice(0, 15),
    company: cleanSingleLine(body.company, 90),
    project: cleanSingleLine(body.project, 80),
    priority: cleanSingleLine(body.priority || "Quiero explorar", 80),
    message: cleanMessage(body.message)
  };
}

function validateLead(lead) {
  const errors = [];

  if (!lead.name) {
    errors.push("El nombre es obligatorio.");
  }

  if (!lead.contact) {
    errors.push("El numero de WhatsApp es obligatorio.");
  } else if (!/^[0-9]{7,15}$/.test(lead.contact)) {
    errors.push("El numero de WhatsApp debe contener solo numeros.");
  }

  if (!lead.project) {
    errors.push("El tipo de proyecto es obligatorio.");
  }

  return errors;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > MAX_BODY_SIZE) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleContact(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Metodo no permitido." });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const lead = normalizeLead(body);
    const errors = validateLead(lead);

    if (errors.length) {
      sendJson(res, 400, { ok: false, errors });
      return;
    }

    const whatsappMessage = buildWhatsAppMessage(lead);
    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, "utf8");

    sendJson(res, 201, {
      ok: true,
      leadId: lead.id,
      whatsappUrl: makeWhatsAppUrl(whatsappMessage)
    });
  } catch (error) {
    if (error.message === "payload_too_large") {
      sendJson(res, 413, { ok: false, error: "La consulta es demasiado larga." });
      return;
    }

    if (error instanceof SyntaxError) {
      sendJson(res, 400, { ok: false, error: "JSON invalido." });
      return;
    }

    console.error(error);
    sendJson(res, 500, { ok: false, error: "No se pudo registrar la consulta." });
  }
}

function isBlockedStaticPath(pathname) {
  return (
    pathname.startsWith("/.git") ||
    pathname.startsWith("/backend") ||
    pathname.startsWith("/node_modules") ||
    pathname === "/package.json" ||
    pathname === "/package-lock.json"
  );
}

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  if (isBlockedStaticPath(pathname)) {
    sendText(res, 404, "Not found");
    return;
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(STATIC_ROOT, requestedPath.replace(/^[/\\]+/, ""));

  if (!filePath.startsWith(STATIC_ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, error.code === "ENOENT" ? 404 : 500, error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const body = req.method === "HEAD" ? Buffer.alloc(0) : data;
    setSecurityHeaders(res);
    res.writeHead(200, {
      "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store"
    });
    res.end(body);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "zenit-backend" });
    return;
  }

  if (requestUrl.pathname === "/api/contact") {
    handleContact(req, res);
    return;
  }

  serveStatic(req, res, decodeURIComponent(requestUrl.pathname));
});

server.listen(PORT, () => {
  console.log(`Zenit backend running at http://127.0.0.1:${PORT}/`);
});
