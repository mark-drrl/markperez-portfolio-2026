import { useEffect, useState } from "react";

export function useFinePointer() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (pointer: fine)");

    function update() {
      setIsFinePointer(query.matches);
    }

    update();
    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return isFinePointer;
}
