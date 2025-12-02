/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 这里是完全照搬 index.html 里的定义，一个标点符号都没改
      colors: {
        beige: {
          DEFAULT: '#FBF9F6',
          soft: '#F5F1ED',
        },
        brand: {
          orange: '#D95D39',
          text: {
            DEFAULT: '#4A4A4A',
            light: '#6B6B6B'
          },
          border: '#EAE5E1',
        }
      },
      // 顺便把字体也搬过来，对应 index.html 里的 font-family
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // 别忘了 index.html 里还引用了 typography 插件
  ],
}