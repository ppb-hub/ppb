"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { updatesConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={updatesConfig} />;
}
