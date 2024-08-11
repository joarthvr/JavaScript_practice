const $addBtn = document.getElementById("addBtn");
const $modal = document.getElementById("modal");
const $hideBtn = document.getElementById("hideBtn");
const $question = document.getElementById("question");
const $answer = document.getElementById("answer");
const $cardCase = document.querySelector(".card-case");
const $pushCardBtn = document.getElementById("pushCardBtn");
const $cardUl = document.getElementById("card-ul");
const $nextBtn = document.getElementById("next-btn");
const $prevBtn = document.getElementById("prev-btn");
const $deleteAllBtn = document.getElementById("deleteAll");
//카드 추가 버튼 누르면 모달 나오게 생성
const toggleClass = (isShow) => {
  $modal.classList.toggle("show", isShow);
  console.log("click");
};
$addBtn.addEventListener("click", () => toggleClass(true));
$hideBtn.addEventListener("click", () => toggleClass(false));
let currentCardIndex = 0;
//카드 저장 하는 변수
let cardsListToSaveLocal = JSON.parse(localStorage.getItem("cardList")) || [];
console.log(cardsListToSaveLocal);
//카드 뒤집기
$cardUl.addEventListener("click", (e) => {
  const cardCase = e.target.closest(".card-case");
  const show = e.target.closest(".show");
  if (cardCase && show) {
    cardCase.classList.toggle("flip");
  }
});
// 카드 다음으로 이동
$nextBtn.addEventListener("click", () => {
  const cards = document.querySelectorAll(".card-list");
  if (currentCardIndex < cards.length - 1) {
    console.log(currentCardIndex);
    cards[currentCardIndex].classList.remove("show");
    cards[currentCardIndex].classList.add("left");
    cards[currentCardIndex + 1].classList.add("show");
    console.log(currentCardIndex);
    currentCardIndex++;
  }
});
//카드 이전으로 이동
$prevBtn.addEventListener("click", () => {
  const cards = document.querySelectorAll(".card-list");
  if (currentCardIndex > 0) {
    console.log(currentCardIndex);
    cards[currentCardIndex].classList.remove("show");
    cards[currentCardIndex].classList.remove("left");
    cards[currentCardIndex - 1].classList.add("show");
    console.log(currentCardIndex);
    currentCardIndex--;
  }
});

//카드 생성하기
const createCard = (data, i) => {
  const card = document.createElement("li");
  card.classList.add("card-list");
  card.id = "cardList";
  if (i === 0) {
    card.classList.add("show");
  }
  card.innerHTML = `
    <div id = "cardCase" class = "card-case">
        <div class="card front">
        <p class="flip-message">클릭하면 뒤집혀요</p>
        <p>${data.question}</p>
        </div>
        <div class="card back">
        <p>${data.answer}</p>
        </div>
    </div>
  `;

  // cardsListToSaveLocal.push(card);
  $cardUl.appendChild(card);
};
//textarea에 입력한 값 가져오기
const addCard = () => {
  const question = $question.value.trim();
  const answer = $answer.value.trim();
  if (question && answer) {
    const newCard = { question, answer };
    cardsListToSaveLocal.push(newCard);
    localStorage.setItem("cardList", JSON.stringify(cardsListToSaveLocal));
    $question.value = "";
    $answer.value = "";
    currentCardIndex = cardsListToSaveLocal.length - 1;
    createCard(newCard, currentCardIndex);
    console.log(currentCardIndex);
  } else {
    alert("내용을 입력해주세요");
  }
};
//카드 불러오기
$pushCardBtn.addEventListener("click", () => {
  addCard();
  toggleClass(false);
});
//모든 로컬스토리지 기록 삭제하기
$deleteAllBtn.addEventListener("click", () => {
  localStorage.removeItem("cardList");
  cardsListToSaveLocal = [];
  // DOM에서 카드 요소들 제거
  const $cardUl = document.getElementById("card-ul");
  $cardUl.innerHTML = "";
  // 카드가 없다는 메시지 표시 (선택사항)
  const noCardsMessage = document.createElement("li");
  noCardsMessage.textContent = "새로운 카드를 입력해 주세요";
  $cardUl.appendChild(noCardsMessage);

  // 현재 카드 인덱스 초기화
  currentCardIndex = 0;
});

function loadCards() {
  const storedCards = localStorage.getItem("cardList");
  if (storedCards) {
    cardsListToSaveLocal = JSON.parse(storedCards);
    cardsListToSaveLocal.forEach((data, i) => createCard(data, i));
  } else {
    $cardUl.textContent = "새로운 카드를 입력해 주세요";
  }
}
loadCards();
