<template>
  <div class="app-container studio-home">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">专业软件开发工作室</p>
        <h1>灏钧软件开发工作室管理后台</h1>
        <p class="subtitle">统一管理游戏开发、软件外包、技术咨询与持续服务，让项目交付状态清晰可见。</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goTarget('https://www.smallpig1997.top/')">访问工作室官网</el-button>
          <el-button size="large" plain @click="goTarget('https://www.smallpig1997.top/contact')">立即咨询</el-button>
        </div>
      </div>
      <div class="hero-panel">
        <div class="metric-main">24/7</div>
        <div class="metric-label">技术支持与项目维护</div>
        <div class="metric-grid">
          <span>游戏开发</span>
          <span>软件案例</span>
          <span>系统集成</span>
          <span>技术咨询</span>
        </div>
      </div>
    </section>

    <section class="stats-grid">
      <div v-for="item in stats" :key="item.label" class="stat-card">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="content-grid">
      <el-card class="service-card" shadow="never" v-for="service in services" :key="service.title">
        <div class="service-icon">{{ service.index }}</div>
        <h3>{{ service.title }}</h3>
        <p>{{ service.desc }}</p>
        <ul>
          <li v-for="point in service.points" :key="point">{{ point }}</li>
        </ul>
      </el-card>
    </section>

    <section class="bottom-grid">
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>合作优势</span>
        </template>
        <div class="advantage-list">
          <div v-for="advantage in advantages" :key="advantage.title">
            <strong>{{ advantage.title }}</strong>
            <p>{{ advantage.desc }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="info-card contact-card" shadow="never">
        <template #header>
          <span>联系方式</span>
        </template>
        <p><b>地址：</b>四川省泸州市关口阳光云华逸府</p>
        <p><b>电话：</b>+86-13404098516</p>
        <p><b>邮箱：</b>664235822@qq.com</p>
        <el-button type="primary" @click="goTarget('https://www.smallpig1997.top/contact')">获取项目咨询</el-button>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { value: '50+', label: '成功项目' },
  { value: '100+', label: '满意客户' },
  { value: '5+', label: '年行业经验' },
  { value: '24/7', label: '技术支持' }
]

const services = [
  {
    index: '01',
    title: '游戏开发',
    desc: '移动游戏、PC 游戏、网页游戏开发，从概念设计到上线运营提供完整交付。',
    points: ['游戏策划与设计', '程序开发与优化', '美术设计与制作', '测试与发布']
  },
  {
    index: '02',
    title: '软件开发',
    desc: '围绕企业业务目标建设 Web、移动端、桌面端与定制化管理系统。',
    points: ['Web 应用开发', '移动应用开发', '桌面应用开发', '系统集成服务']
  },
  {
    index: '03',
    title: '技术咨询',
    desc: '提供架构设计、技术选型、性能优化和安全策略，降低项目落地风险。',
    points: ['技术架构设计', '技术选型建议', '性能优化方案', '安全防护策略']
  }
]

const advantages = [
  { title: '专业团队', desc: '多年开发经验，熟悉游戏与企业级应用的常见交付场景。' },
  { title: '快速交付', desc: '以敏捷节奏推进需求、开发、联调、验收，保证节点可控。' },
  { title: '质量保证', desc: '通过代码审查、测试检查和上线复盘稳定控制交付质量。' },
  { title: '持续服务', desc: '项目交付后继续提供维护、优化与扩展支持。' }
]

function goTarget(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped lang="scss">
.studio-home {
  min-height: 100%;
  padding: 24px;
  color: #0f172a;
  background:
    radial-gradient(circle at 10% 0%, rgba(37, 99, 235, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
}

.hero-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 36px;
  overflow: hidden;
  padding: 48px;
  border-radius: 28px;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.86)),
    url('@/assets/images/login-background.jpg') center/cover;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
}

.hero-card::after {
  content: '';
  position: absolute;
  right: -120px;
  top: -160px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.28);
  filter: blur(8px);
}

.hero-copy,
.hero-panel {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0 0 14px;
  color: #93c5fd;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero-copy h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.subtitle {
  max-width: 720px;
  margin: 22px 0 0;
  color: #cbd5e1;
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 32px;
}

.hero-panel {
  align-self: stretch;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
}

.metric-main {
  font-size: 58px;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.metric-label {
  margin-top: 8px;
  color: #bfdbfe;
  font-size: 15px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 34px;
}

.metric-grid span {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  color: #e0f2fe;
  text-align: center;
  font-size: 13px;
}

.stats-grid,
.content-grid,
.bottom-grid {
  display: grid;
  gap: 18px;
  margin-top: 22px;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card,
:deep(.service-card),
:deep(.info-card) {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.stat-card {
  padding: 22px;
}

.stat-card strong {
  display: block;
  color: #2563eb;
  font-size: 32px;
  line-height: 1;
}

.stat-card span {
  display: block;
  margin-top: 10px;
  color: #475569;
}

.content-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.service-card h3 {
  margin: 18px 0 10px;
  color: #0f172a;
  font-size: 20px;
}

.service-card p,
.info-card p {
  color: #475569;
  line-height: 1.7;
}

.service-card ul {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 18px 0 0;
  list-style: none;
}

.service-card li {
  color: #334155;
}

.service-card li::before {
  content: '•';
  margin-right: 8px;
  color: #2563eb;
  font-weight: 800;
}

.bottom-grid {
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.55fr);
}

.advantage-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.advantage-list strong {
  color: #0f172a;
  font-size: 16px;
}

.contact-card .el-button {
  margin-top: 12px;
}

@media (max-width: 1200px) {
  .hero-card,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .content-grid,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .studio-home {
    padding: 14px;
  }

  .hero-card {
    padding: 28px;
  }

  .hero-actions,
  .advantage-list {
    flex-direction: column;
    grid-template-columns: 1fr;
  }

  .content-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>