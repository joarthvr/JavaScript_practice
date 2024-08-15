import { fetchData, todayDate, tenDaysAgo } from "./fetch.js";
// 페이지네이션 상태를 관리하는 객체
const paginationState = {
  currentPage: 1, // 현재 페이지 번호
  totalPages: 1, // 전체 페이지 수
  // 현재 페이지를 설정하는 메소드
  setCurrentPage(page) {
    this.currentPage = page;
  },

  // 전체 페이지 수를 설정하는 메소드
  setTotalPages(total) {
    this.totalPages = total;
  },
};
// 보호소 기간이 얼마 안남은 유기 동물 정보 가져오기
const getPublic = async (params) => {
  const { ...otherParams } = params;
  // console.log("otherParams:", otherParams);
  const data = await fetchData("abandonmentPublic", {
    ...otherParams,
  });
  // console.log("data:", data.response.body.items.item);
  if (!data.response?.body?.items?.item) {
    alert("해당 조건의 유기동물이 없습니다.");
  }
  // 전체 페이지 수 설정
  paginationState.setTotalPages(data.response.body.totalCount);
  return data.response.body.items.item;
};
// DOM 조작 및 렌더링
const renderPublics = (publics) => {
  if (!Array.isArray(publics)) {
    console.error("correct array 보내");
    return;
  }
  const $sec2Grid = document.getElementById("sec2-grid");
  const fragment = document.createDocumentFragment();
  publics.forEach((element, idx) => {
    if (!element) {
      alert("한 달 이내 보호소 체류 기간이 만료되는 유기 동물이 없습니다.");
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
          <div class="sec2-grid-img-box">
          <img class = "sec2-grid-img"src="${
            element.popfile || "./img/nono.png"
          }" alt="${element.kindCd || "동물 사진"}" />
            </div>
            <ul class="sec2-grid-info-ul">
            <li class="sec2-grid-name-date">
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
  $sec2Grid.innerHTML = ""; // 기존 내용을 비우고
  $sec2Grid.appendChild(fragment); // 새 내용을 추가
};

// 유기동물 정보 가져오기 및 렌더링
const fetchAndRenderPublics = async () => {
  try {
    const publicsData = await getPublic({
      numOfRows: 8,
      pageNo: paginationState.currentPage || 1,
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
  } catch (error) {
    console.error("Error fetching or rendering publics:", error);
  }
};
// DOM이 로드된 후 실행
//페이지네이션

const $pagination = document.getElementById("pagination");
const $pgNext = document.getElementById("pg-next");
const $pgPrev = document.getElementById("pg-prev");

// 다음 페이지 버튼 클릭 이벤트 리스너
$pgNext.addEventListener("click", () => {
  // 현재 페이지가 전체 페이지 수보다 작은 경우에만 다음 페이지로 이동
  if (paginationState.currentPage < paginationState.totalPages/8) {
    // 현재 페이지 번호를 1 증가
    paginationState.setCurrentPage(paginationState.currentPage + 1);
    // 새로운 데이터를 가져오고 렌더링
    fetchAndRenderPublics();
  }
});

// 이전 페이지 버튼 클릭 이벤트 리스너
$pgPrev.addEventListener("click", () => {
  // 현재 페이지가 1보다 큰 경우에만 이전 페이지로 이동
  if (paginationState.currentPage > 1) {
    // 현재 페이지 번호를 1 감소
    paginationState.setCurrentPage(paginationState.currentPage - 1);
    // 새로운 데이터를 가져오고 렌더링
    fetchAndRenderPublics();
  }
});

// DOM이 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderPublics();
});

// // 페이지네이션 UI 생성 함수
// const pagination = () => {
//   let pageGroup = Math.ceil(page / groupSize);
//   let lastPage = Math.min(
//     Math.ceil(totalResults / pageSize),
//     pageGroup * groupSize
//   );
//   let firstPage = (pageGroup - 1) * groupSize + 1;
//   //   let totalPage = totalResults;
//   let totalPage = Math.ceil(totalResults / pageSize);
//   let prevGroup = (pageGroup - 2) * groupSize + 1;
//   let nextGroup = pageGroup * groupSize + 1;

//   // 페이지네이션 HTML 생성
//   let paginationHtml = `<button class="next" ${
//     pageGroup == 1 ? "disabled" : ""
//   } onClick='movePage(${prevGroup})'>이전페이지그룹</button>`;

//   paginationHtml += `<button class="next" ${
//     pageGroup == 1 ? "disabled" : ""
//   } onClick='movePage(${page - 1})'>이전</button>`;

//   for (let i = firstPage; i <= lastPage; i++) {
//     paginationHtml += `<button class='${
//       i == page ? "on" : ""
//     }' onClick='movePage(${i})'>${i}</button>`;
//   }

//   // 수정- 조건 변경
//   paginationHtml += `<button class="next" ${
//     page >= totalPage ? "disabled" : ""
//   } onClick='movePage(${page + 1})'>다음</button>`;

//   paginationHtml += `<button class="next" ${
//     pageGroup * groupSize >= totalPage ? "disabled" : ""
//   } onClick='movePage(${nextGroup})'>다음페이지그룹</button>`;

//   // 페이지네이션 UI 업데이트
//   document.querySelector(".pgCon").innerHTML = paginationHtml;
// };
