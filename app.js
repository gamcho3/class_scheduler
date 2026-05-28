import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getMessaging,
  getToken,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtnCyRQIqptHdhMUHFXR6-JPgEFKiVcD0",
  authDomain: "class-schedule-program.firebaseapp.com",
  projectId: "class-schedule-program",
  storageBucket: "class-schedule-program.firebasestorage.app",
  messagingSenderId: "984291410460",
  appId: "1:984291410460:web:028755d5e0bde8f440d5d9",
  measurementId: "G-TC7DDWBGZ7",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

const repoName = "/class_scheduler";
const VAPID_KEY =
  "BI3Z5nWpNOvg084Fi-o0SLzCeqPLc9xoKKPN4ZMwDzcWu9jVirEL9aPI6i4qD7a7vmSBz2gFef3v-Ysx_6nInpY";

// iPadOS 13+는 userAgent가 MacIntel로 나오므로 maxTouchPoints로 구분
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(navigator.userAgent);

async function requestTokenWithRegistration(registration) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("알림 권한이 거부되었습니다.");
    return;
  }
  try {
    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: VAPID_KEY,
    });
    if (currentToken) {
      alert("FCM 토큰 발급 성공: " + currentToken);
      sendTokenToGAS(currentToken);
    } else {
      alert("토큰을 획득하지 못했습니다.");
    }
  } catch (err) {
    alert("토큰 발급 중 오류 발생: " + err);
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        `${repoName}/firebase-messaging-sw.js`,
        { scope: `${repoName}/` }
      );
    } catch (error) {
      alert("서비스 워커 등록 실패: " + error);
      return;
    }

    if (isAndroid) {
      // 안드로이드: 페이지 로드 후 자동으로 권한 요청
      await requestTokenWithRegistration(registration);

    } else if (isIOS) {
      // iOS: 하단 버튼 표시 후 탭 시 권한 요청
      const pushBar = document.getElementById("iosPushBar");
      pushBar.removeAttribute("hidden");
      document.body.style.paddingBottom = "80px";

      document.getElementById("pushBtn").addEventListener("click", async () => {
        await requestTokenWithRegistration(registration);
        // 토큰 발급 성공 여부와 무관하게 권한 결정 후 바 숨김
        if (Notification.permission !== "default") {
          pushBar.setAttribute("hidden", "");
          document.body.style.paddingBottom = "";
        }
      });
    }
    // 그 외 환경(데스크톱 등)은 아무것도 하지 않음
  });
}

function sendTokenToGAS(token) {
  const gasWebAppUrl =
    "https://script.google.com/macros/s/AKfycbyOXYfJr3zp2kKOv2xTcQSN_154Bkj9XLM_ys6jZ5BVWYwoOIz6xIecclyrX3EeIWxb/exec";

  fetch(gasWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token,
      userAgent: navigator.userAgent,
    }),
  })
    .then(() => alert("GAS 백엔드로 토큰 전송 요청 완료"))
    .catch((err) => alert("GAS 토큰 전송 중 에러: " + err));
}
