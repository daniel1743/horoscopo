# Validación de newsletter público

Se comprobó la portada local en `http://127.0.0.1:8080/`. El formulario público muestra email, consentimiento obligatorio y enlaces de privacidad y gestión/baja. Con `persona@example.com` y consentimiento marcado, la respuesta visible fue: «La suscripción pública todavía no está conectada. No se guardó tu correo ni se envió ningún mensaje.» No se pidió sesión, no se presentó éxito falso y no se ejecutó proveedor ni escritura remota.

## Baja

`/newsletter/unsubscribe` sin token mostró `Este enlace no contiene un token de baja válido.`. Con `?token=test-token`, la página mostró el botón `Procesar baja`; al ejecutarlo, devolvió `La baja pública todavía no está conectada porque no hay un proveedor configurado. No se modificó ninguna suscripción.`. El token no apareció en el contenido visible ni se presentó una cancelación exitosa.
