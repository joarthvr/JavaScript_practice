import key from "./key.js";
const BASE_URL = "https://apis.data.go.kr/1543061/abandonmentPublicSrvc";
const { API_KEY } = key;
const $citySelect = document.getElementById("city-select");
const $districtSelect = document.getElementById("district-select");
const $dogOrCatSelect = document.getElementById("dog-or-cat-select");
const $kindSelect = document.getElementById("kind-select");
const $sec3Grid = document.getElementById("sec3-grid");

// 로딩 인디케이터 요소 생성
const $loadingIndicator = document.createElement("div");
$loadingIndicator.id = "loading-indicator";
$loadingIndicator.textContent = "로딩 중...";
$loadingIndicator.style.display = "none";
document.body.appendChild($loadingIndicator);

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
    this.dogOrCat = dogOrCat === "dog" ? "417000" : "422400";
  },
  setKind(kind) {
    this.kind = kind;
  },
};

let currentPage = 1;
let isLoading = false;
let hasMoreData = true;
let girdElementNumber = 0;

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
export const getKind = async (upKindCd) => {
  const data = await fetchAPI("kind", { up_kind_cd: upKindCd });
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
  console.log("data:", data.response.body.items);
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
    gridElement.setAttribute("data-idx", idx);
    gridElement.setAttribute("data-num", girdElementNumber++);
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
    // API 데이터를 그리드 요소에 저장
    gridElement.dataset.apiData = JSON.stringify(element);
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
  $loadingIndicator.style.display = "block";

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
    $loadingIndicator.style.display = "none";
    isLoading = false;
  }
  console.log(currentPage);
};

// Intersection Observer 설정
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !isLoading && hasMoreData) {
      fetchAndRenderGrid();
    }
  });
}, observerOptions);

// 필터 변경 시 그리드 초기화 및 새로운 데이터 로드
const resetAndFetchGrid = () => {
  currentPage = 1;
  $sec3Grid.innerHTML = "";
  hasMoreData = true;
  fetchAndRenderGrid(true);
};

// 이벤트 리스너
$citySelect.addEventListener("change", async (e) => {
  const selectedCity = e.target.value;
  selectedOptionsState.setSelectedCity(selectedCity);
  await fetchAndRenderDistrictsOptions(selectedOptionsState.city);
  resetAndFetchGrid();
});

$districtSelect.addEventListener("change", (e) => {
  const selectedDistrict = e.target.value;
  selectedOptionsState.setDistrict(selectedDistrict);
  resetAndFetchGrid();
});

$dogOrCatSelect.addEventListener("change", async (e) => {
  const selectedDogOrCat = e.target.value;
  selectedOptionsState.setDogOrCat(selectedDogOrCat);
  const upKindCd = selectedDogOrCat === "dog" ? "417000" : "422400";
  const kindData = await getKind(upKindCd);
  renderKindOptions(kindData);
  resetAndFetchGrid();
});

$kindSelect.addEventListener("change", (e) => {
  const selectedKind = e.target.value;
  selectedOptionsState.setKind(selectedKind);
  resetAndFetchGrid();
});

// 초기화
const initialize = () => {
  fetchAndRenderCityOptions();
  fetchAndRenderGrid(true);

  // 로딩 인디케이터에 대한 observer 설정
  intersectionObserver.observe($loadingIndicator);
};

document.addEventListener("DOMContentLoaded", initialize);

const $topBtn = document.getElementById("top-btn");
$topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const $modal = document.getElementById("modal");
const $modalWrap = document.getElementById("modal-wrap");

$sec3Grid.addEventListener("click", (e) => {
  const gridElementContainer = e.target.closest(".sec3-grid-element");
  if (!gridElementContainer) return;

  const apiData = JSON.parse(gridElementContainer.dataset.apiData);
  if (!apiData) {
    console.error("No data found for this element");
    return;
  }

  $modal.classList.add("active");

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  modalContent.innerHTML = `
    <div class="modal-top">
      <div class="modal-img-box">
        <img src="${apiData.popfile || "./img/nono.png"}" alt="${
    apiData.kindCd || "동물 사진"
  }">
        <button class="go-to-shelter">보호소 바로가기 ></button>
      </div>
      <div class="modal-info-box">
        <div class="modal-info-top">
          <p class="animal-id">유기번호: ${
            apiData.desertionNo || "정보 없음"
          }</p>
          <h2 class="animal-name">${apiData.kindCd || "품종 정보 없음"}</h2>
          <p class="protection-period">보호기간 ${
            apiData.noticeSdt || "정보 없음"
          } - ${apiData.noticeEdt || "정보 없음"}</p>
        </div>
        <div class="modal-info-detail">
          <div><p>품종</p></div>
          <div><p>:${apiData.kindCd || "정보 없음"}</p></div>
          <div><p>성별</p></div>
          <div><p>:${apiData.sexCd || "정보 없음"}</p></div>
          <div><p>나이</p></div>
          <div><p>:${apiData.age || "정보 없음"}</p></div>
          <div><p>색상</p></div>
          <div><p>:${apiData.colorCd || "정보 없음"}</p></div>
          <div><p>체중</p></div>
          <div><p>:${apiData.weight || "정보 없음"}</p></div>
          <div><p>상태</p></div>
          <div><p>:${apiData.processState || "정보 없음"}</p></div>
          <div><p>접수일시</p></div>
          <div><p>:${apiData.happenDt || "정보 없음"}</p></div>
         <div><p>발견장소</p></div>
          <div><p>:${apiData.happenPlace || "정보 없음"}</p></div>
          <div><p>보호센터</p></div>
          <div><p><div><p>보호센터</p></div>
          <div><p>:${apiData.careNm || "정보 없음"}</p></div>
          <div></div>
          <div><p>:${apiData.orgNm || "정보 없음"}</p></div>
          <div></div>
          <div><p>:${apiData.careTel || "정보 없음"}</p></div>
          <div><p>담당자</p></div>
          <div><p>:${apiData.chargeNm || "정보 없음"}</p></div>
          <div></div>
          <div><p>:${apiData.officetel || "정보 없음"}</p></div>
        </div>
      </div>
    </div>
  `;

  // 모달 닫기 함수
  function closeModal() {
    $modal.classList.remove("active");
    // 선택적: 모달 내용 초기화
    $modalWrap.innerHTML = "";
  }

  // 모달 바깥 클릭 시 닫기 이벤트
  $modal.addEventListener("click", (e) => {
    // 클릭된 요소가 모달 자체인 경우에만 닫기
    // (이벤트 타겟이 모달이면서 현재 타겟도 모달일 때)
    if (e.target === $modal && e.currentTarget === $modal) {
      closeModal();
    }
  });
  // 기존 모달 내용을 제거하고 새 내용을 추가
  $modalWrap.innerHTML = "";
  $modalWrap.appendChild(modalContent);
});
