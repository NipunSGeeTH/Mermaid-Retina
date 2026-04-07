"use client";

import dynamic from "next/dynamic";

const MermaidWorkbench = dynamic(() => import("@/components/MermaidWorkbench"), {
  ssr: false,
});

export default MermaidWorkbench;

