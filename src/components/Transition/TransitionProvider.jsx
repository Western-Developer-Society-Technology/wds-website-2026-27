"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Curtain from "./Curtain";
import { navLinks } from "./navLinks";
import {
  CONTENT_FADE,
  COVER,
  MENU_BUTTON_ID,
  REDUCED_FADE,
  SAFETY_TIMEOUT,
  WDS_FADE,
  WDS_HOLD,
} from "./timing";

const TransitionContext = createContext(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useTransition must be used within TransitionProvider");
  }
  return ctx;
}

function normalizePath(path) {
  if (!path) return "/";
  const bare = path.split("?")[0].split("#")[0];
  if (bare.length > 1 && bare.endsWith("/")) return bare.slice(0, -1);
  return bare || "/";
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function coverDuration() {
  return prefersReducedMotion() ? REDUCED_FADE : COVER;
}

function fadeDuration() {
  return prefersReducedMotion() ? REDUCED_FADE : CONTENT_FADE;
}

function wdsHoldDuration() {
  return prefersReducedMotion() ? REDUCED_FADE : WDS_FADE + WDS_HOLD;
}

export default function TransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [covered, setCovered] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [wdsVisible, setWdsVisible] = useState(false);

  const phaseRef = useRef(phase);
  const pathnameRef = useRef(pathname);
  const timersRef = useRef([]);
  const pendingHrefRef = useRef(null);
  const routeReadyRef = useRef(false);
  const holdDoneRef = useRef(false);
  const uncoveringRef = useRef(false);
  const coveredAtRef = useRef(0);

  phaseRef.current = phase;
  pathnameRef.current = pathname;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const later = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const coverNow = useCallback(() => {
    coveredAtRef.current = performance.now();
    setCovered(true);
  }, []);

  const remainingCover = useCallback(() => {
    return Math.max(
      0,
      coverDuration() - (performance.now() - coveredAtRef.current),
    );
  }, []);

  const finishIdle = useCallback(() => {
    pendingHrefRef.current = null;
    routeReadyRef.current = false;
    holdDoneRef.current = false;
    uncoveringRef.current = false;
    setWdsVisible(false);
    setContentVisible(false);
    setCovered(false);
    setPhase("idle");
  }, []);

  const startUncover = useCallback(() => {
    if (uncoveringRef.current) return;
    if (!routeReadyRef.current || !holdDoneRef.current) return;
    uncoveringRef.current = true;
    setWdsVisible(false);
    setContentVisible(false);
    setPhase("uncovering");
    setCovered(false);
    window.scrollTo(0, 0);
    later(finishIdle, coverDuration());
  }, [finishIdle, later]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    navLinks.forEach((link) => router.prefetch(link.href));
  }, [router]);

  useEffect(() => {
    if (phase === "idle") return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [phase]);

  useEffect(() => {
    const pending = pendingHrefRef.current;
    if (!pending) return;
    if (normalizePath(pathname) === normalizePath(pending)) {
      window.scrollTo(0, 0);
      routeReadyRef.current = true;
      startUncover();
    }
  }, [pathname, startUncover]);

  const beginNavigation = useCallback(
    (href, { fromMenu }) => {
      clearTimers();
      pendingHrefRef.current = href;
      routeReadyRef.current =
        normalizePath(pathnameRef.current) === normalizePath(href);
      holdDoneRef.current = false;
      uncoveringRef.current = false;

      if (routeReadyRef.current) {
        window.scrollTo(0, 0);
      } else {
        router.push(href, { scroll: false });
      }

      later(() => {
        routeReadyRef.current = true;
        startUncover();
      }, (fromMenu ? fadeDuration() : coverDuration()) + SAFETY_TIMEOUT);

      if (fromMenu) {
        setPhase("navFromMenu");
        setContentVisible(false);
        setWdsVisible(false);
        later(() => {
          holdDoneRef.current = true;
          startUncover();
        }, Math.max(fadeDuration(), remainingCover()));
        return;
      }

      setPhase("pageCovering");
      setContentVisible(false);
      setWdsVisible(false);
      coverNow();

      later(() => {
        setPhase("wdsHold");
        setWdsVisible(true);
        later(() => {
          holdDoneRef.current = true;
          startUncover();
        }, wdsHoldDuration());
      }, coverDuration());
    },
    [clearTimers, coverNow, later, remainingCover, router, startUncover],
  );

  const openMenu = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    clearTimers();
    setPhase("menuOpening");
    setWdsVisible(false);
    setContentVisible(false);
    coverNow();
    later(() => {
      setPhase("menuOpen");
      setContentVisible(true);
    }, coverDuration());
  }, [clearTimers, coverNow, later]);

  const closeMenu = useCallback(() => {
    const current = phaseRef.current;
    if (current !== "menuOpen" && current !== "menuOpening") return;
    clearTimers();
    setPhase("menuClosing");
    setContentVisible(false);
    const delay = current === "menuOpen" ? fadeDuration() : 0;
    later(() => {
      setCovered(false);
      later(() => {
        finishIdle();
        document.getElementById(MENU_BUTTON_ID)?.focus({ preventScroll: true });
      }, coverDuration());
    }, delay);
  }, [clearTimers, finishIdle, later]);

  const navigate = useCallback(
    (href) => {
      const target = normalizePath(href);
      const current = normalizePath(pathnameRef.current);
      const phaseNow = phaseRef.current;

      if (phaseNow === "menuOpen" || phaseNow === "menuOpening") {
        if (target === current) {
          closeMenu();
          return;
        }
        beginNavigation(target, { fromMenu: true });
        return;
      }

      if (phaseNow !== "idle") return;
      if (target === current) return;
      beginNavigation(target, { fromMenu: false });
    },
    [beginNavigation, closeMenu],
  );

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const eventTarget = event.target;
      const element =
        eventTarget instanceof Element
          ? eventTarget
          : eventTarget.parentElement;
      const anchor = element?.closest("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition !== undefined) return;
      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.protocol === "mailto:" || url.protocol === "tel:") return;

      const current = new URL(window.location.href);
      if (
        url.pathname === current.pathname &&
        url.search === current.search &&
        url.hash
      ) {
        return;
      }

      const href = `${url.pathname}${url.search}`;
      const phaseNow = phaseRef.current;

      if (
        phaseNow !== "idle" &&
        phaseNow !== "menuOpen" &&
        phaseNow !== "menuOpening"
      ) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      navigate(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      const current = phaseRef.current;
      if (current === "menuOpen" || current === "menuOpening") {
        event.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMenu]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const menuRaised =
    phase === "menuOpening" || phase === "menuOpen" || phase === "menuClosing";
  const menuOpen =
    phase === "menuOpening" || phase === "menuOpen" || phase === "menuClosing";

  const value = useMemo(
    () => ({
      phase,
      menuRaised,
      menuOpen,
      openMenu,
      closeMenu,
      navigate,
    }),
    [phase, menuRaised, menuOpen, openMenu, closeMenu, navigate],
  );

  const showMenu =
    phase === "menuOpening" ||
    phase === "menuOpen" ||
    phase === "menuClosing" ||
    phase === "navFromMenu";

  return (
    <TransitionContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <Curtain
              covered={covered}
              contentVisible={contentVisible}
              wdsVisible={wdsVisible}
              showMenu={showMenu}
            />,
            document.body,
          )
        : null}
    </TransitionContext.Provider>
  );
}
