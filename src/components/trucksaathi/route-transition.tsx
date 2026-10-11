import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "@tanstack/react-router";

export function RouteTransition() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  return <AnimatePresence mode="wait" initial={false}><motion.div key={location.pathname} initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}><Outlet /></motion.div></AnimatePresence>;
}