import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

let webcontainerInstance: WebContainer | null = null;

export default function useWebContainer() {
  const [webcontainer, setWebContainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    async function bootWebContainer() {
      if (!webcontainerInstance) {
        webcontainerInstance = await WebContainer.boot();
      }
      setWebContainer(webcontainerInstance);
    }

    bootWebContainer();
  }, []);

  return webcontainer;
}
