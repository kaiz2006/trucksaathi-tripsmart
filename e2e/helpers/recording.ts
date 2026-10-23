import type { Page } from "@playwright/test";

export async function installCursorOverlay(page: Page) {
  await page.addStyleTag({
    content: `
      #ts-cursor-overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999;
      }
      #ts-cursor-dot {
        position: absolute;
        width: 14px;
        height: 14px;
        margin-left: -7px;
        margin-top: -7px;
        border-radius: 50%;
        background: rgba(255, 58, 58, 0.95);
        box-shadow: 0 0 0 3px rgba(255, 58, 58, 0.15), 0 0 18px rgba(255, 58, 58, 0.4);
      }
      #ts-click-ripple {
        position: absolute;
        width: 18px;
        height: 18px;
        margin-left: -9px;
        margin-top: -9px;
        border-radius: 50%;
        border: 2px solid rgba(255, 58, 58, 0.9);
        opacity: 0;
        transform: scale(0.6);
        animation: tsRipple 420ms ease-out forwards;
      }
      @keyframes tsRipple {
        0% { opacity: 1; transform: scale(0.4); }
        100% { opacity: 0; transform: scale(3.4); }
      }
      #ts-caption-bar {
        position: fixed;
        left: 18px;
        right: 18px;
        bottom: 16px;
        z-index: 999998;
        background: rgba(11, 18, 32, 0.78);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 700;
        color: white;
        letter-spacing: 0.02em;
        text-align: center;
        backdrop-filter: blur(10px);
      }
    `,
  });

  await page.evaluate(() => {
    const overlay = document.createElement("div");
    overlay.id = "ts-cursor-overlay";
    const cursor = document.createElement("div");
    cursor.id = "ts-cursor-dot";
    const ripple = document.createElement("div");
    ripple.id = "ts-click-ripple";
    overlay.appendChild(cursor);
    overlay.appendChild(ripple);
    document.body.appendChild(overlay);

    const move = (event: MouseEvent) => {
      const dot = document.getElementById("ts-cursor-dot");
      if (!dot) return;
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("click", (event: MouseEvent) => {
      const rippleEl = document.getElementById("ts-click-ripple");
      if (!rippleEl) return;
      rippleEl.style.left = `${event.clientX}px`;
      rippleEl.style.top = `${event.clientY}px`;
      rippleEl.style.opacity = "1";
      rippleEl.style.animation = "none";
      void rippleEl.offsetWidth;
      rippleEl.style.animation = "tsRipple 420ms ease-out forwards";
    });

    const caption = document.createElement("div");
    caption.id = "ts-caption-bar";
    caption.textContent = "TruckSaathi demo";
    document.body.appendChild(caption);
  });
}

export async function setCaption(page: Page, text: string) {
  await page.evaluate((value) => {
    const caption = document.getElementById("ts-caption-bar");
    if (caption) caption.textContent = value;
  }, text);
}

export async function pause(page: Page, ms = 1000) {
  await page.waitForTimeout(ms);
}

export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  await page.waitForTimeout(150);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}
