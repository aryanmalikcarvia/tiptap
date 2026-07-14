// import type { UploadedMediaItem } from "@/lib/mediaUpload";

// const MEDIA_KEY = "tiptap-attachments";
// const EDITOR_KEY = "tiptap-editor-html";

// export function loadAttachments(): UploadedMediaItem[] {
//   try {
//     const raw = localStorage.getItem(MEDIA_KEY);
//     if (!raw) return [];

//     const parsed = JSON.parse(raw) as UploadedMediaItem[];
//     if (!Array.isArray(parsed)) return [];

//     // blob: URLs die after refresh — keep only real http(s) links
//     return parsed.filter(
//       (item) =>
//         item &&
//         typeof item.url === "string" &&
//         (item.url.startsWith("http://") || item.url.startsWith("https://")) &&
//         typeof item.cid === "string"
//     );
//   } catch {
//     return [];
//   }
// }

// export function saveAttachments(items: UploadedMediaItem[]) {
//   const durable = items.filter(
//     (item) =>
//       item.url.startsWith("http://") || item.url.startsWith("https://")
//   );
//   localStorage.setItem(MEDIA_KEY, JSON.stringify(durable));
// }

// export function loadEditorHtml(): string | null {
//   try {
//     return localStorage.getItem(EDITOR_KEY);
//   } catch {
//     return null;
//   }
// }

// export function saveEditorHtml(html: string) {
//   localStorage.setItem(EDITOR_KEY, html);
// }
