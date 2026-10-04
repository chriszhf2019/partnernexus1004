import React from "react";
import { motion } from "motion/react";
import { Flower, ArrowLeft, Mail } from "lucide-react";

interface LegalPageProps {
  type: "privacy" | "terms";
  onClose: () => void;
}

export function LegalPage({ type, onClose }: LegalPageProps) {
  const isPrivacy = type === "privacy";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        {/* 顶部导航 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">返回</span>
        </motion.button>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30 mb-4">
            <Flower className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-slate-100 mb-2">
            {isPrivacy ? "隐私政策" : "服务条款"}
          </h1>
          <p className="text-sm text-slate-500">最后更新：2026年6月25日</p>
        </motion.div>

        {/* 内容 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert prose-slate max-w-none"
        >
          {isPrivacy ? <PrivacyContent /> : <TermsContent />}
        </motion.div>

        {/* 联系 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
        >
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-slate-200 mb-1">有疑问？</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                如果您对{isPrivacy ? "隐私政策" : "服务条款"}有任何问题，欢迎联系我们：
                <a
                  href="mailto:privacy@velolabs.top"
                  className="text-amber-400/80 hover:text-amber-400 ml-1"
                >
                  privacy@velolabs.top
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
      <Section title="引言">
        <p>
          念 Momentum 是一款"数字禅"人生管理应用。本隐私政策说明了我们如何收集、使用和保护您的个人信息。
          请仔细阅读本政策，使用我们的服务即表示您同意本政策的条款。
        </p>
      </Section>

      <Section title="1. 我们收集的信息">
        <SubSection title="1.1 账户信息">
          当您注册账户时，我们会收集您的邮箱地址、昵称（可选）和密码（加密存储）。
        </SubSection>
        <SubSection title="1.2 使用数据">
          为了提供核心功能，我们存储您主动输入的内容，包括：
        </SubSection>
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>成长种子、目标、进度</li>
          <li>人脉联系人信息和互动记录</li>
          <li>成就、善意记录、知识库</li>
          <li>打卡记录、连续天数</li>
          <li>应用偏好（主题、设置等）</li>
        </ul>
        <SubSection title="1.3 技术信息">
          为保障服务稳定，我们会收集设备信息、浏览器类型、IP 地址等基础技术信息。
        </SubSection>
      </Section>

      <Section title="2. 信息的用途">
        <p>我们使用收集的信息用于：</p>
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>提供、维护和改进服务</li>
          <li>同步您的数据到您的账户</li>
          <li>生成个性化的成长分析</li>
          <li>AI 教练功能（基于您的数据生成洞察）</li>
          <li>安全防护、欺诈检测</li>
        </ul>
      </Section>

      <Section title="3. 数据存储与安全">
        <p>
          您的数据存储在加密的数据库中，密码使用 bcrypt 算法单向加密。
          我们采用业界标准的安全措施保护您的数据，包括 HTTPS 传输、JWT 身份认证、严格的访问控制。
        </p>
        <p>
          <strong className="text-slate-200">我们不会出售您的个人信息给任何第三方。</strong>
        </p>
      </Section>

      <Section title="4. AI 功能与第三方服务">
        <p>
          本应用使用 Google Gemini API 提供 AI 教练功能。当您使用 AI 教练时，
          我们会向 Google 发送您主动提供的内容（如周记、种子列表）以生成分析报告。
          您的数据不会用于训练 Google 的 AI 模型。
        </p>
      </Section>

      <Section title="5. 您的权利">
        <p>您对自己的数据拥有以下权利：</p>
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>随时查看、修改您的数据</li>
          <li>导出您的所有数据</li>
          <li>删除您的账户和所有数据</li>
          <li>取消订阅邮件通知</li>
        </ul>
      </Section>

      <Section title="6. Cookie 与本地存储">
        <p>
          我们使用必要的 Cookie 维持您的登录状态。您的所有数据也会保存在浏览器本地存储（localStorage）中，
          以便离线访问。清除浏览器数据会清除本地副本，但不会影响服务器上的数据。
        </p>
      </Section>

      <Section title="7. 儿童隐私">
        <p>
          本应用面向 14 岁以上用户。如果您是家长，发现您的孩子未经同意提供了个人信息，
          请联系我们，我们会立即删除相关数据。
        </p>
      </Section>

      <Section title="8. 政策更新">
        <p>
          我们可能会不时更新本隐私政策。重大变更会通过应用内通知告知您。继续使用服务即代表您接受更新后的政策。
        </p>
      </Section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
      <Section title="引言">
        <p>
          欢迎使用念 Momentum。请仔细阅读以下服务条款，使用我们的服务即表示您同意这些条款。
        </p>
      </Section>

      <Section title="1. 服务说明">
        <p>
          Momentum 是一款个人成长管理应用，提供种子目标系统、人脉管理、知识库、年度报告、AI 教练等功能。
          我们提供免费版和付费版（如有），具体功能以应用内实际展示为准。
        </p>
      </Section>

      <Section title="2. 账户责任">
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>您需要提供真实、准确的注册信息</li>
          <li>您应妥善保管账户密码，对账户下的所有活动负责</li>
          <li>如发现账户被盗用，请立即通知我们</li>
          <li>一个账户仅限个人使用，不得转让或共享</li>
        </ul>
      </Section>

      <Section title="3. 用户行为规范">
        <p>您承诺不会：</p>
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>发布违法、违规、欺诈性内容</li>
          <li>侵犯他人知识产权、隐私权、名誉权</li>
          <li>上传病毒、恶意代码或进行网络攻击</li>
          <li>尝试逆向工程、反编译本应用</li>
          <li>使用自动化工具大规模抓取数据</li>
          <li>从事其他违反法律法规的活动</li>
        </ul>
      </Section>

      <Section title="4. 知识产权">
        <p>
          本应用的所有内容（包括但不限于代码、设计、文案、Logo）归 Momentum / VeloLabs 所有，受著作权法保护。
          您在本应用中创建的私人数据归您所有。
        </p>
      </Section>

      <Section title="5. 服务的变更与终止">
        <p>
          我们保留随时修改、暂停或终止服务的权利。重大变更会提前通知。
          您也可以随时通过账户设置删除账户。
        </p>
      </Section>

      <Section title="6. 免责声明">
        <p>
          本应用按"现状"提供，不对以下情况承担责任：
        </p>
        <ul className="list-disc pl-6 space-y-1 text-slate-400">
          <li>因不可抗力导致的服务中断</li>
          <li>用户因误用应用导致的损失</li>
          <li>第三方服务（如 AI API）的中断或质量问题</li>
          <li>用户之间的人际纠纷</li>
        </ul>
      </Section>

      <Section title="7. 责任限制">
        <p>
          在法律允许的最大范围内，Momentum 对您因使用本服务而产生的任何间接、偶然、特殊或后果性损失不承担责任。
        </p>
      </Section>

      <Section title="8. 适用法律">
        <p>
          本条款的解释、效力及争议解决均适用中华人民共和国法律。
          任何争议应通过友好协商解决；协商不成的，提交至有管辖权的人民法院诉讼解决。
        </p>
      </Section>

      <Section title="9. 联系我们">
        <p>
          如有任何问题或建议，请通过 <a href="mailto:support@velolabs.top" className="text-amber-400/80 hover:text-amber-400">support@velolabs.top</a> 联系我们。
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-slate-100 mb-3 pb-2 border-b border-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-medium text-slate-200 mb-2">{title}</h3>
      {children}
    </div>
  );
}
