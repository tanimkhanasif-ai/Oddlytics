import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:3000";
const SHOTS_DIR = "./screenshots";

// Ensure screenshots directory exists
if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

const pages = {
  public: [
    { name: "landing", url: "/" },
    { name: "login", url: "/login" },
  ],
  app: [
    { name: "dashboard", url: "/dashboard" },
    { name: "analyzer", url: "/analyzer" },
    { name: "paper-trading", url: "/paper-trading" },
    { name: "handpicked-bets", url: "/handpicked-bets" },
    { name: "wallet-tracker", url: "/wallet-tracker" },
    { name: "copy-trading", url: "/copy-trading" },
    { name: "pricing", url: "/pricing" },
    { name: "settings", url: "/settings" },
  ],
};

async function takeScreenshot(page, name, url) {
  console.log(`Capturing ${name}...`);
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const filename = path.join(SHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`✓ ${name} → ${filename}`);
  } catch (err) {
    console.error(`✗ ${name} failed:`, err.message);
  }
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("=== SIGNED OUT (Public Pages) ===");
  for (const p of pages.public) {
    await takeScreenshot(page, `00-${p.name}`, `${BASE_URL}${p.url}`);
  }

  console.log("\n=== FREE USER (Signed In, No Subscription) ===");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "free@demo.test");
  await page.fill('input[name="password"]', "password");
  await page.click('button:has-text("Sign in")');
  await page.waitForNavigation({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (const p of pages.app) {
    await takeScreenshot(page, `01-free-${p.name}`, `${BASE_URL}${p.url}`);
  }

  console.log("\n=== PRO USER (Subscribed) ===");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "pro@demo.test");
  await page.fill('input[name="password"]', "password");
  await page.click('button:has-text("Sign in")');
  await page.waitForNavigation({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (const p of pages.app) {
    await takeScreenshot(page, `02-pro-${p.name}`, `${BASE_URL}${p.url}`);
  }

  await browser.close();
  console.log("\n✓ All screenshots saved to ./screenshots/");
}

main().catch(console.error);
