declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    ANTHROPIC_API_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    /** Valor cobrado (base). É o preço no Pix — ver src/lib/pricing.ts. */
    PRICE_RECURSO_CENTS?: string;
    /** Valor anunciado para cartão à vista, já com o repasse da taxa. */
    PRICE_CARD_CENTS?: string;
    APP_URL?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    S3_ENDPOINT?: string;
    S3_REGION?: string;
    S3_BUCKET?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
    NEXT_PUBLIC_META_PIXEL_ID?: string;
    NEXT_PUBLIC_GTM_ID?: string;
    NEXT_PUBLIC_GA4_ID?: string;
    NEXT_PUBLIC_WHATSAPP_PHONE?: string;
    NEXT_PUBLIC_WHATSAPP_MESSAGE?: string;
  }
}
