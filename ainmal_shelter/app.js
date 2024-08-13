import key from "./key.js";
const { API_KEY } = key;
const BASE_URL = "https://apis.data.go.kr/1543061/abandonmentPublicSrvc";

async function fetchData(endpoint, params) {
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
}

async function getCity() {
  const data = await fetchData("sido", { numOfRows: 10, pageNo: 1 });
  if (!data.response?.body?.items?.item) {
    throw new Error("시도 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
}

async function getDistrict(uprCd) {
  const data = await fetchData("sigungu", { upr_cd: uprCd });
  if (!data.response?.body?.items?.item) {
    throw new Error("시군구 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
}

async function getKind(kind) {
  console.log("kind:", kind);
  const dogOrCat = kind === "dog" ? 417000 : 422400;
  const data = await fetchData("kind", { up_kind_cd: dogOrCat });
  if (!data.response?.body?.items?.item) {
    throw new Error("품종 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
}

async function getPublic(params) {
  const { upkind, ...otherParams } = params;
  const upkindCode = upkind === "dog" ? 417000 : 422400;
  const data = await fetchData("abandonmentPublic", {
    upkind: upkindCode,
    ...otherParams,
  });
  if (!data.response?.body?.items?.item) {
    throw new Error("유기동물 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
}
async function getShelter(uprCd, orgCd) {
  const data = await fetchData("shelter", { upr_cd: uprCd, org_cd: orgCd });
  if (!data.response.body.items.item) {
    alert("보호소가 없습니다.");
  }
  return data.response.body.items.item;
}
async function main() {
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
    const publics = await getPublic({
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
    console.log("Publics:", publics);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
