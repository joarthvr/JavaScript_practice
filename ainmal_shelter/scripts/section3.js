import key from "./key.js";
const BASE_URL = "https://apis.data.go.kr/1543061/abandonmentPublicSrvc";
const { API_KEY } = key;
const $citySelect = document.getElementById("city-select");
const $districtSelect = document.getElementById("district-select");
const $dogOrCatSelect = document.getElementById("dog-or-cat-select");
const $kindSelect = document.getElementById("kind-select");
const $sec3Grid = document.getElementById("sec3-grid");
// const $loadingIndicator = document.getElementById("loading-indicator");

// 선택된 옵션 상태
const selectedOptionsState = {
  city: "",
  district: "",
  dogOrCat: "",
  kind: "",
  setSelectedCity(city) {
    this.city = city;
  },
  setDistrict(district) {
    this.district = district;
  },
  setDogOrCat(dogOrCat) {
    this.dogOrCat = dogOrCat;
  },
  setKind(kind) {
    this.kind = kind;
  },
};

let currentPage = 1;
let isLoading = false;
let hasMoreData = true;

const fetchAPI = async (endpoint, params) => {
  try {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.search = new URLSearchParams({
      serviceKey: API_KEY,
      _type: "json",
      ...params,
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// 품종 정보 가져오기
export const getKind = async (kind) => {
  const dogOrCat = kind === "dog" ? 417000 : 422400;
  const data = await fetchAPI("kind", { up_kind_cd: dogOrCat });
  if (!data.response?.body?.items?.item) {
    throw new Error("품종 정보를 가져오는데 실패했습니다.");
  }
  return data.response.body.items.item;
};

//cities option 생성
const renderCitiesOptions = async (arr) => {
  const fragment = document.createDocumentFragment();
  arr.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.orgCd;
    option.textContent = element.orgdownNm;
    fragment.appendChild(option);
  });
  $citySelect.appendChild(fragment);
};

// 시도 정보 가져오기
const fetchAndRenderCityOptions = async () => {
  try {
    const data = await fetchAPI("sido", { numOfRows: 17, pageNo: 1 });
    if (!data.response?.body?.items?.item) {
      throw new Error("시도 정보를 가져오는데 실패했습니다.");
    }
    renderCitiesOptions(data.response.body.items.item);
    return data.response.body.items.item;
  } catch (error) {
    console.error("시도 정보 조회 중 오류 발생:", error);
    throw error;
  }
};

//시군구 option 생성
const renderDistrictsOptions = async (arr) => {
  $districtSelect.innerHTML = `<option value="null" selected>시/군/구 선택</option>`;
  const fragment = document.createDocumentFragment();
  arr.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.orgCd;
    option.textContent = element.orgdownNm;
    fragment.appendChild(option);
  });
  $districtSelect.appendChild(fragment);
};

// 시군구 정보 가져오기
const fetchAndRenderDistrictsOptions = async (uprCd) => {
  const data = await fetchAPI("sigungu", { upr_cd: uprCd });
  if (!data.response?.body?.items?.item) {
    $districtSelect.innerHTML = `<option value="null" selected>시/군/구 선택</option>`;
    throw new Error("시군구 정보를 가져오는데 실패했습니다.");
  }
  renderDistrictsOptions(data.response.body.items.item);
  return data.response.body.items.item;
};

const renderKindOptions = async (arr) => {
  $kindSelect.innerHTML = `<option value="null" selected>품종 선택</option>`;
  const fragment = document.createDocumentFragment();
  arr.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.kindCd;
    option.textContent = element.knm;
    fragment.appendChild(option);
  });
  $kindSelect.appendChild(fragment);
};

//grid
const getPublic = async (params) => {
  const data = await fetchAPI("abandonmentPublic", params);
  if (!data.response?.body?.items?.item) {
    return [];
  }
  return Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : [data.response.body.items.item];
};

