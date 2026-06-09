const WHATSAPP_NUMBER = "593980919560";

const routes = {
  ventas: {
    title: "Web comercial + WhatsApp inteligente",
    copy: "Landing de alto rendimiento, formulario guiado, mensajes prellenados y medicion de conversion para saber que canal trae clientes.",
    project: "Desarrollo web",
    priority: "Quiero explorar",
    items: [
      "Pagina rapida con llamados a la accion claros.",
      "Contacto por WhatsApp con mensaje prellenado.",
      "Panel inicial de metricas de leads."
    ]
  },
  procesos: {
    title: "Automatizacion operativa",
    copy: "Mapeamos tareas repetitivas, conectamos herramientas y dejamos flujos que reducen errores, tiempos muertos y trabajo manual.",
    project: "Integraciones",
    priority: "Quiero explorar",
    items: [
      "Formularios conectados con notificaciones internas.",
      "Alertas para ventas, soporte o administracion.",
      "Reportes automaticos para seguimiento semanal."
    ]
  },
  datos: {
    title: "Dashboard ejecutivo",
    copy: "Unificamos informacion critica en una vista simple para que puedas medir ventas, clientes, inventario, proyectos o productividad.",
    project: "Analitica",
    priority: "Quiero explorar",
    items: [
      "Modelo de datos limpio y mantenible.",
      "Indicadores clave por area o proceso.",
      "Reportes listos para decisiones de gerencia."
    ]
  },
  escala: {
    title: "Mantenimiento y evolucion continua",
    copy: "Ordenamos mejoras, soporte, rendimiento, monitoreo y nuevas funciones para que la solucion crezca junto con la empresa.",
    project: "Soporte y mejora",
    priority: "Busco soporte continuo",
    items: [
      "Plan de mejoras por prioridad e impacto.",
      "Monitoreo basico y correccion de errores.",
      "Evolucion de funcionalidades sin rehacer todo."
    ]
  }
};

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("#site-nav");
const body = document.body;

function setNav(open) {
  body.classList.toggle("nav-open", open);
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    setNav(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      setNav(false);
    }
  });
}

