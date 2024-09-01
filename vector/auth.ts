import { jwtDecrypt } from "jose";
import hkdf from "@panva/hkdf";
import { logError } from "./log";

const alg = "dir";
const enc = "A256CBC-HS512";
const API_TOKEN = process.env.API_TOKEN!;
const JWT_SECRET = process.env.JWT_SECRET!;

export function checkAuth(req: Request, path: string) {
  if (path === "/api/index/local-file") {
    return;
  }
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader || authorizationHeader !== `${API_TOKEN}`) {
    return Response.json("Unauthorized", { status: 401 });
  }
}

export async function getToken(req: Request, isDev: boolean) {
  try {
    const tokenStr = req.headers.get("Token");
    if (!tokenStr) {
      return null;
    }
    return await decryptToken(tokenStr, isDev);
  } catch (error) {
    logError(error as Error, "getToken");
    return null;
  }
}

async function decryptToken(token: string, isDev: boolean) {
  const salt = isDev ? "authjs.session-token" : `__Secure-authjs.session-token`;
  const encryptionKey = await getDerivedEncryptionKey(enc, JWT_SECRET, salt);
  const { payload } = await jwtDecrypt(token, encryptionKey, {
    clockTolerance: 15,
    keyManagementAlgorithms: [alg],
    contentEncryptionAlgorithms: [enc, "A256GCM"],
  });
  return payload;
}

async function getDerivedEncryptionKey(
  enc: string,
  keyMaterial: Parameters<typeof hkdf>[1],
  salt: Parameters<typeof hkdf>[2]
) {
  const length = enc === "A256CBC-HS512" ? 64 : 32;
  return await hkdf(
    "sha256",
    keyMaterial,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    length
  );
}
