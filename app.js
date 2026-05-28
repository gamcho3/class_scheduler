// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtnCyRQIqptHdhMUHFXR6-JPgEFKiVcD0",
  authDomain: "class-schedule-program.firebaseapp.com",
  projectId: "class-schedule-program",
  storageBucket: "class-schedule-program.firebasestorage.app",
  messagingSenderId: "984291410460",
  appId: "1:984291410460:web:028755d5e0bde8f440d5d9",
  measurementId: "G-TC7DDWBGZ7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = firebase.messaging();

// GitHub Pages의 레포지토리명 정의 (지정하지 않으면 404 라우팅 에러 가능성 높음)
const repoName = "/class_scheduler";

// 3. 페이지 로드 시 서비스 워커 등록 및 토큰 요청 시작
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // GitHub Pages의 서브 디렉토리 구조에 맞춰 서비스 워커 파일 위치 지정
      const registration = await navigator.serviceWorker.register(
        `${repoName}/firebase-messaging-sw.js`,
        {
          scope: `${repoName}/`,
        },
      );
      console.log("서비스 워커 등록 성공! 범위:", registration.scope);

      // 서비스 워커 등록이 완료되면 알림 권한 및 토큰 요청 함수 호출
      await requestAndGetToken(registration);
    } catch (error) {
      console.error("서비스 워커 등록 실패:", error);
    }
  });
}

function requestPermission() {
  document.getElementById("status").innerText = "권한 요청 중...";

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      // 2. FCM 토큰 획득 (VAPID 키 쌍 필요 - Firebase 콘솔 웹 푸시 설정 탭에서 발급 가능)
      messaging
        .getToken({
          vapidKey:
            "BI3Z5nWpNOvg084Fi-o0SLzCeqPLc9xoKKPN4ZMwDzcWu9jVirEL9aPI6i4qD7a7vmSBz2gFef3v-Ysx_6nInpY",
        })
        .then((currentToken) => {
          if (currentToken) {
            // 3. 획득한 토큰을 구글 앱스 스크립트 백엔드 함수로 전송
            google.script.run
              .withSuccessHandler(function (res) {
                document.getElementById("status").innerText = res;
              })
              .saveTokenToSheet(currentToken);
          } else {
            document.getElementById("status").innerText =
              "토큰을 가져오지 못했습니다. 권한을 확인하세요.";
          }
        })
        .catch((err) => {
          document.getElementById("status").innerText = "오류 발생: " + err;
        });
    } else {
      document.getElementById("status").innerText =
        "알림 권한이 거부되었습니다.";
    }
  });
}
