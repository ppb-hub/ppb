"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { indicatorsConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={indicatorsConfig} />;
}
