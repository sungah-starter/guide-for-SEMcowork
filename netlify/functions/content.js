const { getStore } = require("@netlify/blobs");
const { getSession } = require("./utils/auth");
const { DEFAULT_JUGANGSA, DEFAULT_BOJO } = require("./utils/seed");

const STORE_NAME = "semco-guide-content";
const KEY = "docs";

function jsonResponse(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...(extraHeaders || {}) },
    body: JSON.stringify(body),
  };
}

// Some Netlify accounts/runtimes don't auto-inject Blobs context into functions.
// When that happens, fall back to explicit siteID + token (see README for how to
// obtain NETLIFY_SITE_ID and NETLIFY_BLOBS_TOKEN).
function getContentStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

exports.handler = async (event) => {
  const session = getSession(event);
  if (!session || (session.role !== "view" && session.role !== "admin")) {
    return jsonResponse(401, { error: "로그인이 필요합니다." });
  }

  let store;
  try {
    store = getContentStore();
  } catch (e) {
    console.error("Blobs store init failed:", e);
    return jsonResponse(500, {
      error:
        "저장소(Netlify Blobs) 연결에 실패했습니다. NETLIFY_SITE_ID / NETLIFY_BLOBS_TOKEN 환경변수 설정을 확인해 주세요.",
    });
  }

  if (event.httpMethod === "GET") {
    try {
      let doc = await store.get(KEY, { type: "json" });
      if (!doc) {
        doc = {
          jugangsa: DEFAULT_JUGANGSA,
          bojo: DEFAULT_BOJO,
          updatedAt: null,
        };
      }
      return jsonResponse(200, { ...doc, role: session.role });
    } catch (e) {
      console.error("Blobs get failed:", e);
      return jsonResponse(500, { error: "내용을 불러오는 중 오류가 발생했습니다: " + e.message });
    }
  }

  if (event.httpMethod === "PUT" || event.httpMethod === "POST") {
    if (session.role !== "admin") {
      return jsonResponse(403, { error: "수정 권한이 없습니다. 관리자 계정으로 로그인해 주세요." });
    }
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return jsonResponse(400, { error: "요청 형식이 올바르지 않습니다." });
    }
    try {
      const existing = (await store.get(KEY, { type: "json" })) || {};
      const updated = {
        jugangsa: typeof body.jugangsa === "string" ? body.jugangsa : existing.jugangsa || DEFAULT_JUGANGSA,
        bojo: typeof body.bojo === "string" ? body.bojo : existing.bojo || DEFAULT_BOJO,
        updatedAt: new Date().toISOString(),
      };
      await store.setJSON(KEY, updated);
      return jsonResponse(200, { ...updated, role: session.role });
    } catch (e) {
      console.error("Blobs write failed:", e);
      return jsonResponse(500, { error: "저장하는 중 오류가 발생했습니다: " + e.message });
    }
  }

  return jsonResponse(405, { error: "지원하지 않는 요청입니다." });
};
