import React, { useEffect, useRef, useState } from "react";

export default function AnimateNumber({
  number,
}: {
  number?: number | string;
}) {
  const [state, setState] = useState(0);
  const myRef = useRef(state);
  myRef.current = state;

  useEffect(() => {
    const item = Math.abs(Number(number || 0));
    setState(0);
    const interval = setInterval(() => {
      if (myRef.current < item) {
        setState((old) => old + 1);
      }
    }, 500 / item);
    return () => clearInterval(interval);
  }, [number]);
  return <>{state.toFixed(0)}</>;
}
