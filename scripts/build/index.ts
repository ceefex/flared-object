import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export interface WorkerBuildVariables {
  workerName: string;
  previewWorkerName: string;
  r2BucketName: string;
  previewR2BucketName: string;
  buildsPreviewR2BucketName: string;
  localR2BucketName: string;
}

export function buildWorkerConfig(vars: WorkerBuildVariables) {
  return {
    $schema: "../../node_modules/wrangler/config-schema.json",
    name: vars.workerName,
    main: "src/index.ts",
    assets: {
      directory: "./public",
      binding: "ASSETS",
    },
    compatibility_date: "2026-10-09",
    workers_dev: true,
    preview_urls: true,
    keep_vars: true,
    cache: {
      enabled: true,
    },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        head_sampling_rate: 1,
      },
      traces: {
        enabled: true,
        head_sampling_rate: 0.01,
      },
    },
    r2_buckets: [
      {
        binding: "MEDIA_BUCKET",
        bucket_name: vars.r2BucketName,
        preview_bucket_name: vars.localR2BucketName,
        remote: false,
      },
    ],
    previews: {
      r2_buckets: [
        {
          binding: "MEDIA_BUCKET",
          bucket_name: vars.buildsPreviewR2BucketName,
        },
      ],
      cache: {
        enabled: true,
      },
    },
    env: {
      preview: {
        name: vars.previewWorkerName,
        r2_buckets: [
          {
            binding: "MEDIA_BUCKET",
            bucket_name: vars.previewR2BucketName,
            preview_bucket_name: vars.previewR2BucketName,
            remote: false,
          },
        ],
        cache: {
          enabled: true,
        },
      },
    },
  };
}

async function loadEnvironment(): Promise<NodeJS.ProcessEnv> {
  const envFileUrl = new URL("../../.env", import.meta.url);
  const exampleFileUrl = new URL("../../.env.example", import.meta.url);

  let fileEnv: NodeJS.ProcessEnv = {};

  try {
    const content = await readFile(envFileUrl, "utf8");
    fileEnv = parseEnv(content);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      try {
        const exampleContent = await readFile(exampleFileUrl, "utf8");
        fileEnv = parseEnv(exampleContent);
      } catch {
        // .env.example also missing or unreadable; proceed with empty
      }
    } else {
      throw error;
    }
  }

  return { ...fileEnv, ...process.env };
}

function getVariable(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`[build] Missing required build variable: ${name}`);
  }
  return value;
}

export async function build(): Promise<void> {
  const env = await loadEnvironment();

  const variables: WorkerBuildVariables = {
    workerName: getVariable(env, "DEPLOY_WORKER_NAME"),
    previewWorkerName: getVariable(env, "DEPLOY_WORKER_PREVIEW_NAME"),
    r2BucketName: getVariable(env, "DEPLOY_R2_BUCKET_NAME"),
    previewR2BucketName: getVariable(env, "DEPLOY_R2_PREVIEW_BUCKET_NAME"),
    buildsPreviewR2BucketName: getVariable(env, "DEPLOY_R2_BUILDS_PREVIEW_BUCKET_NAME"),
    localR2BucketName: getVariable(env, "DEPLOY_R2_LOCAL_BUCKET_NAME"),
  };

  const config = buildWorkerConfig(variables);
  const outputPath = new URL("../../apps/worker/wrangler.deploy.jsonc", import.meta.url);

  await writeFile(outputPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  console.info(`[build] Built Worker deployment config: ${fileURLToPath(outputPath)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build();
}
