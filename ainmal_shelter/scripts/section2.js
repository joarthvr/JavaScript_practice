import { fetchData, todayDate, tenDaysAgo } from "./fetch.js";

const paginationState = {
  currentPage: 1,
  totalResults: 0,
  groupSize: 10,
  pageSize: 8,
  data: [],
  setCurrentPage(page) {
    this.currentPage = page;
  },
  setTotalResults(total) {
    this.totalResults = total;
  },
  setData(data) {
    this.data = data;
  },
};

const getPublic = async (params) => {
  const data = await fetchData("abandonmentPublic", params);
  // console.log(data.response.body.items.item);
  paginationState.setData(data.response.body.items.item);
  console.log(paginationState.data);
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
    gridElement.setAttribute("data-idx", idx);
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
const $sec2Grid = document.getElementById("sec2-grid");
const $modal = document.getElementById("modal");
const $modalWrap = document.getElementById("modal-wrap");

$sec2Grid.addEventListener("click", (e) => {
    const gridElementContainer = e.target.closest(".sec2-grid-element");
    if (!gridElementContainer) return; // 클릭된 요소가 .sec2-grid-element 내부가 아니면 무시

    const index = gridElementContainer.dataset.idx;
    const gridElement = paginationState.data[index];
    
    if (!gridElement) {
        console.error("No data found for this element");
        return;
    }

    $modal.classList.add("active");
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <div class="modal-top">
            <div class="modal-img-box">
                <img src="${gridElement.popfile}" alt="${gridElement.kindCd}">
                <button class="go-to-shelter">보호소 바로가기 ></button>
                </div>
            <div class="modal-info-box">
                <div class="modal-info-top">
                    <p class="animal-id">${gridElement.noticeNo}</p>
                    <h2 class="animal-name">${gridElement.kindCd}</h2>
                    <p class="protection-period">보호기간 ${gridElement.noticeSdt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || 'N/A'} ~ ${gridElement.noticeEdt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || 'N/A'}</p>
                </div>
                <div class="modal-info-detail">
                    <div><p>품종</p></div>
                    <div><p>:${gridElement.kindCd}</p></div>
                    <div><p>성별</p></div>
                    <div><p>:${gridElement.sexCd === "M" ? "수컷" : "암컷"}</p></div>
                    <div><p>나이</p></div>
                    <div><p>:${gridElement.age}</p></div>
                    <div><p>색상</p></div>
                    <div><p>:${gridElement.colorCd}</p></div>
                    <div><p>체중</p></div>
                    <div><p>:${gridElement.weight}</p></div>
                    <div><p>상태</p></div>
                    <div><p>:${gridElement.processState}</p></div>
                    <div><p>접수일시</p></div>
                    <div><p>:${gridElement.happenDt?.replace(/(\d{4})(\d{2})(\d{2})/, "$1년 $2월 $3일") || 'N/A'}</p></div>
                    <div><p>발견장소</p></div>
                    <div><p>:${gridElement.happenPlace}</p></div>
                    <div><p>보호센터</p></div>
                    <div><p>:${gridElement.careNm}</p></div>
                    <div></div>
                    <div><p>:${gridElement.orgNm}</p></div>
                    <div></div>
                    <div><p>:${gridElement.careTel}</p></div>
                    <div><p>담당자</p></div>
                    <div><p>:${gridElement.chargeNm}</p></div>
                    <div></div>
                    <div><p>:${gridElement.officeTel || "정보 없음"}</p></div>
                </div>
            </div>
        </div>
    `;
// 모달 열기 함수 (기존 코드에 추가)
function openModal() {
  $modal.classList.add("active");
}

// 모달 닫기 함수
function closeModal() {
  $modal.classList.remove("active");
  // 선택적: 모달 내용 초기화
  $modalWrap.innerHTML = '';
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
    $modalWrap.innerHTML = '';
    // $modalWrap.prepend(modalContent, $modalWrap.firstChild);
    $modalWrap.appendChild(modalContent);
});