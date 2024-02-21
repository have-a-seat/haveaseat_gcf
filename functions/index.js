// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { logger } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const fs = require("fs");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp({});

// 재귀적으로 데이터 업로드
const uploadData = async () => {
  const rawdata = fs.readFileSync("../data/map-route-lines.json");
  const data = JSON.parse(rawdata)["map-route-lines"];
  const db = getFirestore();

  for (const [lineId, lineData] of Object.entries(data)) {
    const lineRef = db.collection("lines").doc(lineId);
    await lineRef.set({ attr: lineData.attr }); // 노선의 속성 정보 저장

    // stations 배열을 처리하여 각 역을 subcollection으로 저장
    if (lineData.stations && Array.isArray(lineData.stations)) {
      for (let i = 0; i < lineData.stations.length; i++) {
        await lineRef
          .collection("stations")
          .doc(i.toString())
          .set(lineData.stations[i]);
      }
    }
  }
};

const getAllLines = async () => {
  const db = getFirestore();
  const linesCollectionRef = db.collection("lines");
  const snapshot = await linesCollectionRef.get();
  const linesList = [];

  snapshot.forEach((doc) => {
    linesList.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return linesList;
};

const getAllStations = async () => {
  const db = getFirestore();
  const linesCollectionRef = db.collection("lines");
  const snapshot = await linesCollectionRef.get();
  const stations = [];

  for (const doc of snapshot.docs) {
    const id = doc.id;
    const stationsCollectionRef = db.collection(`lines/${id}/stations`);
    const stationsSnapshot = await stationsCollectionRef.get();

    stationsSnapshot.forEach((stationDoc) => {
      // stations에서 Uid로 조회
      const data = stationDoc.data();
      const dataUid = data["data-uid"];
      if (!dataUid) return;
      let station = stations.find((station) => station["id"] === dataUid);
      if (station) {
        // 이미 stations 배열에 존재하는 경우, lines 배열에 새로운 line 추가
        if (!station.lines.includes(id)) {
          station.lines.push(id);
        }
      } else {
        // stations 배열에 없는 경우, 새로운 객체 생성 후 추가
        station = {
          id: dataUid,
          name: data["station-nm"],
          subName: data["sub-nm"],
          lines: [id], // 처음 생성 시 현재 line으로 lines 배열 초기화
        };
        stations.push(station);
      }
    });
  }
  return stations;
};

const fetchRealtimeArrivals = async (stationName) => {
  try {
    const url = `http://swopenapi.seoul.go.kr/api/subway/6a666a6b44656b6434397049484858/json/realtimeStationArrival/1/100/${stationName}`;
    const response = await fetch(url);
    const data = await response.json();
    return data?.realtimeArrivalList;
  } catch (error) {
    console.log("Error while fetching realtion arrivals", error);
  }
};

const fetchTrainSeatOccupancyStatus = async (lineId, trainId) => {
  return {
    train: [
      {
        name: "1-1",
        seat: {
          "a-1": 1,
          "a-2": 1,
          "a-3": 0,
          "a-4": 0,
          "a-5": 1,
          "a-6": 1,
          "a-7": 0,
          "a-8": 0,
          "a-9": 1,
          "a-10": 0,
          "a-11": 0,
          "a-12": 0,
          "a-13": 0,
          "a-14": 1,
          "a-15": 0,
          "a-16": 0,
          "a-17": 0,
          "a-18": 1,
          "a-19": 0,
          "a-20": 1,
          "a-21": 0,
          "a-22": 1,
          "a-23": 1,
          "a-24": 1,
          "a-25": 0,
          "a-26": 0,
          "a-27": 0,
          "b-1": 1,
          "b-2": 1,
          "b-3": 0,
          "b-4": 1,
          "b-5": 1,
          "b-6": 0,
          "b-7": 1,
          "b-8": 1,
          "b-9": 0,
          "b-10": 0,
          "b-11": 0,
          "b-12": 1,
          "b-13": 0,
          "b-14": 0,
          "b-15": 1,
          "b-16": 0,
          "b-17": 1,
          "b-18": 0,
          "b-19": 0,
          "b-20": 1,
          "b-21": 0,
          "b-22": 1,
          "b-23": 0,
          "b-24": 0,
          "b-25": 0,
          "b-26": 0,
          "b-27": 1,
        },
      },
      {
        name: "1-2",
        seat: {
          "a-1": 0,
          "a-2": 1,
          "a-3": 0,
          "a-4": 0,
          "a-5": 0,
          "a-6": 1,
          "a-7": 1,
          "a-8": 0,
          "a-9": 1,
          "a-10": 1,
          "a-11": 0,
          "a-12": 1,
          "a-13": 1,
          "a-14": 0,
          "a-15": 0,
          "a-16": 0,
          "a-17": 0,
          "a-18": 0,
          "a-19": 1,
          "a-20": 0,
          "a-21": 0,
          "a-22": 0,
          "a-23": 0,
          "a-24": 0,
          "a-25": 1,
          "a-26": 1,
          "a-27": 0,
          "b-1": 1,
          "b-2": 1,
          "b-3": 1,
          "b-4": 1,
          "b-5": 1,
          "b-6": 1,
          "b-7": 0,
          "b-8": 1,
          "b-9": 1,
          "b-10": 1,
          "b-11": 1,
          "b-12": 0,
          "b-13": 1,
          "b-14": 0,
          "b-15": 0,
          "b-16": 1,
          "b-17": 0,
          "b-18": 1,
          "b-19": 0,
          "b-20": 0,
          "b-21": 1,
          "b-22": 1,
          "b-23": 1,
          "b-24": 1,
          "b-25": 0,
          "b-26": 0,
          "b-27": 0,
        },
      },
      {
        name: "1-3",
        seat: {
          "a-1": 1,
          "a-2": 0,
          "a-3": 0,
          "a-4": 1,
          "a-5": 0,
          "a-6": 0,
          "a-7": 0,
          "a-8": 1,
          "a-9": 0,
          "a-10": 1,
          "a-11": 1,
          "a-12": 1,
          "a-13": 0,
          "a-14": 1,
          "a-15": 1,
          "a-16": 0,
          "a-17": 1,
          "a-18": 0,
          "a-19": 1,
          "a-20": 0,
          "a-21": 0,
          "a-22": 0,
          "a-23": 0,
          "a-24": 1,
          "a-25": 0,
          "a-26": 1,
          "a-27": 1,
          "b-1": 1,
          "b-2": 0,
          "b-3": 1,
          "b-4": 0,
          "b-5": 0,
          "b-6": 0,
          "b-7": 1,
          "b-8": 1,
          "b-9": 0,
          "b-10": 0,
          "b-11": 1,
          "b-12": 0,
          "b-13": 0,
          "b-14": 1,
          "b-15": 1,
          "b-16": 0,
          "b-17": 1,
          "b-18": 1,
          "b-19": 0,
          "b-20": 0,
          "b-21": 1,
          "b-22": 0,
          "b-23": 1,
          "b-24": 0,
          "b-25": 1,
          "b-26": 1,
          "b-27": 1,
        },
      },
      {
        name: "1-4",
        seat: {
          "a-1": 1,
          "a-2": 0,
          "a-3": 0,
          "a-4": 1,
          "a-5": 0,
          "a-6": 0,
          "a-7": 0,
          "a-8": 0,
          "a-9": 1,
          "a-10": 1,
          "a-11": 0,
          "a-12": 0,
          "a-13": 0,
          "a-14": 0,
          "a-15": 0,
          "a-16": 1,
          "a-17": 1,
          "a-18": 1,
          "a-19": 0,
          "a-20": 1,
          "a-21": 1,
          "a-22": 1,
          "a-23": 0,
          "a-24": 0,
          "a-25": 1,
          "a-26": 0,
          "a-27": 0,
          "b-1": 0,
          "b-2": 0,
          "b-3": 0,
          "b-4": 0,
          "b-5": 0,
          "b-6": 1,
          "b-7": 1,
          "b-8": 0,
          "b-9": 0,
          "b-10": 1,
          "b-11": 1,
          "b-12": 0,
          "b-13": 1,
          "b-14": 0,
          "b-15": 1,
          "b-16": 1,
          "b-17": 1,
          "b-18": 1,
          "b-19": 0,
          "b-20": 1,
          "b-21": 0,
          "b-22": 0,
          "b-23": 0,
          "b-24": 0,
          "b-25": 0,
          "b-26": 1,
          "b-27": 1,
        },
      },
      {
        name: "2-1",
        seat: {
          "a-1": 0,
          "a-2": 1,
          "a-3": 1,
          "a-4": 1,
          "a-5": 1,
          "a-6": 0,
          "a-7": 0,
          "a-8": 1,
          "a-9": 0,
          "a-10": 1,
          "a-11": 1,
          "a-12": 1,
          "a-13": 1,
          "a-14": 0,
          "a-15": 1,
          "a-16": 1,
          "a-17": 1,
          "a-18": 1,
          "a-19": 0,
          "a-20": 1,
          "a-21": 0,
          "a-22": 1,
          "a-23": 0,
          "a-24": 0,
          "a-25": 1,
          "a-26": 1,
          "a-27": 0,
          "b-1": 1,
          "b-2": 1,
          "b-3": 0,
          "b-4": 0,
          "b-5": 0,
          "b-6": 0,
          "b-7": 0,
          "b-8": 1,
          "b-9": 1,
          "b-10": 0,
          "b-11": 1,
          "b-12": 0,
          "b-13": 1,
          "b-14": 0,
          "b-15": 1,
          "b-16": 0,
          "b-17": 1,
          "b-18": 0,
          "b-19": 0,
          "b-20": 1,
          "b-21": 1,
          "b-22": 1,
          "b-23": 1,
          "b-24": 0,
          "b-25": 1,
          "b-26": 0,
          "b-27": 1,
        },
      },
      {
        name: "2-2",
        seat: {
          "a-1": 0,
          "a-2": 1,
          "a-3": 1,
          "a-4": 0,
          "a-5": 0,
          "a-6": 0,
          "a-7": 1,
          "a-8": 0,
          "a-9": 1,
          "a-10": 0,
          "a-11": 0,
          "a-12": 0,
          "a-13": 0,
          "a-14": 0,
          "a-15": 1,
          "a-16": 1,
          "a-17": 0,
          "a-18": 0,
          "a-19": 1,
          "a-20": 1,
          "a-21": 1,
          "a-22": 0,
          "a-23": 1,
          "a-24": 1,
          "a-25": 0,
          "a-26": 1,
          "a-27": 1,
          "b-1": 0,
          "b-2": 1,
          "b-3": 1,
          "b-4": 0,
          "b-5": 0,
          "b-6": 1,
          "b-7": 1,
          "b-8": 0,
          "b-9": 0,
          "b-10": 0,
          "b-11": 0,
          "b-12": 1,
          "b-13": 0,
          "b-14": 1,
          "b-15": 1,
          "b-16": 0,
          "b-17": 0,
          "b-18": 0,
          "b-19": 0,
          "b-20": 1,
          "b-21": 0,
          "b-22": 0,
          "b-23": 0,
          "b-24": 1,
          "b-25": 0,
          "b-26": 1,
          "b-27": 0,
        },
      },
      {
        name: "2-3",
        seat: {
          "a-1": 0,
          "a-2": 0,
          "a-3": 1,
          "a-4": 1,
          "a-5": 0,
          "a-6": 0,
          "a-7": 1,
          "a-8": 1,
          "a-9": 1,
          "a-10": 1,
          "a-11": 0,
          "a-12": 1,
          "a-13": 0,
          "a-14": 1,
          "a-15": 1,
          "a-16": 0,
          "a-17": 0,
          "a-18": 0,
          "a-19": 0,
          "a-20": 0,
          "a-21": 0,
          "a-22": 1,
          "a-23": 1,
          "a-24": 1,
          "a-25": 0,
          "a-26": 0,
          "a-27": 1,
          "b-1": 1,
          "b-2": 0,
          "b-3": 1,
          "b-4": 1,
          "b-5": 1,
          "b-6": 0,
          "b-7": 1,
          "b-8": 1,
          "b-9": 1,
          "b-10": 0,
          "b-11": 0,
          "b-12": 0,
          "b-13": 0,
          "b-14": 1,
          "b-15": 1,
          "b-16": 1,
          "b-17": 0,
          "b-18": 1,
          "b-19": 0,
          "b-20": 0,
          "b-21": 0,
          "b-22": 0,
          "b-23": 1,
          "b-24": 1,
          "b-25": 0,
          "b-26": 1,
          "b-27": 1,
        },
      },
      {
        name: "2-4",
        seat: {
          "a-1": 1,
          "a-2": 1,
          "a-3": 0,
          "a-4": 0,
          "a-5": 1,
          "a-6": 0,
          "a-7": 1,
          "a-8": 0,
          "a-9": 1,
          "a-10": 0,
          "a-11": 1,
          "a-12": 0,
          "a-13": 0,
          "a-14": 0,
          "a-15": 1,
          "a-16": 1,
          "a-17": 1,
          "a-18": 0,
          "a-19": 0,
          "a-20": 1,
          "a-21": 1,
          "a-22": 0,
          "a-23": 0,
          "a-24": 0,
          "a-25": 1,
          "a-26": 1,
          "a-27": 0,
          "b-1": 0,
          "b-2": 1,
          "b-3": 0,
          "b-4": 0,
          "b-5": 1,
          "b-6": 0,
          "b-7": 1,
          "b-8": 1,
          "b-9": 0,
          "b-10": 0,
          "b-11": 0,
          "b-12": 1,
          "b-13": 1,
          "b-14": 1,
          "b-15": 1,
          "b-16": 0,
          "b-17": 0,
          "b-18": 1,
          "b-19": 0,
          "b-20": 1,
          "b-21": 1,
          "b-22": 1,
          "b-23": 1,
          "b-24": 0,
          "b-25": 0,
          "b-26": 0,
          "b-27": 0,
        },
      },
    ],
  };
};

const fetchTrainSeatOccupancyStatusV2 = async (lineId, trainId) => {
  const generateRandomSeats = () =>
    Array.from({ length: 27 }, () => Math.floor(Math.random() * 2));

  return {
    train: Array.from({ length: 8 }, (_, index) => ({
      name: String(index + 1), // Convert index to string and start names from 1 to 8
      seat: {
        a: generateRandomSeats(),
        b: generateRandomSeats(),
      },
      pregnancySeat: {
        a: [3, 9],
        b: [3, 9],
      },
      vulnerableSeat: {
        a: [0, 1, 2],
        b: [0, 1, 2],
      },
    })),
  };
};

// exports.uploadLinesData = onRequest(async (req, res) => {
//   try {
//     await uploadData();
//     res.status(200).send();
//   } catch (error) {
//     logger.error("Error uploading lines collection:", error);
//     res.status(500).send("Error uploading lines collection");
//   }
// });

exports.subwayLines = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  async (req, res) => {
    try {
      const lines = await getAllLines();
      res.status(200).send({
        status: "SUCCESS",
        data: lines,
      });
    } catch (error) {
      logger.error("Error fetching lines collection:", error);
      res.status(500).send({
        status: "ERROR",
        data: [],
      });
    }
  }
);

exports.subwayStations = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  async (req, res) => {
    try {
      const stations = await getAllStations();
      res.status(200).send({
        status: "SUCCESS",
        data: stations,
      });
    } catch (error) {
      logger.error("Error fetching stations collection:", error);
      res.status(500).send({
        status: "ERROR",
        data: [],
      });
    }
  }
);

