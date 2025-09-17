Integración básica con Firebase (Firestore)

Resumen

- Se agregó la dependencia `firebase` en `package.json`.
- Archivos añadidos:
  - `lib/firebase.ts` - inicialización del SDK de Firebase (cliente)
  - `lib/firestore.ts` - funciones básicas para la colección `cattle`
  - `hooks/useCattle.ts` - hook React para consumir la colección desde componentes cliente
  - `.env.local.example` - ejemplo de variables de entorno para copiar a `.env.local`

Cómo continuar

1) Libera espacio en tu disco (tu máquina mostró errores ENOSPC cuando corriste `npm install`).
2) Copia `.env.local.example` a `.env.local` y completa los valores con tus credenciales de Firebase.
3) Instala dependencias:

   npm install

4) Ejecuta el servidor de desarrollo:

   npm run dev

Notas y recomendaciones

- Si no puedes instalar dependencias por falta de espacio, considera configurar `npm` para usar una caché en otra unidad con espacio disponible o mover el proyecto a otra partición.
- Después de instalar, los componentes cliente pueden cambiarse para usar `useCattle()` en lugar de datos mock. Puedo ayudarte a integrar `useCattle()` en `app/page.tsx` y en los formularios si quieres.
