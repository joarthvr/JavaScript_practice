
async function getData() {
  url.search = new URLSearchParams({
    serviceKey: serviceKey,
    numOfRows: "3",
    pageNo: "1",
    _type: "json",
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    console.log("Body:", data);
    console.log(data.response.body.items.item[0]);
    // 여기서 데이터를 처리합니다
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// 함수 호출
getData();
