// 법정동 코드 조회(ldongCode2). 지역기반 조회(areaBasedList2)에 필요한
// lDongRegnCd(시도)/lDongSignguCd(시군구)를 찾을 때 쓴다. 예전 areaCode
// 방식은 폐기됐다(docs/03-api-check.md 참고).
//
// GET /api/tour/ldong                     → 시도 목록
// GET /api/tour/ldong?lDongRegnCd=44      → 그 시도 아래 시군구 목록
import { callTourApi, normalizeItems } from "../_lib/tourApi.js";

export default async function handler(req, res) {
  const { lDongRegnCd, numOfRows = "50", pageNo = "1" } = req.query;

  const params = { numOfRows, pageNo };
  if (lDongRegnCd) params.lDongRegnCd = lDongRegnCd;

  const result = await callTourApi("ldongCode2", params);
  if (!result.ok) {
    return res.status(502).json({ error: result.message, errorCode: result.errorCode });
  }

  const items = normalizeItems(result.body).map((it) => ({ code: it.code, name: it.name }));
  res.status(200).json({ items, totalCount: result.body.totalCount ?? items.length });
}
