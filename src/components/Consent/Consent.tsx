"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/warcraftcn/button";

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

const KEY = "bf-consent:v1";
const LEGACY_KEY = "bf-consent";

type Choice = "denied" | "granted";

type State = {
  /** Embeds waiting on this page. Zero means nothing to ask about. */
  blocked: number;
  choice?: Choice;
  /** Opened from the footer, so a decision can be taken back. */
  prompting: boolean;
};

const IDLE: State = { prompting: false, blocked: 0 };

let state = IDLE;
let listeners: (() => void)[] = [];
let choiceLoaded = false;

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
  for (const node of parked()) reveal(node);
}

function parseChoice(value: string | null): Choice | undefined {
  return value === "granted" || value === "denied" ? value : undefined;
}

function loadChoice() {
  if (choiceLoaded) return state.choice;
  choiceLoaded = true;

  try {
    const current = parseChoice(localStorage.getItem(KEY));
    if (current) {
      localStorage.removeItem(LEGACY_KEY);
      return current;
    }

    const legacy = parseChoice(localStorage.getItem(LEGACY_KEY));
    if (legacy) {
      localStorage.setItem(KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }

    return legacy;
  } catch {
    return undefined;
  }
}

export function decide(choice: Choice) {
  choiceLoaded = true;

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
    <button
      className={className}
      onClick={() => {
        set({ prompting: true });
      }}
      type="button"
    >
      Ciasteczka
    </button>
  );
}

/**
 * Both answers carry the same weight. Making the refusal a quiet text link is
 * the standard trick, and it is the one thing a consent banner must not do.
 */
const ACTION = "flex-1 px-5 py-2.5 text-sm";

/**
 * Mounted once in the layout: it both watches for parked embeds and renders
 * the banner, because the banner has nothing to say until it knows there is
 * something parked.
 */
export function Consent() {
  const { choice, prompting, blocked } = useConsent();
  const pathname = usePathname();

  useEffect(() => {
    const stored = loadChoice();

    if (stored === "granted") revealAll();

    set({ choice: stored, blocked: stored === "granted" ? 0 : parked().length });
  }, [pathname]);

  /**
   * The placeholders carry the same "yes" the banner does, so a visitor who
   * scrolled past the banner can answer from where they noticed the gap.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("[data-embed-accept]")) decide("granted");
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (!prompting && (choice !== undefined || blocked === 0)) return null;

  return (
    <div
      aria-label="Ciasteczka"
      /**
       * The right margin clears the floating cart dock, which is 48px inset by
       * 16px and paints under this at the same layer. On anything wider the
       * `min()` picks 22rem and the two are nowhere near each other.
       */
      className="fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-6rem))] rounded-card border-2 border-navy bg-paper text-navy shadow-[0_18px_44px_-18px] shadow-navy/50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-300 motion-safe:ease-out"
      role="dialog"
    >
      <p className="eyebrow border-b border-dashed border-hairline px-4 py-2.5">Ciasteczka</p>

      <div className="px-4 py-3.5">
        <p className="text-sm text-ink-muted">
          Mapy i formularze na tej stronie ładują się z cudzych serwerów, które zobaczą Twój adres
          IP.
        </p>

        <div className="mt-4 flex gap-2">
          <Button
            className={ACTION}
            onClick={() => {
              decide("granted");
            }}
          >
            Okej
          </Button>
          <Button
            className={ACTION}
            onClick={() => {
              decide("denied");
            }}
          >
            Nie, dziękuję
          </Button>
        </div>

        <p className="mt-3 text-xs text-ink-muted">Wybór zmienisz w stopce.</p>
      </div>
    </div>
  );
}
