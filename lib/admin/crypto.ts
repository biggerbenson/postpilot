import crypto from "crypto";

type EncryptedPayload = {
  v: 1;
  alg: "aes-256-gcm";
  iv: string; // base64
  tag: string; // base64
  data: string; // base64
};

function getKey(): Buffer {
  const raw = process.env.ADMIN_SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "Missing ADMIN_SETTINGS_ENCRYPTION_KEY (base64 32 bytes) for admin secret encryption"
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("ADMIN_SETTINGS_ENCRYPTION_KEY must be 32 bytes base64");
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    v: 1,
    alg: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: enc.toString("base64"),
  };
  return JSON.stringify(payload);
}

export function decryptSecret(payloadStr: string): string {
  const key = getKey();
  const payload = JSON.parse(payloadStr) as EncryptedPayload;
  if (payload?.v !== 1 || payload?.alg !== "aes-256-gcm") {
    throw new Error("Unsupported encrypted payload");
  }
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const data = Buffer.from(payload.data, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

