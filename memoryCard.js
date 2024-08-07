//모달 팝업 열기
const $modalOpenBtn = document.querySelector(".modalOpenBtn");
const $modal = document.querySelector(".modal");
const $modalCloseBtn = document.querySelector(".modalCloseBtn");
const $question = document.getElementById("question");
const $answer = document.getElementById("answer");

$modalOpenBtn.addEventListener("click", () => {
  $modal.style.display = "block";
});
//모달 팝업 닫기
$modalCloseBtn.addEventListener("click", () => {
  $modal.style.display = "none";
});
// 로컬스토리지에 저장하는 함수
const saveToLoacalStorage = () => {
  localStorage.setItem("cardData", JSON.stringify(shopList));
};
const addCard = () => {
  const text = $itemInput.value;
  // 인풋값을 불러오는 함수 만약에 비어 있다면 포거스를 준다.
  if (text === "") {
    $itemInput.focus();
    return;
  }
};
const creatCard = (item) => {
  const $li = document.createElement("li");
  $li.setAttribute("class", "slider");
  $li.setAttribute("data-num", item.id);
  $li.innerHTML = `
        <div class = "slider">
        <span class="">클릭하면 뒤집어요</span>
        <p class ="">${item.question}</p>
        </div>
    `;
  return $li;
};
//입력 받은 값 로컬스토리지 저장하기
const $form = document.getElementById("cardForm");
let id = 0;
$form.addEventListener("submit", function (event) {
  // event.preventDefault();
  const cardData = {
    id: id++,
    question: $question.value,
    answer: $answer.value,
  };
  try {
    // 로컬 스토리지에 객체를 문자열로 변환하여 저장
    localStorage.setItem("cardData", JSON.stringify(cardData));
    alert("답변이 저장되었습니다.");
    $modal.style.display = "none";
    creatCard(cardData);
  } catch (error) {
    alert("답변이 저장되지 않았습니다.");
  }
});

//슬라이더
// 이전 버튼과 다음 버튼을 선택합니다.
// 로컬스토리지에서 shopList를 불러온다. 없으면 빈배열을 넣는다
let cardList = JSON.parse(localStorage.getItem("cardData")) || [];
const $slider = document.querySelector(".slider");
const $sliderUl = document.querySelector(".sliderUl");
const $front = document.querySelector(".front");
const $back = document.querySelector(".back");
