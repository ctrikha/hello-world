import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
export { STATE_TO_REGION } from "@/lib/constants";

export async function getOrganizationFromRequest() {
  const headerStore = await headers();
  const orgId = headerStore.get("x-org-id");
  if (!orgId) return null;
  return prisma.organization.findUnique({ where: { id: orgId } });
}

export async function resolveOrgFromHost(host: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const baseDomain = new URL(appUrl).hostname;

  // Custom domain
  if (host !== baseDomain && !host.endsWith(`.${baseDomain}`)) {
    return prisma.organization.findUnique({ where: { customDomain: host } });
  }

  // Subdomain: app.example.com → slug = "app"
  if (host.endsWith(`.${baseDomain}`)) {
    const slug = host.replace(`.${baseDomain}`, "");
    return prisma.organization.findUnique({ where: { slug } });
  }

  return null;
}
