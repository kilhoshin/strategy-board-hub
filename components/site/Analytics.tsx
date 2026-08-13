const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * GA4 tag. Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set, same
 * gating pattern as AdSenseScript in AdSlot.tsx.
 */
export function GoogleAnalyticsScript() {
  if (!GA_ID) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
        }}
      />
    </>
  );
}
