import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configuration pour votre organisation/projet
  // Ces valeurs seront automatiquement détectées si vous utilisez le wizard
  // ou peuvent être définies manuellement via les variables d'environnement
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance Monitoring
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/yourserver\.com\/api/,
  ],
})

