import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      search: {
        p1: "61099:142:cyan:Main%20Gate",
        p2: "61061:148,142:amber:Side%20Gate",
        p3: "", p4: "", p5: "",
        title: "Demo",
      },
      replace: true,
    });
  },
});