exports.realtimeArrivals = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  async (req, res) => {
    try {
      const lineId = req.query?.lineId;
      const stationName = req.query?.stationName;
      if (!lineId || !stationName) {
        return res.status(400).send({
          status: "ERROR",
          data: [],
        });
      }
      const arrivals = await fetchRealtimeArrivals(stationName);
      const arrival_response = [
        ...arrivals.filter((arrival) => arrival?.subwayId === lineId),
      ].sort((a, b) => a.barvlDt - a.barvlDt);
      res.status(200).send({
        status: "SUCCESS",
        data: arrival_response,
      });
    } catch (error) {
      logger.error("Error fetching realtime arrivals:", error);
      res.status(500).send({
        status: "ERROR",
        data: [],
      });
    }
  }
);

exports.trainSeatOccupancyStatus = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  async (req, res) => {
    try {
      const lineId = req.query?.lineId;
      const trainId = req.query?.trainId;
      if (!lineId || !trainId) {
        return res.status(400).send({
          status: "ERROR",
          data: [],
        });
      }
      const trainSeatInfo = await fetchTrainSeatOccupancyStatus(
        lineId,
        trainId
      );
      res.status(200).send({
        status: "SUCCESS",
        data: trainSeatInfo,
      });
    } catch (error) {
      logger.error("Error fetching seat occupancy:", error);
      res.status(500).send({
        status: "ERROR",
        data: [],
      });
    }
  }
);

exports.trainSeatOccupancyStatusV2 = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
  },
  async (req, res) => {
    try {
      const lineId = req.query?.lineId;
      const trainId = req.query?.trainId;
      if (!lineId || !trainId) {
        return res.status(400).send({
          status: "ERROR",
          data: [],
        });
      }
      const trainSeatInfo = await fetchTrainSeatOccupancyStatusV2(
        lineId,
        trainId
      );
      res.status(200).send({
        status: "SUCCESS",
        data: trainSeatInfo,
      });
    } catch (error) {
      logger.error("Error fetching seat occupancy:", error);
      res.status(500).send({
        status: "ERROR",
        data: [],
      });
    }
  }
);
