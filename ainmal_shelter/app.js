import key from "./key.js";
const { API_KEY } = key;
const BASE_URL = "https://apis.data.go.kr/1543061/abandonmentPublicSrvc";

// 패치 함수
const fetchData = async (endpoint, params) => {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.search = new URLSearchParams({
    serviceKey: API_KEY,
    _type: "json",
    ...params,
  });
  console.log("Fetching URL:", url.toString()); // 디버깅을 위한 URL 출력
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

// 시도 정보 가져오기
const getCity = async () => {
  const data = await fetchData("sido", { numOfRows: 10, pageNo: 1 });
  if (!data.response?.body?.items?.item) {
    throw new Error("시도 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
};

// 시군구 정보 가져오기
const getDistrict = async (uprCd) => {
  const data = await fetchData("sigungu", { upr_cd: uprCd });
  if (!data.response?.body?.items?.item) {
    throw new Error("시군구 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
};

// 품종 정보 가져오기
const getKind = async (kind) => {
  console.log("kind:", kind);
  const dogOrCat = kind === "dog" ? 417000 : 422400;
  const data = await fetchData("kind", { up_kind_cd: dogOrCat });
  if (!data.response?.body?.items?.item) {
    throw new Error("품종 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
};

// 보호소 정보 가져오기
const getShelter = async (uprCd, orgCd) => {
  const data = await fetchData("shelter", { upr_cd: uprCd, org_cd: orgCd });
  if (!data.response.body.items.item) {
    alert("보호소가 없습니다.");
  }
  return data.response.body.items.item;
};

// 유기동물 정보 가져오기 및 렌더링
const getPublic = async (params) => {
  const { upkind, ...otherParams } = params;
  const upkindCode = upkind === "dog" ? 417000 : 422400;
  const data = await fetchData("abandonmentPublic", {
    upkind: upkindCode,
    ...otherParams,
  });
  if (!data.response?.body?.items?.item) {
    alert("해당 조건의 유기동물이 없습니다.");
  }
  const publics = data.response.body.items.item;
  console.log("Publics:", publics);
  renderPublics(publics);  // 데이터를 가져온 후 바로 렌더링
};

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
      ? `${element.happenDt.slice(0, 4)}.${element.happenDt.slice(4, 6)}.${element.happenDt.slice(6, 8)}`
      : "날짜 없음";

    gridElement.innerHTML = `
      <div class="animal-grid-img">
        <img src="${element.popfile || element.filename || ""}" alt="${element.kindCd || "동물 사진"}" />
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

  $sec2Grid.innerHTML = '';  // 기존 내용을 비우고
  $sec2Grid.appendChild(fragment);  // 새 내용을 추가
};

const main = async () => {
  try {
    const cities = await getCity();
    console.log("Cities:", cities);
    const districts = await getDistrict(cities[1].orgCd);
    const kinds = await getKind("dog");
    const shelters = await getShelter(districts[1].uprCd, districts[1].orgCd);
    console.log("Cities:", cities);
    console.log("Kinds:", kinds);
    console.log("Districts:", districts);
    console.log("Shelter:", shelters);
    console.log("Shelters:", shelters[0].careRegNo);
    
    await getPublic({
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
    
  } catch (error) {
    console.error("Error:", error.message);
  }
};

main();