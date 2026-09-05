"use client";

import ResourcePage from "@/components/admin/ResourcePage";
import { investorDocsConfig } from "@/components/admin/resources";

export default function Page() {
  return <ResourcePage config={investorDocsConfig} />;
}
