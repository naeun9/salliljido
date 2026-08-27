// 지역기반 관광정보 조회(areaBasedList2). 한국관광공사 인증키(TOUR_API_KEY)는
// 여기 서버리스 함수에서만 쓰고 프론트엔드로 노출하지 않는다(CLAUDE.md 보안
// 규칙). 실시간 호출만 쓰고 로컬 DB 저장은 하지 않는다.
//
// GET /api/tour/area-based?lDongRegnCd=44&lDongSignguCd=825&contentTypeId=12
//
// 받는 쿼리 파라미터(전부 선택값, 그대로 API에 전달):
//   lDongRegnCd, lDongSignguCd — 법정동 코드(src/data/regionCodes.js 참고)
//   contentTypeId — 12 관광지 · 14 문화시설 · 28 레포츠 · 32 숙박 · 39 음식점 등
//   lclsSystm1, lclsSystm2, lclsSystm3 — 분류체계(예: EX 체험관광, FD 음식)
//   numOfRows, pageNo, arrange
//
// 호출 최적화 지침(docs/03-api-check.md §11, 실제로 확인한 내용):
//   - 식당·카페는 contentTypeId=39 하나만 쓸 것. lclsSystm1=FD를 같이
//     걸어도(파일럿 3지역 전부) 결과가 완전히 같아서 의미가 없다.
//   - 체험 프로그램은 lclsSystm1=EX 하나만 쓸 것. EX는 항상
//     contentTypeId=12(관광지)의 부분집합이라 같이 걸어도 결과는
//     같지만, EX만 쓰는 쪽이 의도를 더 분명히 드러낸다.
//   - 숙박은 이 엔드포인트(contentTypeId=32)만으로는 소도시에서 데이터가
//     너무 얇다(docs/03-api-check.md §4) — api/tour/camping.js(고캠핑)
//     결과와 합쳐서 써야 한다.
import { callTourApi, normalizeItems } from "../_lib/tourApi.js";

// 관광공사 응답 필드 중 실제로 값이 들어있는 것만 정리했다(docs/03-api-check.md
// §3 참고 — areacode/sigungucode/cat1~3는 최신 데이터일수록 비어 있는 경우가
// 많아 화면에서 못 쓴다). 화면단은 아직 안 건드리므로 여기서는 원본 필드명을
// 최대한 유지하면서 자주 비는 필드만 빼는 선에서 정리했다.
function normalizeItem(raw) {
  return {
    contentId: raw.contentid,
    contentTypeId: raw.contenttypeid,
    title: raw.title,
    addr1: raw.addr1,
    addr2: raw.addr2,
    lDongRegnCd: raw.lDongRegnCd,
    lDongSignguCd: raw.lDongSignguCd,
    lclsSystm1: raw.lclsSystm1,
    lclsSystm2: raw.lclsSystm2,
    lclsSystm3: raw.lclsSystm3,
    image: raw.firstimage || raw.firstimage2 || "",
    mapX: raw.mapx ? Number(raw.mapx) : null,
    mapY: raw.mapy ? Number(raw.mapy) : null,
    tel: raw.tel,
    zipcode: raw.zipcode,
    createdTime: raw.createdtime,
    modifiedTime: raw.modifiedtime,
  };
}

export default async function handler(req, res) {
  const {
    lDongRegnCd,
    lDongSignguCd,
    contentTypeId,
    lclsSystm1,
    lclsSystm2,
    lclsSystm3,
    numOfRows = "20",
    pageNo = "1",
    arrange = "A",
  } = req.query;

  const params = {
    numOfRows,
    pageNo,
    arrange,
    lDongRegnCd,
    lDongSignguCd,
    contentTypeId,
    lclsSystm1,
    lclsSystm2,
    lclsSystm3,
  };

  const result = await callTourApi("areaBasedList2", params);
  if (!result.ok) {
    return res.status(502).json({ error: result.message, errorCode: result.errorCode });
  }

  const items = normalizeItems(result.body).map(normalizeItem);
  res.status(200).json({
    items,
    totalCount: result.body.totalCount ?? items.length,
    numOfRows: result.body.numOfRows ?? items.length,
    pageNo: result.body.pageNo ?? Number(pageNo),
  });
}
