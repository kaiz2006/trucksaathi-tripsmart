import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/transporter/type")({
  beforeLoad: () => {
    throw redirect({
      to: "/app/transporter/availability/$mode",
      params: { mode: "single" },
    });
  },
});
