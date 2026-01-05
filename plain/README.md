Frontend básico para consumir el backend de Empleabilidad.

Estructura:
- index.html
- css/styles.css
- js/api.js (funciones que devuelven Promesas usando `fetch`)
- js/app.js (UI mínima y manejo de eventos)

Uso:
1. Abrir `plain/index.html` en el navegador (o servir `plain/` con un servidor estático).
2. Ingresa la `API Key` en el formulario (header `x-api-key`).
3. Opcional: haz login con `/auth/login` para obtener `accessToken` (se guarda en `localStorage` como `token`).
4. Usa "Obtener vacantes" para llamar a `GET /vacancies`.

Notas:
- Las llamadas usan `fetch` y devuelven Promesas (se consumen con `.then()` y `.catch()` en `app.js`).
- Por simplicidad las llamadas incluyen el header `x-api-key` configurado en la UI.
- Si quieres servir desde npm, puedes instalar `serve` y ejecutar `npx serve plain`.
