"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/**
 * Consent that does something.
 *
 * There is nothing here to track a visitor with — no analytics, no ads, no
 * storage beyond the cart's own session cookie — so the only thing worth
 * asking about is the handful of Google and Miro embeds editors put in page
 * bodies. `blockThirdPartyEmbeds` has already taken their `src` away by the
 * time this runs, which means the answer to the question actually decides
 * whether the request happens. The banner only appears on a page that has
 * something parked on it.
 */

const KEY = "bf-consent";

type Choice = "granted" | "denied";

type State = {
  choice?: Choice;
  /** Opened from the footer, so a decision can be taken back. */
  prompting: boolean;
  /** Embeds waiting on this page. Zero means nothing to ask about. */
  blocked: number;
};

const IDLE: State = { prompting: false, blocked: 0 };

let state = IDLE;
let listeners: (() => void)[] = [];

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}

const useConsent = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => IDLE,
  );

/**
 * Swaps a placeholder for the real frame. `no-referrer` because the other end
 * has no business knowing which of our pages the visitor was reading.
 */
function reveal(node: Element) {
  const { embedSrc, embedTitle } = (node as HTMLElement).dataset;
  if (!embedSrc) return;

  const frame = document.createElement("iframe");

  frame.src = embedSrc;
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  if (embedTitle) frame.title = embedTitle;

  node.replaceWith(frame);
}

const parked = () => document.querySelectorAll("[data-embed-src]");

function revealAll() {
  for (const node of Array.from(parked())) reveal(node);
}

export function decide(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /** Private mode refuses to remember; the choice still holds for this page. */
  }

  if (choice === "granted") revealAll();

  set({ choice, prompting: false, blocked: choice === "granted" ? 0 : parked().length });
}

export function ConsentLink({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => set({ prompting: true })} type="button">
      Ciasteczka
    </button>
  );
}

const ACTION =
  "cursor-pointer border-2 px-4 py-1.5 text-sm font-semibold transition-transform duration-150 ease-out hover:-translate-y-px active:scale-[0.97]";

/**
 * Mounted once in the layout: it both watches for parked embeds and renders
 * the banner, because the banner has nothing to say until it knows there is
 * something parked.
 */
export function Consent() {
  const { choice, prompting, blocked } = useConsent();
  const pathname = usePathname();

  useEffect(() => {
    let stored: Choice | undefined;

    try {
      stored = (localStorage.getItem(KEY) as Choice | null) ?? undefined;
    } catch {
      stored = undefined;
    }

    if (stored === "granted") revealAll();

    set({ choice: stored, blocked: stored === "granted" ? 0 : parked().length });
  }, [pathname]);

  /** One listener for every "Pokaż mapę" on the page, now and after a route change. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest?.("[data-embed-load]");
      const placeholder = button?.closest("[data-embed-src]");

      if (!placeholder) return;

      reveal(placeholder);
      set({ blocked: parked().length });
    };

    document.addEventListener("click", onClick);

    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!prompting && (choice !== undefined || blocked === 0)) return null;

  return (
    <div
      aria-label="Ciasteczka i osadzone treści"
      className="fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] border-2 border-navy bg-paper text-navy shadow-[0_18px_44px_-18px] shadow-navy/50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
      role="dialog"
    >
      <p className="eyebrow border-b border-dashed border-hairline px-4 py-2.5">Ciasteczka</p>

      <div className="px-4 py-3.5">
        <p className="text-sm text-ink-muted">
          Mapy, formularze i tablice na tej stronie ładują się{" "}
          <strong className="font-semibold text-ink">z cudzych serwerów</strong> — zobaczą Twój
          adres IP.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`${ACTION} border-navy bg-accent text-on-accent`}
            onClick={() => decide("granted")}
            type="button"
          >
            Okej
          </button>
          <button
            className={`${ACTION} border-hairline text-ink hover:border-navy`}
            onClick={() => decide("denied")}
            type="button"
          >
            Nie, dziękuję
          </button>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          Nic innego Cię tu nie śledzi. Wybór zmienisz w stopce.
        </p>
      </div>
    </div>
  );
}
