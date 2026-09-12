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
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-screen font-sans text-foreground">
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
