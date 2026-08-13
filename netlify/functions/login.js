const { createSessionCookie } = require("./utils/auth");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "지원하지 않는 요청입니다." }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "요청 형식이 올바르지 않습니다." }) };
  }

  const password = (body.password || "").toString();
  const VIEW_PASSWORD = process.env.VIEW_PASSWORD;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!VIEW_PASSWORD || !ADMIN_PASSWORD) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "서버에 VIEW_PASSWORD / ADMIN_PASSWORD 환경변수가 설정되어 있지 않습니다.",
      }),
    };
  }

  let role = null;
  if (password && password === ADMIN_PASSWORD) {
    role = "admin";
  } else if (password && password === VIEW_PASSWORD) {
    role = "view";
  }

  if (!role) {
    return { statusCode: 401, body: JSON.stringify({ error: "비밀번호가 올바르지 않습니다." }) };
  }

  const cookie = createSessionCookie(role);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
    body: JSON.stringify({ role }),
  };
};
