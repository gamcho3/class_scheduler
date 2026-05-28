// 1. 백그라운드 환경(서비스 워커) 전용 Firebase 라이브러리 로드
// 서비스 워커 내부에서 12.13.0 버전을 안전하게 쓸 때
importScripts(
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js",
);

// 2. Firebase 초기화 (Firebase 콘솔 -> 프로젝트 설정에서 확인한 객체와 동일하게 입력)
firebase.initializeApp({
  apiKey: "AIzaSyDtnCyRQIqptHdhMUHFXR6-JPgEFKiVcD0",
  authDomain: "class-schedule-program.firebaseapp.com",
  projectId: "class-schedule-program",
  storageBucket: "class-schedule-program.firebasestorage.app",
  messagingSenderId: "984291410460",
  appId: "1:984291410460:web:028755d5e0bde8f440d5d9",
});

// 3. FCM 메시징 객체 선언
const messaging = firebase.messaging();

// 4. 앱이 백그라운드(탭이 닫혔거나 다른 앱을 볼 때) 상태일 때 푸시 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] 백그라운드 메시지 수신 성공:",
    payload,
  );

  // GAS 백엔드에서 보낸 알림 데이터 파싱
  const notificationTitle =
    payload.notification?.title || "새로운 알림이 있습니다.";

  // GitHub Pages의 레포지토리명을 포함한 기본 아이콘 및 이동 경로 설정
  const repoName = "/class_scheduler";

  const notificationOptions = {
    body: payload.notification?.body || "내용을 확인하려면 클릭하세요.",
    icon:  payload.data?.icon  || `${repoName}/icon/android-chrome-192x192.png`,
    badge: payload.data?.badge || `${repoName}/icon/android-chrome-192x192.png`,
    data: {
      click_action: payload.data?.click_action || `${repoName}/`,
    },
  };

  // 브라우저 내부 엔진에게 시스템 알림 창을 띄우도록 명령
  // self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. 사용자가 푸시 알림 창을 클릭했을 때 이벤트 처리
self.addEventListener("notificationclick", function (event) {
  // 클릭된 알림 창을 화면에서 닫음
  event.notification.close();

  // 알림 옵션 데이터에 심어둔 이동 URL 획득
  const targetUrl = event.notification.data.click_action;

  // 알림 클릭 시 해당 사이트 탭을 열거나, 이미 열려있다면 포커싱을 맞춤
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        // 이미 같은 도메인의 창이 열려있다면 그 창으로 포커스 이동
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // 열려있는 창이 없다면 새 창(또는 탭)으로 GitHub Pages 열기
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
