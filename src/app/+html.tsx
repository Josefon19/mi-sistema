import { ScrollViewStyleReset } from 'expo-router/html'; import type {
PropsWithChildren } from 'react'; export default function Root({ children }:
PropsWithChildren) { return (
<html lang="es">
  <head>
    <meta charSet="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="theme-color" content="#208AEF" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Mi Sistema" />

    <link rel="manifest" href="/manifest.json" />

    <ScrollViewStyleReset />
  </head>

  <body>
    {children}
  </body>
</html>
); }
