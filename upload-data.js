const admin = require('firebase-admin');
const fs = require('fs');

let serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
// JSON 파일 읽기
let rawdata = fs.readFileSync('./data/map-route-lines.json');
let jsonData = JSON.parse(rawdata);

// 재귀적으로 데이터 업로드
const uploadData = async (data) => {
  for (const [lineId, lineData] of Object.entries(data)) {
    const lineRef = db.collection('lines').doc(lineId);
    await lineRef.set({ attr: lineData.attr }); // 노선의 속성 정보 저장

    // stations 배열을 처리하여 각 역을 subcollection으로 저장
    if (lineData.stations && Array.isArray(lineData.stations)) {
      for (let i = 0; i < lineData.stations.length; i++) {
        await lineRef.collection('stations').doc(i.toString()).set(lineData.stations[i]);
      }
    }
  }
};

// 최상위에서 시작
uploadData(jsonData["map-route-lines"]);