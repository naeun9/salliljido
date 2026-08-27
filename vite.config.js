import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 서버에서 /api/* 를 api/ 폴더의 서버리스 함수로 연결하는 플러그인.
//
// 배포(Vercel)에서는 api/*.js가 자동으로 서버리스 함수가 되지만, `vite dev`는
// 그걸 모른다. `vercel dev`를 쓰는 게 정석이나 이 프로젝트 경로에 한글이
// 들어있어 Vercel CLI가 로그인 단계에서 죽는다(docs/03-api-check.md §3).
// 그래서 개발용으로만 같은 핸들러 파일을 그대로 불러서 실행한다 — 배포
// 코드에는 영향이 없고, 프로덕션과 동일한 파일이 실행된다.
function devApiPlugin() {
  return {
    name: "salliljido-dev-api",
    apply: "serve",
    configureServer(server) {
      // .env.local의 서버 전용 키(TOUR_API_KEY)를 process.env로 올린다.
      // VITE_ 접두사가 없는 값은 Vite가 클라이언트로 노출하지 않으므로
      // 키가 번들에 들어갈 일은 없다(CLAUDE.md 보안 규칙).
      const envPath = path.resolve(server.config.root, ".env.local");
      if (fs.existsSync(envPath)) {
        for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
          const eq = line.indexOf("=");
          if (eq === -1) continue;
          const key = line.slice(0, eq).trim();
          const value = line.slice(eq + 1).trim();
          if (key && value && !process.env[key]) process.env[key] = value;
        }
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const parsed = new URL(req.url, "http://localhost");
        const handlerPath = path.resolve(server.config.root, `${parsed.pathname.slice(1)}.js`);
        if (!fs.existsSync(handlerPath)) return next();

        try {
          // 매번 다시 불러와야 핸들러를 고쳤을 때 서버 재시작 없이 반영된다.
          // 절대 경로 대신 루트 기준 경로("/api/...")를 넘긴다 — 이 프로젝트
          // 경로에 한글이 있어서 절대 경로를 쓰면 퍼센트 인코딩된 채로
          // 넘어가 모듈을 못 찾는다.
          const mod = await server.ssrLoadModule(`${parsed.pathname}.js`);
          const query = Object.fromEntries(parsed.searchParams);
          const mockRes = {
            statusCode: 200,
            status(code) {
              this.statusCode = code;
              return this;
            },
            json(body) {
              res.statusCode = this.statusCode;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify(body));
            },
          };
          await mod.default({ query, method: req.method }, mockRes);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: `개발 서버에서 API 실행 실패: ${err.message}` }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
});
