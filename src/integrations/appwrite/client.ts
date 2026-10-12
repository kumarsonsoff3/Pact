import "server-only";
import { Client, Storage } from "node-appwrite";
import { requireSettings } from "@/lib/config";

export function getEvidenceStorage() {
  requireSettings([
    "APPWRITE_ENDPOINT",
    "APPWRITE_PROJECT_ID",
    "APPWRITE_API_KEY",
    "APPWRITE_EVIDENCE_BUCKET_ID",
  ]);
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return new Storage(client);
}
// Future upload/read services must authorize membership before using this privileged adapter.
