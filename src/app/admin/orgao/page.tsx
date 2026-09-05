"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { orgConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={orgConfig} />;
}
