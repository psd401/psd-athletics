// Run one job handler by name: `bun run job deliver-alerts`.
export {};

const jobName = process.argv[2];
if (!jobName || !/^[a-z0-9-]+$/.test(jobName)) {
  console.error("Usage: bun run job <name>   (a file in jobs/)");
  process.exit(1);
}
const job = (await import(`../jobs/${jobName}.ts`)) as { default: () => Promise<unknown> };
console.info(JSON.stringify(await job.default()));
