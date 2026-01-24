// 색상 상수 정의
export const COLORS = {
  // 딥 네이비 색상
  navy: {
    primary: '#001f3f',      // 메인 딥 네이비
    hover: '#002a4f',        // 호버 시 사용하는 약간 밝은 딥 네이비
    light: '#e6f0f8',       // 연한 배경색
    text: '#001f3f',         // 텍스트 색상
    overlay: 'rgba(0, 31, 63, 0.3)',  // 반투명 오버레이
  },
} as const;

// 편의를 위한 별칭
export const colors = COLORS;
