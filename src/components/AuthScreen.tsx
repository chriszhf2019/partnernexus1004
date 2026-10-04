import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flower,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  Compass,
  Activity,
  Brain,
  Shield,
  Zap,
  Heart,
  Star,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Network,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export function AuthScreen() {
  const { login, register, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>("register");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    if (mode === "register" && password.length < 8) {
      setError("密码至少需要 8 个字符");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
    } catch (err: any) {
      setError(err.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  const features = [
    {
      icon: Flower,
      title: "内圆·自我生长",
      desc: "种子系统记录成长目标，轨迹罗盘可视化人生路径，让每一份努力都看得见生长。",
      color: "amber",
      gradient: "from-amber-400/20 to-amber-600/10",
      border: "border-amber-400/30",
      iconColor: "text-amber-400",
    },
    {
      icon: Compass,
      title: "中圆·人脉星系",
      desc: "引力导向的关系网络，用共鸣频率替代催促式社交，让重要的人自然出现在轨道上。",
      color: "blue",
      gradient: "from-blue-400/20 to-blue-600/10",
      border: "border-blue-400/30",
      iconColor: "text-blue-400",
    },
    {
      icon: Activity,
      title: "外圆·世界影响",
      desc: "善意涟漪、成就资产、智慧银行，记录你向外扩散的每一道微光与能量。",
      color: "purple",
      gradient: "from-purple-400/20 to-purple-600/10",
      border: "border-purple-400/30",
      iconColor: "text-purple-400",
    },
  ];

  const aiFeatures = [
    { icon: Brain, text: "AI 成长诊断，发现你看不见的盲区" },
    { icon: TrendingUp, text: "能量积分系统，量化每一步生长" },
    { icon: Network, text: "关系引力分析，优化人脉轨道" },
  ];

  const trustItems = [
    { icon: Shield, text: "数据本地优先存储" },
    { icon: Zap, text: "AI 分析仅在云端运行" },
    { icon: Heart, text: "无广告、无算法推送" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/3 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30 flex items-center justify-center">
            <Flower className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-display font-medium text-slate-200 text-base">念 · Momentum</span>
        </div>
        <button
          onClick={() => {
            setShowAuthForm(true);
            setMode("login");
          }}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          已有账号？登录
        </button>
      </header>

      {/* Hero 主区域 */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[11px] text-amber-300/90 font-medium tracking-wide">
                AI 驱动的数字禅人生增值系统
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-slate-100 mb-5 leading-tight"
          >
            让成长看得见，
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 bg-clip-text text-transparent">
              让生命有轨迹
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed mb-8"
          >
            用「同心圆」模型管理自我、关系与世界。
            种下成长种子，绘制人脉星系，扩散善意涟漪 ——
            每一天，都在为你的人生叠加向上的粒子。
          </motion.p>

          {/* 主 CTA 区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <button
              onClick={handleGuestLogin}
              className="group w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              <Sparkles size={15} />
              免费体验 Demo
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                setShowAuthForm(true);
                setMode("register");
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserIcon size={14} />
              创建账号，保存你的数据
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[11px] text-slate-500"
          >
            无需信用卡 · Demo 数据自动保存于本地 · 随时可注册同步
          </motion.p>
        </div>

        {/* 产品预览卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mb-16"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-purple-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[10px] text-slate-600">momentum.app / 你的成长星系</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 成长积分预览 */}
              <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/50 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                    <TrendingUp size={15} className="text-amber-400" />
                  </div>
                  <span className="text-xs text-slate-400">成长积分</span>
                </div>
                <div className="text-2xl font-display font-semibold text-amber-300 mb-1">248</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ArrowRight size={10} className="rotate-[-45deg]" />
                  本周 +32 分
                </div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                </div>
              </div>

              {/* 种子预览 */}
              <div className="bg-gradient-to-br from-blue-950/30 to-slate-900/50 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Flower size={15} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-400">生长种子</span>
                </div>
                <div className="text-2xl font-display font-semibold text-blue-300 mb-1">5 颗</div>
                <div className="text-[10px] text-slate-500">2 颗绽放 · 2 颗生长 · 1 颗萌芽</div>
                <div className="mt-3 flex gap-1">
                  {[100, 60, 100, 65, 10].map((p, i) => (
                    <div key={i} className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400/70 rounded-full"
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 人脉预览 */}
              <div className="bg-gradient-to-br from-purple-950/30 to-slate-900/50 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <Network size={15} className="text-purple-400" />
                  </div>
                  <span className="text-xs text-slate-400">人脉星系</span>
                </div>
                <div className="text-2xl font-display font-semibold text-purple-300 mb-1">5 颗星</div>
                <div className="text-[10px] text-slate-500">智囊 · 战友 · 灵感 · 后浪</div>
                <div className="mt-3 flex -space-x-2">
                  {["张", "李", "苏", "陈", "+"].map((label, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-slate-900 bg-gradient-to-br from-purple-400/40 to-purple-600/40 flex items-center justify-center text-[9px] text-purple-200 font-medium"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 三大核心能力 */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-100 mb-2">
              三层同心圆，构建完整的人生系统
            </h2>
            <p className="text-sm text-slate-500">从自我出发，向外生长，留下涟漪</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-gradient-to-br ${feature.gradient} border ${feature.border} rounded-2xl p-5 backdrop-blur-sm`}
              >
                <div className={`w-11 h-11 rounded-xl bg-slate-900/50 border ${feature.border} flex items-center justify-center mb-4`}>
                  <feature.icon size={20} className={feature.iconColor} />
                </div>
                <h3 className="text-base font-medium text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-[12px] text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI 能力说明 */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 mb-4">
                  <Brain size={12} className="text-purple-400" />
                  <span className="text-[10px] text-purple-300 font-medium">AI 成长伙伴</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-100 mb-3">
                  AI 不只是工具，是你的成长参谋
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  基于你的种子进展、人脉互动和善意记录，AI 会定期为你生成成长诊断报告，
                  发现盲区，建议下一步行动方向 —— 就像一位懂你的人生教练。
                </p>
                <ul className="space-y-2.5">
                  {aiFeatures.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-2.5 text-sm text-slate-300"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                        <Star size={11} className="text-emerald-400" />
                      </div>
                      <span className="text-[13px]">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* AI 报告模拟卡片 */}
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="bg-slate-950/80 border border-slate-700/50 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-400/10 flex items-center justify-center">
                      <Sparkles size={13} className="text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-200">AI 成长周报</span>
                    <span className="ml-auto text-[10px] text-slate-600">6月第4周</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] text-emerald-400 mb-0.5">✦ 亮点</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        本周「善意涟漪」深度达到 5 层，你的影响力正在加速扩散。
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="text-[10px] text-amber-400 mb-0.5">◎ 建议</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        「战友」轨道已有 2 颗星共振减弱，建议本周安排一次深度交流。
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="text-[10px] text-blue-400 mb-0.5">◇ 洞察</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        创造类种子进展最快，可考虑将更多能量投入此方向。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 信任构建区 */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-lg sm:text-xl font-display font-medium text-slate-100 mb-2">
              你的数据，始终属于你
            </h2>
            <p className="text-sm text-slate-500">数字禅理念：不追踪、不贩卖、不诱导</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/50 border border-slate-800"
              >
                <item.icon size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 底部 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/50 to-purple-950/30 border border-amber-400/20 rounded-2xl p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-display font-medium text-slate-100 mb-2">
              准备好开始你的生长了吗？
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              10 秒进入 Demo，体验完整的数字禅人生系统
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleGuestLogin}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35"
              >
                <Sparkles size={16} />
                立即免费体验
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setShowAuthForm(true);
                  setMode("register");
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
              >
                创建账号
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 底部信息 */}
      <footer className="relative z-10 border-t border-slate-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <span>© 2026 Momentum · 念 · 数字禅人生增值系统</span>
          <div className="flex items-center gap-4">
            <a href="/terms" className="hover:text-slate-400 transition-colors">服务条款</a>
            <a href="/privacy" className="hover:text-slate-400 transition-colors">隐私政策</a>
          </div>
        </div>
      </footer>

      {/* 登录/注册弹窗 */}
      <AnimatePresence>
        {showAuthForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setShowAuthForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAuthForm(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-purple-400/20 border border-amber-400/30 mb-3">
                  <Flower className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-display font-medium text-slate-100">
                  {mode === "login" ? "欢迎回来" : "创建你的账号"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === "login" ? "登录以继续你的生长旅程" : "保存数据，开启你的人生系统"}
                </p>
              </div>

              {/* 标签页切换 */}
              <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl mb-5">
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-slate-700 text-amber-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  注册
                </button>
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-slate-700 text-amber-300 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  登录
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">昵称（可选）</label>
                    <div className="relative">
                      <UserIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="给自己起个名字"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">邮箱</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">密码</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "至少 8 个字符" : "请输入密码"}
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-medium text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>{mode === "login" ? "登录" : "创建账号"}</>
                  )}
                </button>
              </form>

              {/* Demo 快捷入口 */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-600 uppercase tracking-wider">或</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <button
                onClick={() => {
                  setShowAuthForm(false);
                  handleGuestLogin();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={13} className="text-amber-400" />
                先体验 Demo，稍后再注册
              </button>

              {/* 服务条款 */}
              <p className="text-[10px] text-slate-600 text-center mt-4 leading-relaxed">
                {mode === "login" ? "登录" : "注册"}即代表您同意我们的
                <a href="/terms" className="text-amber-400/80 hover:text-amber-400 mx-1">服务条款</a>
                和
                <a href="/privacy" className="text-amber-400/80 hover:text-amber-400 mx-1">隐私政策</a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
