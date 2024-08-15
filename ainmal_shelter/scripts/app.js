import {
  getCity,
  getDistrict,
  getKind,
  getShelter,
  getPublic,
} from "./fetch.js";

// DOM 조작 및 렌더링
const renderPublics = (publics) => {
  if (!Array.isArray(publics)) {
    console.error("Publics is not an array");
    return;
  }
  const $sec2Grid = document.getElementById("sec2-grid");
  const fragment = document.createDocumentFragment();
  publics.forEach((element, idx) => {
    if (!element) {
      console.warn(`Skipping undefined element at index ${idx}`);
      return;
    }
    const gridElement = document.createElement("div");
    gridElement.id = `sec2-grid-element-${idx}`;
    gridElement.className = "sec2-grid-element";
    const happenDate = element.happenDt
      ? `${element.happenDt.slice(0, 4)}.${element.happenDt.slice(
          4,
          6
        )}.${element.happenDt.slice(6, 8)}`
      : "날짜 없음";
    gridElement.innerHTML = `
          <div class="animal-grid-img">
          <img src="${element.popfile || element.filename || ""}" alt="${
      element.kindCd || "동물 사진"
    }" />
            </div>
            <ul class="sec2-grid-info-ul">
            <li class="sec2-grid-name-date">
            <span>${element.kindCd || "품종 정보 없음"}</span>
            <span>${happenDate}</span>
            </li>
            <li>${element.careNm || "보호소 정보 없음"}</li>
            <li>${element.orgNm || "보호소 위치 정보 없음"}</li>
            <li>유기번호: ${element.desertionNo || "정보 없음"}</li>
            </ul>
            `;
    fragment.appendChild(gridElement);
  });
  $sec2Grid.innerHTML = ""; // 기존 내용을 비우고
  $sec2Grid.appendChild(fragment); // 새 내용을 추가
};

// 유기동물 정보 가져오기 및 렌더링
const fetchAndRenderPublics = async() => {
  try {
    const publicsData = await getPublic({
      numOfRows: 10,
      pageNo: 1,
      upkind: "dog",
      kind: "",
      upr_cd: "",
      org_cd: "",
      bgnde: "20000101",
      endde: "20240101",
      care_reg_no: "",
      state: "",
      neuter_yn: "",
    });
    renderPublics(publicsData);
  } catch (error) {
    console.error("Error fetching or rendering publics:", error);
  }
}
// DOM이 로드된 후 실행
document.addEventListener("DOMContentLoaded", fetchAndRenderPublics);
