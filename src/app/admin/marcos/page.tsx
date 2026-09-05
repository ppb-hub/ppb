"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { milestonesConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={milestonesConfig} />;
}
