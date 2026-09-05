"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { opportunitiesConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={opportunitiesConfig} />;
}
