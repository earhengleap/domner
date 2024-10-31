'use client'
import { delay } from "@/lib/delay";
import React from "react";

export default async function Loading() {
  await delay(8000)
  return (
    <div className="loader"/>
  );
};


