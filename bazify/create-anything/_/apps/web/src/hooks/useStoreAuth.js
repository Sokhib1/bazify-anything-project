import { useState, useEffect } from "react";

export function useStoreAuth() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storeData = localStorage.getItem("store");
      if (!storeData) {
        window.location.href = "/store/login";
        return;
      }
      setStore(JSON.parse(storeData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("store");
    window.location.href = "/";
  };

  return { store, handleLogout };
}