function makeWhatsAppUrl(message) {
  const cleanMessage = String(message || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cleanMessage)}`;
}

function defaultMessage() {
  return "Hola Zenit, quiero recibir informacion sobre desarrollo de software y soluciones tecnologicas.";
}

document.querySelectorAll(".js-whatsapp-direct").forEach((link) => {
  link.setAttribute("href", makeWhatsAppUrl(defaultMessage()));
});

const routeButtons = document.querySelectorAll("[data-route]");
const routeTitle = document.querySelector("#route-title");
const routeCopy = document.querySelector("[data-route-copy]");
const routeList = document.querySelector("[data-route-list]");
const routeCta = document.querySelector("[data-route-cta]");
let activeRouteKey = "ventas";

function renderRoute(key) {
  const route = routes[key] || routes.ventas;
  activeRouteKey = routes[key] ? key : "ventas";
  routeTitle.textContent = route.title;
  routeCopy.textContent = route.copy;
  routeList.innerHTML = route.items
    .map((item) => `<li><svg class="icon"><use href="#icon-check"></use></svg>${item}</li>`)
    .join("");

  routeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === key);
  });
}

routeButtons.forEach((button) => {
  button.addEventListener("click", () => renderRoute(button.dataset.route));
});

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");
const projectSelect = getFormControl("project");
const messageTextarea = getFormControl("message");
const prioritySelect = getFormControl("priority");
const summaryProject = document.querySelector("[data-summary-project]");
const summaryPriority = document.querySelector("[data-summary-priority]");
const summaryMessage = document.querySelector("[data-summary-message]");

function getFormControl(name) {
  return form ? form.elements.namedItem(name) : null;
}

function makeRouteMessage(route) {
  return [
    `Ruta seleccionada: ${route.title}`,
    route.copy,
    "Quiero conocer alcance, tiempos y cotizacion."
  ].join("\n");
}

function makeSolutionMessage(title, result) {
  return [
    `Solucion seleccionada: ${title}`,
    `Resultado esperado: ${result}`,
    "Quiero conocer alcance, tiempos y cotizacion."
  ].join("\n");
}

function selectedOptionText(field) {
  if (!field || !field.selectedOptions || !field.selectedOptions.length) {
    return "";
  }

  return field.selectedOptions[0].textContent.trim();
}

function shortMessagePreview(message) {
  const cleanMessage = String(message || "").replace(/\s+/g, " ").trim();

  if (!cleanMessage) {
    return "Describe brevemente tu idea o problema para preparar mejor la conversacion por WhatsApp.";
  }

  return cleanMessage.length > 150 ? `${cleanMessage.slice(0, 147)}...` : cleanMessage;
}

function updateContactSummary() {
  if (!form) {
    return;
  }

  const projectText = selectedOptionText(projectSelect);
  const priorityText = selectedOptionText(prioritySelect);

  if (summaryProject) {
    summaryProject.textContent = projectSelect && projectSelect.value ? projectText : "Selecciona una opcion";
  }

  if (summaryPriority) {
    summaryPriority.textContent = priorityText || "Quiero explorar";
  }

  if (summaryMessage) {
    summaryMessage.textContent = shortMessagePreview(messageTextarea ? messageTextarea.value : "");
  }
}

function watchManualMessageEdit(messageField) {
  messageField.addEventListener(
    "input",
    () => {
      delete messageField.dataset.generatedRoute;
      delete messageField.dataset.generatedSolution;
    },
    { once: true }
  );
}

function prefillContactFromRoute(key) {
  if (!form) {
    return;
  }

  const route = routes[key] || routes.ventas;
  const projectField = getFormControl("project");
  const priorityField = getFormControl("priority");
  const messageField = getFormControl("message");
  const nameField = getFormControl("name");

  if (projectField) {
    projectField.value = route.project;
  }

  if (priorityField) {
    priorityField.value = route.priority;
  }

  if (messageField) {
    const routeMessage = makeRouteMessage(route);
    const currentMessage = messageField.value.trim();

    if (!currentMessage || messageField.dataset.generatedRoute || messageField.dataset.generatedSolution) {
      messageField.value = routeMessage.slice(0, Number(messageField.maxLength) || routeMessage.length);
      messageField.dataset.generatedRoute = key;
      delete messageField.dataset.generatedSolution;
    }

    watchManualMessageEdit(messageField);
  }

  if (status) {
    status.textContent = `Ruta seleccionada: ${route.title}. Completa tus datos y abre WhatsApp.`;
  }

  updateContactSummary();
  document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (location.hash !== "#contacto") {
    history.pushState(null, "", "#contacto");
  }

  window.setTimeout(() => {
    if (nameField && !nameField.value.trim()) {
      nameField.focus();
      return;
    }

    messageField?.focus();
  }, 400);
}

if (routeCta) {
  routeCta.addEventListener("click", (event) => {
    event.preventDefault();
    prefillContactFromRoute(activeRouteKey);
  });
}

document.querySelectorAll("[data-solution-interest]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    if (!form) {
      return;
    }

    const title = link.dataset.title || "Solucion Zenit";
    const project = link.dataset.project || "Software a medida";
    const result = link.dataset.result || "Mejorar procesos y resultados del negocio.";
    const projectField = getFormControl("project");
    const priorityField = getFormControl("priority");
    const messageField = getFormControl("message");
    const nameField = getFormControl("name");

    if (projectField) {
      projectField.value = project;
    }

    if (priorityField) {
      priorityField.value = project === "Soporte y mejora" ? "Busco soporte continuo" : "Quiero explorar";
    }

    if (messageField) {
      const solutionMessage = makeSolutionMessage(title, result);
      const currentMessage = messageField.value.trim();

      if (!currentMessage || messageField.dataset.generatedRoute || messageField.dataset.generatedSolution) {
        messageField.value = solutionMessage.slice(0, Number(messageField.maxLength) || solutionMessage.length);
        messageField.dataset.generatedSolution = title;
        delete messageField.dataset.generatedRoute;
      }

      watchManualMessageEdit(messageField);
    }

    if (status) {
      status.textContent = `Solucion seleccionada: ${title}. Completa tus datos y abre WhatsApp.`;
    }

    updateContactSummary();
    document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (location.hash !== "#contacto") {
      history.pushState(null, "", "#contacto");
    }

    window.setTimeout(() => {
      if (nameField && !nameField.value.trim()) {
        nameField.focus();
        return;
      }

      messageField?.focus();
    }, 400);
  });
});

if (projectSelect && messageTextarea) {
  projectSelect.addEventListener("change", () => {
    if (projectSelect.value !== "Otro") {
      updateContactSummary();
      return;
    }

    if (status) {
      status.textContent = "Cuéntanos tu problema en el mensaje y revisaremos la mejor solución.";
    }

    if (!messageTextarea.value.trim()) {
      messageTextarea.placeholder = "Describe brevemente el problema, proceso o idea que quieres resolver.";
    }

    messageTextarea.focus();
    updateContactSummary();
  });
}

if (form) {
  form.addEventListener("input", updateContactSummary);
  form.addEventListener("change", updateContactSummary);
  updateContactSummary();
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const company = String(data.get("company") || "").trim();
    const project = String(data.get("project") || "").trim();
    const priority = String(data.get("priority") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !project) {
      status.textContent = "Completa tu nombre y el tipo de proyecto para preparar el mensaje.";
      form.reportValidity();
      return;
    }

    const lines = [
      "Hola Zenit, quiero enviar una consulta.",
      "",
      "Datos de contacto:",
      `- Nombre: ${name}`,
      ...(company ? [`- Empresa: ${company}`] : []),
      "",
      "Resumen del proyecto:",
      `- Tipo de proyecto: ${project}`,
      `- Prioridad: ${priority}`,
      ...(message ? ["", "Mensaje del cliente:", message] : [])
    ];

    status.textContent = "Abriendo WhatsApp con tu mensaje preparado.";
    window.open(makeWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const metrics = document.querySelectorAll("[data-count]");

if ("IntersectionObserver" in window && metrics.length) {
  const metricObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const target = Number(element.dataset.count || "0");
        const duration = 850;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = Math.round(target * eased).toString();

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }

        requestAnimationFrame(tick);
        metricObserver.unobserve(element);
      });
    },
    { threshold: 0.7 }
  );

  metrics.forEach((metric) => metricObserver.observe(metric));
}
