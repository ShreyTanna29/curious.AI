import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export default async function useWebContainer() {
  useEffect(() => {
    main();
  });
  const [webcontainer, setWebContainer] = useState<WebContainer>();

  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebContainer(webcontainerInstance);
  }

  return webcontainer;
}
