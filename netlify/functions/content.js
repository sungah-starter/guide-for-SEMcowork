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

exports.handler = async (event) => {
  const session = getSession(event);
  if (!session || (session.role !== "view" && session.role !== "admin")) {
    return jsonResponse(401, { error: "로그인이 필요합니다." });
  }

  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    let doc = await store.get(KEY, { type: "json" });
    if (!doc) {
      doc = {
        jugangsa: DEFAULT_JUGANGSA,
        bojo: DEFAULT_BOJO,
        updatedAt: null,
      };
    }
    return jsonResponse(200, { ...doc, role: session.role });
  }

  if (event.httpMethod === "PUT") {
    if (session.role !== "admin") {
      return jsonResponse(403, { error: "수정 권한이 없습니다. 관리자 계정으로 로그인해 주세요." });
    }
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return jsonResponse(400, { error: "요청 형식이 올바르지 않습니다." });
    }
    const existing = (await store.get(KEY, { type: "json" })) || {};
    const updated = {
      jugangsa: typeof body.jugangsa === "string" ? body.jugangsa : existing.jugangsa || DEFAULT_JUGANGSA,
      bojo: typeof body.bojo === "string" ? body.bojo : existing.bojo || DEFAULT_BOJO,
      updatedAt: new Date().toISOString(),
    };
    await store.setJSON(KEY, updated);
    return jsonResponse(200, { ...updated, role: session.role });
  }

  return jsonResponse(405, { error: "지원하지 않는 요청입니다." });
};
