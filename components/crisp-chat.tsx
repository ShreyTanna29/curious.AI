"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("7f08f048-7392-4991-9f36-33ee14b30f35");
  }, []);

  return null;
};
