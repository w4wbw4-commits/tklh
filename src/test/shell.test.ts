import { describe, expect, it } from "vitest";
import { resolveShell } from "@/apps/shell";

// Production host → audience mapping. These assertions are the contract the DNS
// records depend on: each hostname must mount exactly one shell, and local and
// preview hosts must keep mounting everything so the editor stays usable.
describe("resolveShell", () => {
  it("maps the customer domain and www to the customer shell", () => {
    expect(resolveShell("tklh.sa")).toBe("customer");
    expect(resolveShell("www.tklh.sa")).toBe("customer");
    expect(resolveShell("TKLH.SA")).toBe("customer");
  });

  it("maps the partner subdomain to the partner shell", () => {
    expect(resolveShell("partner.tklh.sa")).toBe("partner");
  });

  it("maps the admin subdomain to the admin shell", () => {
    expect(resolveShell("admin.tklh.sa")).toBe("admin");
  });

  it("mounts every shell on local and preview hosts", () => {
    expect(resolveShell("localhost")).toBe("all");
    expect(resolveShell("id-preview--abc.lovable.app")).toBe("all");
    expect(resolveShell("tklh.lovable.app")).toBe("all");
  });
});
