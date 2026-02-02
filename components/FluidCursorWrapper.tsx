"use client";

import dynamic from "next/dynamic";

const GhostCursor = dynamic(() => import("@/components/GhostCursor"), {
    ssr: false,
});

export default function FluidCursorWrapper() {
    return <GhostCursor />;
}
