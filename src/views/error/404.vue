<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img class="pic-404__parent" src="@/assets/404_images/404.png" alt="404">
        <img class="pic-404__child left" src="@/assets/404_images/404_cloud.png" alt="404">
        <img class="pic-404__child mid" src="@/assets/404_images/404_cloud.png" alt="404">
        <img class="pic-404__child right" src="@/assets/404_images/404_cloud.png" alt="404">
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">
          404错误!
        </div>
        <div class="bullshit__headline">
          {{ message }}
        </div>
        <div class="bullshit__info">
          对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。
        </div>
        <router-link to="/index" class="bullshit__return-home">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const message = computed(() => {
  return '找不到网页！'
})
</script>

<style lang="scss" scoped>
.wscn-http404-container {
  position: relative;
  min-height: 100%;
  padding: 72px 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(37, 99, 235, 0.14), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(14, 165, 233, 0.12), transparent 30%),
    var(--studio-bg);
}

.wscn-http404-container::before {
  content: "404";
  position: absolute;
  right: 4vw;
  bottom: -4vw;
  color: rgba(37, 99, 235, 0.05);
  font-size: clamp(120px, 22vw, 320px);
  font-weight: 900;
  line-height: 1;
}

.wscn-http404 {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 560px) minmax(280px, 420px);
  gap: 48px;
  align-items: center;
  max-width: 1080px;
  margin: 0 auto;
  padding: 44px;
  overflow: hidden;
  border: 1px solid var(--studio-border);
  border-radius: 34px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);

  .pic-404 {
    position: relative;
    width: 100%;
    overflow: hidden;

    &__parent {
      width: 100%;
      filter: drop-shadow(0 18px 28px rgba(37, 99, 235, 0.12));
    }

    &__child {
      position: absolute;

      &.left {
        width: 80px;
        top: 17px;
        left: 220px;
        opacity: 0;
        animation: cloudLeft 2s linear 1s forwards;
      }

      &.mid {
        width: 46px;
        top: 10px;
        left: 420px;
        opacity: 0;
        animation: cloudMid 2s linear 1.2s forwards;
      }

      &.right {
        width: 62px;
        top: 100px;
        left: 500px;
        opacity: 0;
        animation: cloudRight 2s linear 1s forwards;
      }
    }
  }

  .bullshit {
    position: relative;
    overflow: hidden;

    &__oops {
      margin-bottom: 18px;
      color: var(--studio-accent);
      font-size: 40px;
      font-weight: 900;
      line-height: 1.1;
      opacity: 0;
      animation: slideUp 0.5s forwards;
    }

    &__headline {
      margin-bottom: 14px;
      color: var(--studio-title);
      font-size: 24px;
      font-weight: 800;
      line-height: 1.35;
      opacity: 0;
      animation: slideUp 0.5s 0.1s forwards;
    }

    &__info {
      max-width: 360px;
      margin-bottom: 28px;
      color: var(--studio-text);
      font-size: 14px;
      line-height: 1.9;
      opacity: 0;
      animation: slideUp 0.5s 0.2s forwards;
    }

    &__return-home {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 128px;
      height: 42px;
      padding: 0 20px;
      border-radius: 999px;
      color: #ffffff;
      background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
      box-shadow: 0 14px 28px rgba(37, 99, 235, 0.22);
      opacity: 0;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      animation: slideUp 0.5s 0.3s forwards;
    }
  }
}

@keyframes cloudLeft {
  0% { top: 17px; left: 220px; opacity: 0; }
  20% { top: 33px; left: 188px; opacity: 1; }
  80% { top: 81px; left: 92px; opacity: 1; }
  100% { top: 97px; left: 60px; opacity: 0; }
}

@keyframes cloudMid {
  0% { top: 10px; left: 420px; opacity: 0; }
  20% { top: 40px; left: 360px; opacity: 1; }
  70% { top: 130px; left: 180px; opacity: 1; }
  100% { top: 160px; left: 120px; opacity: 0; }
}

@keyframes cloudRight {
  0% { top: 100px; left: 500px; opacity: 0; }
  20% { top: 120px; left: 460px; opacity: 1; }
  80% { top: 180px; left: 340px; opacity: 1; }
  100% { top: 200px; left: 300px; opacity: 0; }
}

@keyframes slideUp {
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@media (max-width: 900px) {
  .wscn-http404 {
    grid-template-columns: 1fr;
    padding: 28px;
  }
}
</style>
