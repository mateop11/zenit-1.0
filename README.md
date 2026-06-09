# Zenit Website

Primera version de la pagina web para Zenit, empresa de desarrollo de software y soluciones tecnologicas.

## Archivos

- `index.html`: estructura principal de la pagina.
- `styles.css`: diseno responsive y estilos.
- `script.js`: menu movil, diagnostico interactivo, animaciones y contacto por WhatsApp.
- `assets/zenit-hero.png`: imagen hero generada para la marca.
- `_headers`: cabeceras recomendadas para hosting estatico compatible.

## Configurar WhatsApp

En `script.js`, cambia:

```js
const WHATSAPP_NUMBER = "593980919560";
```

por el numero real de Zenit en formato internacional, sin `+`, espacios ni guiones.

Ejemplo:

```js
const WHATSAPP_NUMBER = "593987654321";
```

## API oficial de WhatsApp

Esta version usa `wa.me` porque es seguro para una pagina estatica y no expone credenciales. Para usar WhatsApp Cloud API, plantillas, webhooks o respuestas automaticas:

1. Crea un backend o funcion serverless.
2. Guarda tokens en variables de entorno del servidor.
3. Valida y limita los datos que llegan desde el formulario.
4. Envia mensajes desde el servidor hacia la API oficial.
5. Registra webhooks para recibir estados o respuestas.

No pongas tokens de Meta, WhatsApp o CRM dentro de `script.js`.

## Seguridad para despliegue

- Publicar siempre con HTTPS.
- Activar las cabeceras de `_headers` o equivalentes en el servidor.
- Mantener `connect-src 'none'` mientras no haya backend.
- Si agregas analitica, mapas, chatbots o fuentes externas, actualiza la CSP con dominios especificos.
- Usar un backend para cualquier integracion que requiera claves privadas.