const renderPublics = (publics, isNewSearch) => {
  if (!Array.isArray(publics) || publics.length === 0) {
    $sec3Grid.innerHTML = "<p>표시할 데이터가 없습니다.</p>";
    return;
  }

  if (isNewSearch) {
    $sec3Grid.innerHTML = "";
  }

  const fragment = document.createDocumentFragment();
  publics.forEach((element, idx) => {
    const gridElement = document.createElement("div");
    gridElement.id = `sec3-grid-element-${idx}`;
    gridElement.className = "sec3-grid-element";
    const happenDate = element.happenDt
      ? `${element.happenDt.slice(0, 4)}.${element.happenDt.slice(
          4,
          6
        )}.${element.happenDt.slice(6, 8)}`
      : "날짜 없음";
    gridElement.innerHTML = `
      <div class="sec3-grid-img-box">
        <img class="sec3-grid-img" src="${
          element.popfile || "./img/nono.png"
        }" alt="${element.kindCd || "동물 사진"}" />
      </div>
      <ul class="sec3-grid-info-ul">
        <li class="sec3-grid-name-date">
          <span>${element.kindCd || "품종 정보 없음"}</span>
          <span>${happenDate}</span>
        </li>
        <li>${element.careNm || "보호소 정보 없음"}</li>
        <li>${element.orgNm || "보호소 위치 정보 없음"}</li>
        <li>유기번호: ${element.desertionNo || "정보 없음"}</li>
        <li>${element.noticeSdt || "정보 없음"}-${
      element.noticeEdt || "정보 없음"
    }</li>
      </ul>
    `;
    fragment.appendChild(gridElement);
  });
  $sec3Grid.appendChild(fragment);
};

const fetchAndRenderGrid = async (isNewSearch = false) => {
  if (isLoading || !hasMoreData) return;

  const { city, district, dogOrCat, kind } = selectedOptionsState;

  if (isNewSearch) {
    currentPage = 1;
    $sec3Grid.innerHTML = "";
    hasMoreData = true;
  }

  isLoading = true;
  // $loadingIndicator.style.display = 'block';

  try {
    const publicsData = await getPublic({
      numOfRows: 8,
      pageNo: currentPage,
      upkind: dogOrCat,
      kind: kind,
      upr_cd: city,
      org_cd: district,
      bgnde: "",
      endde: "",
      care_reg_no: "",
      state: "",
      neuter_yn: "",
    });

    if (publicsData.length === 0) {
      hasMoreData = false;
      if (currentPage === 1) {
        $sec3Grid.innerHTML = "<p>표시할 데이터가 없습니다.</p>";
      }
    } else {
      renderPublics(publicsData, isNewSearch);
      currentPage++;
    }
  } catch (error) {
    console.error("Error fetching or rendering publics:", error);
    $sec3Grid.innerHTML += "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
  } finally {
    isLoading = false;
    // $loadingIndicator.style.display = 'none';
  }
};

// 이벤트 리스너
$citySelect.addEventListener("change", async (e) => {
  const selectedCity = e.target.value;
  selectedOptionsState.setSelectedCity(selectedCity);
  await fetchAndRenderDistrictsOptions(selectedOptionsState.city);
  fetchAndRenderGrid(true);
});

$districtSelect.addEventListener("change", async (e) => {
  const selectedDistrict = e.target.value;
  selectedOptionsState.setDistrict(selectedDistrict);
  fetchAndRenderGrid(true);
});

$dogOrCatSelect.addEventListener("change", async (e) => {
  const selectedDogOrCat = e.target.value;
  selectedOptionsState.setDogOrCat(selectedDogOrCat);
  const getgetKind = await getKind(selectedDogOrCat);
  renderKindOptions(getgetKind);
  fetchAndRenderGrid(true);
});

$kindSelect.addEventListener("change", async (e) => {
  const selectedKind = e.target.value;
  selectedOptionsState.setKind(selectedKind);
  fetchAndRenderGrid(true);
});

// 무한 스크롤 이벤트 리스너
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    fetchAndRenderGrid();
  }
});

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderCityOptions();
  fetchAndRenderGrid();
});
const $topBtn = document.getElementById("top-btn");
$topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});