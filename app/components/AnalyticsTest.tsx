"use client";

import { track } from "@vercel/analytics";

export function AnalyticsTest() {
  const handleClick = () => {
    track("test-event");
    console.log("Test event tracked");
  };

  return <button onClick={handleClick}>Track Test Event</button>;
}
