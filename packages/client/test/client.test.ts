import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createFlaredClient } from "@/index";
import { validateSignedUrl } from "@ceefex/flared-object-core";

const TEST_SECRET = "super-secret-hmac-key-for-testing-purposes-12345";
const BASE_URL = "https://media.example.com";

describe("FlaredClient", () => {
  it("throws if baseUrl or hmacSecret is missing", () => {
    assert.throws(
      () => createFlaredClient({ baseUrl: "", hmacSecret: "abc" }),
      /`baseUrl` is required/,
    );
    assert.throws(
      () => createFlaredClient({ baseUrl: "https://example.com", hmacSecret: "" }),
      /`hmacSecret` is required/,
    );
  });

  it("normalizes baseUrl trailing slash and path leading slash", async () => {
    const client = createFlaredClient({
      baseUrl: "https://media.example.com///",
      hmacSecret: TEST_SECRET,
    });

    const url = await client.signUrl("comics/one-piece/01.webp");
    assert.ok(url.startsWith("https://media.example.com/comics/one-piece/01.webp?"));
    assert.ok(!url.includes(".com//"));
  });

  it("produces signed URLs that are valid in @ceefex/flared-object-core", async () => {
    const client = createFlaredClient({
      baseUrl: BASE_URL,
      hmacSecret: TEST_SECRET,
      defaultTtlSeconds: 300,
    });

    const signedUrlString = await client.signUrl("/chapters/101/panel-1.jpg");
    const parsedUrl = new URL(signedUrlString);

    // Validate using the core gateway validator directly
    const coreValidation = await validateSignedUrl(parsedUrl, TEST_SECRET);
    assert.equal(coreValidation.valid, true);

    // Validate using client.verifyUrl
    const clientValidation = await client.verifyUrl(signedUrlString);
    assert.equal(clientValidation.valid, true);
  });

  it("correctly identifies expired URLs", async () => {
    const client = createFlaredClient({
      baseUrl: BASE_URL,
      hmacSecret: TEST_SECRET,
    });

    // Signed with expiration in the past (10 seconds ago)
    const pastExpires = Math.floor(Date.now() / 1000) - 10;
    const expiredUrl = await client.signUrl("/chapter/01.jpg", {
      expiresAt: pastExpires,
    });

    const verification = await client.verifyUrl(expiredUrl);
    assert.equal(verification.valid, false);
    assert.equal(verification.error, "Token has expired");

    const parsed = client.parseUrl(expiredUrl);
    assert.equal(parsed.isExpired, true);
  });

  it("rejects tampered or forged tokens", async () => {
    const client = createFlaredClient({
      baseUrl: BASE_URL,
      hmacSecret: TEST_SECRET,
    });

    const validUrl = await client.signUrl("/chapter/01.jpg");
    const tamperedUrl = validUrl.replace("token=", "token=tampered_");

    const verification = await client.verifyUrl(tamperedUrl);
    assert.equal(verification.valid, false);
    assert.equal(verification.error, "Invalid token");
  });

  it("signs batches of URLs efficiently and consistently", async () => {
    const client = createFlaredClient({
      baseUrl: BASE_URL,
      hmacSecret: TEST_SECRET,
      defaultTtlSeconds: 1800,
    });

    const pages = [
      "chapter/1/01.webp",
      "chapter/1/02.webp",
      "chapter/1/03.webp",
      "chapter/1/04.webp",
    ];

    const signedPages = await client.signBatch(pages);
    assert.equal(signedPages.length, 4);

    for (let i = 0; i < signedPages.length; i++) {
      const url = signedPages[i];
      assert.ok(url.includes(pages[i]));
      const validation = await validateSignedUrl(new URL(url), TEST_SECRET);
      assert.equal(validation.valid, true);
    }
  });

  it("appends custom query params properly", async () => {
    const client = createFlaredClient({
      baseUrl: BASE_URL,
      hmacSecret: TEST_SECRET,
    });

    const url = await client.signUrl("/avatar.jpg", {
      params: { w: 400, format: "webp" },
    });

    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("w"), "400");
    assert.equal(parsed.searchParams.get("format"), "webp");
    assert.ok(parsed.searchParams.has("token"));
    assert.ok(parsed.searchParams.has("expires"));
  });
});
