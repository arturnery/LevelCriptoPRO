import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["server/trpc-handler.ts"],
  platform: "node",
  packages: "external",
  bundle: true,
  format: "esm",
  outfile: "api/trpc/[trpc].js",
});

console.log("  api/trpc/[trpc].js bundled");
