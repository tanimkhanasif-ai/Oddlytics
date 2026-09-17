import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import AppChrome from "@/components/AppChrome";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const WHOP_PIXEL_SNIPPET = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_GI0zMpIUnJnJrr");whop.track("page");`;

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oddlytics.site"),
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
  openGraph: { siteName: "Oddlytics" },
};

// Tells Google the human-readable name for this domain — without it, search
// results show the raw "oddlytics.site" instead of "Oddlytics" as the site name.
const WEBSITE_JSON_LD = `{"@context":"https://schema.org","@type":"WebSite","name":"Oddlytics","url":"https://oddlytics.site"}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-screen font-sans text-foreground">
        <Script
          id="website-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
        />
        <Script
          id="whop-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: WHOP_PIXEL_SNIPPET }}
        />
        <AuthProvider>
          <AppChrome>{children}</AppChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
