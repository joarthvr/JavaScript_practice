const $addBtn = document.getElementById("addBtn");
const $modal = document.getElementById("modal");
const $hideBtn = document.getElementById("hideBtn");

//카드 추가 버튼 누르면 모달 나오게 생성
const toggleClass = (isShow) => {
  $modal.classList.toggle("show", isShow);
};
$addBtn.addEventListener("click", () => toggleClass(true));
$hideBtn.addEventListener("click", () => toggleClass(false));
