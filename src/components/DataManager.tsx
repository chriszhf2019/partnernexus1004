import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileJson,
  RotateCcw,
} from "lucide-react";
import { downloadExport, readImportFile, importData, MomentumData } from "../utils";
import { ZenCard, ZenButton } from "./ui";

interface DataManagerProps {
  onClose: () => void;
  onDataImported: () => void;
}

export function DataManager({ onClose, onDataImported }: DataManagerProps) {
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [importMessage, setImportMessage] = useState("");
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<MomentumData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      downloadExport();
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("loading");
    setImportMessage("正在解析文件...");

    try {
      const data = await readImportFile(file);
      setPendingImport(data);
      setShowImportConfirm(true);
      setImportStatus("idle");
      setImportMessage("");
    } catch (err) {
      setImportStatus("error");
      setImportMessage(
        err instanceof Error ? err.message : "导入失败，请重试"
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;

    try {
      const success = importData(pendingImport);
      if (success) {
        setImportStatus("success");
        setImportMessage("数据导入成功！页面即将刷新...");
        setTimeout(() => {
          onDataImported();
        }, 1500);
      } else {
        setImportStatus("error");
        setImportMessage("数据写入失败，请检查浏览器存储权限");
      }
    } catch (e) {
      setImportStatus("error");
      setImportMessage("导入过程中发生错误");
    }
    setShowImportConfirm(false);
    setPendingImport(null);
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingImport(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-manager-title"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/50" />

        <div className="mb-5">
          <h3 id="data-manager-title" className="font-sans font-semibold text-slate-200 text-sm">
            星系数据管理
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            备份你的成长种子、人脉星系和所有记忆涟漪
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ZenCard className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
                <Download size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-slate-200">
                  导出数据
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  将所有数据导出为 JSON 文件备份
                </p>
              </div>
              <ZenButton size="sm" onClick={handleExport}>
                导出
              </ZenButton>
            </div>
          </ZenCard>

          <ZenCard className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-400/10 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300">
                <Upload size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-slate-200">
                  导入数据
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  从备份文件恢复所有数据
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <ZenButton
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </ZenButton>
            </div>
          </ZenCard>
        </div>

        <AnimatePresence>
          {importStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
              role="status"
              aria-live="polite"
            >
              <div
                className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                  importStatus === "success"
                    ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-300"
                    : importStatus === "error"
                    ? "bg-red-400/10 border border-red-400/20 text-red-300"
                    : "bg-slate-800/50 border border-slate-700 text-slate-400"
                }`}
              >
                {importStatus === "loading" && (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                )}
                {importStatus === "success" && (
                  <CheckCircle size={14} className="shrink-0 mt-0.5" />
                )}
                {importStatus === "error" && (
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                )}
                <span>{importMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-slate-600 mt-4 text-center leading-relaxed">
          提示：导入操作将覆盖当前所有数据，建议先导出备份
        </p>

        <AnimatePresence>
          {showImportConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-900 border border-orange-500/30 rounded-xl p-5 text-center max-w-sm"
              >
                <div className="w-12 h-12 rounded-full bg-orange-400/10 border border-orange-400/30 flex items-center justify-center mx-auto mb-3 text-orange-300">
                  <RotateCcw size={20} />
                </div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">
                  确认导入数据？
                </h4>
                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  此操作将覆盖当前所有的生长种子、人脉节点和涟漪记录。
                  <br />
                  建议先导出当前数据作为备份。
                </p>
                <div className="flex gap-3">
                  <ZenButton
                    variant="secondary"
                    size="sm"
                    onClick={cancelImport}
                    className="flex-1"
                  >
                    取消
                  </ZenButton>
                  <ZenButton
                    size="sm"
                    onClick={confirmImport}
                    className="flex-1"
                  >
                    确认导入
                  </ZenButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
