import { getDomain } from "tldts";

export function resolveRootDomain(hostname = "") {
  return getDomain(hostname) || hostname;
}