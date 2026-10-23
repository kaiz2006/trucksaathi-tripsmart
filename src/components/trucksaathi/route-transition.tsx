import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation } from "@tanstack/react-router";

export function RouteTransition() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className="ts-route-stage"
        key={location.pathname}
        initial={reduceMotion ? false : { y: 7 }}
        animate={{ y: 0 }}
        exit={reduceMotion ? undefined : { y: -5 }}
        transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
