import { fetchData, todayDate, tenDaysAgo } from "./fetch.js";

const paginationState = {
  currentPage: 1,
  totalResults: 0,
  groupSize: 10,
  pageSize: 8,
  setCurrentPage(page) {
    this.currentPage = page;
  },
  setTotalResults(total) {
    this.totalResults = total;
  },
};

const getPublic = async (params) => {
  const data = await fetchData("abandonmentPublic", params);
  if (!data.response?.body?.items?.item) {
    document.getElementById("sec2-grid").innerHTML =
      "<p>표시할 데이터가 없습니다.</p>";
    return [];
  }
  paginationState.setTotalResults(parseInt(data.response.body.totalCount));
  return Array.isArray(data.response.body.items.item)
    ? data.response.body.items.item
    : [data.response.body.items.item];
};

const renderPublics = (publics) => {
  const $sec2Grid = document.getElementById("sec2-grid");
  if (!Array.isArray(publics) || publics.length === 0) {
    $sec2Grid.innerHTML = "<p>표시할 데이터가 없습니다.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();
  publics.forEach((element, idx) => {
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
        <img class="sec2-grid-img" src="${
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
  $sec2Grid.innerHTML = "";
  $sec2Grid.appendChild(fragment);
};

const fetchAndRenderPublics = async () => {
  const { currentPage, pageSize } = paginationState;
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

const updatePaginationUI = () => {
  const { currentPage, totalResults, groupSize, pageSize } = paginationState;
  let pageGroup = Math.ceil(currentPage / groupSize);
  let lastPage = Math.min(
    Math.ceil(totalResults / pageSize),
    pageGroup * groupSize
  );
  let firstPage = (pageGroup - 1) * groupSize + 1;
  let totalPage = Math.ceil(totalResults / pageSize);
  let prevGroup = Math.max(1, (pageGroup - 2) * groupSize + 1);
  let nextGroup = Math.min(totalPage, pageGroup * groupSize + 1);

  let paginationHtml = `
    <button class="prev-group" ${
      pageGroup === 1 ? "disabled" : ""
    } data-page="${prevGroup}">이전 그룹</button>
    <button class="prev" ${currentPage === 1 ? "disabled" : ""} data-page="${
    currentPage - 1
  }">이전</button>
  `;

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHtml += `<button class="${
      i === currentPage ? "active" : ""
    }" data-page="${i}">${i}</button>`;
  }

  paginationHtml += `
    <button class="next" ${
      currentPage >= totalPage ? "disabled" : ""
    } data-page="${currentPage + 1}">다음</button>
    <button class="next-group" ${
      pageGroup * groupSize >= totalPage ? "disabled" : ""
    } data-page="${nextGroup}">다음 그룹</button>
  `;

  document.getElementById("pagination").innerHTML = paginationHtml;
};

const handlePaginationClick = (e) => {
  if (e.target.tagName === "BUTTON" && !e.target.disabled) {
    const pageNum = parseInt(e.target.dataset.page);
    if (!isNaN(pageNum) && pageNum !== paginationState.currentPage) {
      paginationState.setCurrentPage(pageNum);
      fetchAndRenderPublics();
    }
  }
};

// 초기 실행 및 이벤트 리스너 설정
document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderPublics();
  document
    .getElementById("pagination")
    .addEventListener("click", handlePaginationClick);
});
