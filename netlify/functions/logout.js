const { clearSessionCookie } = require("./utils/auth");

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    },
    body: JSON.stringify({ ok: true }),
  };
};
