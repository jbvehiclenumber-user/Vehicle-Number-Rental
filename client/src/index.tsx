// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker 등록
serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log("앱이 오프라인에서 사용 가능합니다!");
  },
  onUpdate: (registration) => {
    console.log("새 버전이 있습니다. 새로고침하세요.");
    // 사용자에게 업데이트 알림을 표시할 수 있습니다
    if (window.confirm("새 버전이 있습니다. 지금 업데이트하시겠습니까?")) {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});
