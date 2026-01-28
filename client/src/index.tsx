// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

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
    console.log("새 버전이 있습니다. 업데이트를 적용합니다...");

    // 새 SW를 즉시 활성화
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });

    // 활성 SW가 교체되면 한 번만 새로고침
    let reloaded = false;
    navigator.serviceWorker?.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  },
});

// 성능 측정
reportWebVitals();
