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

async function requestAndGetToken(registration) {
  try {
    // 브라우저에 알림 권한 팝업 요청
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("알림 권한 허용됨. FCM 토큰 요청 중...");

      // Firebase SDK의 실제 빌트인 함수인 'getToken'을 호출하여 토큰을 받아옵니다.
      const currentToken = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: "YOUR_PUBLIC_VAPID_KEY_HERE",
      });

      if (currentToken) {
        console.log("FCM 토큰 발급 성공:", currentToken);
        sendTokenToGAS(currentToken); // GAS 백엔드로 전송
      } else {
        console.log("토큰을 획득하지 못했습니다.");
      }
    } else {
      console.warn("사용자가 알림 권한을 거부했습니다.");
    }
  } catch (err) {
    console.error("토큰 발급 중 오류 발생:", err);
  }
}

function sendTokenToGAS(token) {
  const gasWebAppUrl = "https://script.google.com/macros/s/XXXXX/exec";

  fetch(gasWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token,
      userAgent: navigator.userAgent,
    }),
  })
    .then(() => console.log("GAS 백엔드로 토큰 전송 요청 완료"))
    .catch((err) => console.error("GAS 토큰 전송 중 에러:", err));
}
