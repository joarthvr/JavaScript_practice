import { fetchData, getKind } from "./fetch.js";
const $citySelect = document.getElementById("city-select");
const $districtSelect = document.getElementById("district-select");
const $dogOrCatSelect = document.getElementById("dog-or-cat-select");
const $kindSelect = document.getElementById("kind-select");

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
//cities html 생성
const rederCitiesOptions = async (arr) => {
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
    const data = await fetchData("sido", { numOfRows: 17, pageNo: 1 });

    if (!data.response?.body?.items?.item) {
      throw new Error("시도 정보를 가져오는데 실패했습니다.");
    }
    rederCitiesOptions(data.response.body.items.item);
    return data.response.body.items.item;
  } catch (error) {
    console.error("시도 정보 조회 중 오류 발생:", error);
    throw error; // 오류를 상위로 전파
  }
};
$citySelect.addEventListener("change", async (e) => {
  const selectedCity = e.target.value;
  selectedOptionsState.setSelectedCity(selectedCity);
  console.log(selectedOptionsState.city);
  await fetchAndRenderDistrictsOptions(selectedOptionsState.city);
});

//--------------------------------------------------------------------
//시군구 html 생성
const rederDistrictsOptions = async (arr) => {
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
  const data = await fetchData("sigungu", { upr_cd: uprCd });
  if (!data.response?.body?.items?.item) {
    $districtSelect.innerHTML = `<option value="null" selected>시/군/구 선택</option>`;
    throw new Error("시군구 정보를 가져오는데 실패했습니다.");
  }
  console.log(data.response.body.items.item);
  rederDistrictsOptions(data.response.body.items.item);
  return data.response.body.items.item;
};
$districtSelect.addEventListener("change", async (e) => {
  const selectedDistrict = e.target.value;
  selectedOptionsState.setDistrict(selectedDistrict);
  console.log(selectedOptionsState.district);
});

//개 고양이 선택
$dogOrCatSelect.addEventListener("change", async (e) => {
  const selectedDogOrCat = e.target.value;
  selectedOptionsState.setDogOrCat(selectedDogOrCat);
  const getgetKind = await getKind(selectedDogOrCat);
  rederKindOptions(getgetKind);
});

const rederKindOptions = async (arr) => {
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
$kindSelect.addEventListener("change", async (e) => {
  const selectedKind = e.target.value;
  selectedOptionsState.setKind(selectedKind);
  console.log(selectedOptionsState.kind);
});



const renderPublics = (publics) => {
  const $sec3Grid = document.getElementById("sec3-grid");
  if (!Array.isArray(publics) || publics.length === 0) {
    $sec3Grid.innerHTML = "<p>표시할 데이터가 없습니다.</p>";
    return;
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
  $sec3Grid.innerHTML = "";
  $sec3Grid.appendChild(fragment);
};

const fetchAndRenderPublics = async () => {
  try {
    const publicsData = await getPublic({
      numOfRows: pageSize,
      pageNo: currentPage,
      upkind: "",
      kind: "",
      upr_cd: "",
      org_cd: "",
      bgnde: `${tenDaysAgo()}`,
      endde: `${todayDate()}`,
      care_reg_no: "",
      state: "",
      neuter_yn: "",
    });
    renderPublics(publicsData);
    updatePaginationUI();
  } catch (error) {
    console.error("Error fetching or rendering publics:", error);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderCityOptions();
});
