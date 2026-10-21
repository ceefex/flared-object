// Generated types for Pages Functions environment
interface Env {
  MEDIA_BUCKET: R2Bucket;
  SECURITY_MODE?: string;
  HMAC_SECRET?: string;
  ALLOWED_REFERERS?: string;
  EXCLUDE_PATHS?: string;
}

// PagesFunction type for Cloudflare Pages Functions
type PagesFunction<
  Env = unknown,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>,
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

interface EventContext<Env, Params extends string, Data extends Record<string, unknown>> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env & { ASSETS: { fetch: typeof fetch } };
  params: Record<Params, string | string[]>;
  data: Data;
}
