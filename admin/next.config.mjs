import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app only ever runs on your own machine, never deployed.
  reactStrictMode: true,
  poweredByHeader: false,
  // The website next door has its own lockfile; tell Next the admin app is its own root.
  turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
