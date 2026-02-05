/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poe: {
          dark: '#0f1419',       // 메인 배경 - 어두운 청회색
          card: '#1a1f26',       // 카드 배경
          border: '#1f2937',     // 테두리 (더 어둡게)
          yellow: '#F7D060',     // POE2 노란색
          regular: '#4ade80',    // 초록
          semi: '#fbbf24',       // 노랑
          uber: '#ef4444',       // 빨강
          // Act별 배경색 (더 은은하게)
          act1: '#121816',       // Act 1 - 숲 (은은한 녹색)
          act2: '#181612',       // Act 2 - 사막 (은은한 황토)
          act3: '#121618',       // Act 3 - 정글 (은은한 청록)
          act4: '#181212',       // Act 4 - 화산 (은은한 빨강)
          actExtra: '#141318',   // 기타 Act - 보라
        }
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
