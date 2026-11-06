"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe2, ChevronDown, Check } from "lucide-react";
import { LanguageCode } from "@/types/language";
import { LANGUAGES } from "@/lib/seed-data";

interface LanguageDropdownProps {
  activeLang: LanguageCode;
  progressByLang: Record<
    LanguageCode,
    { learned: number; total: number; completedTopics: number }
  >;
  onSelectLanguage: (code: LanguageCode) => void;
}

export default function LanguageDropdown({
  activeLang,
  progressByLang,
  onSelectLanguage,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMeta = LANGUAGES[activeLang];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#181715]/40 hover:bg-[#FAF8F5] text-xs sm:text-sm font-medium text-[#181715] transition-all shadow-2xs"
        aria-expanded={isOpen}
      >
        <Globe2 className="w-4 h-4 text-[#1F5E3B]" />
        <span className="text-[#8A847C] text-xs hidden md:inline">
          Chọn ngôn ngữ:
        </span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-white"
          style={{ backgroundColor: currentMeta.accentColor }}
        >
          {currentMeta.shortLabel}
        </span>
        <span className="font-semibold text-[#181715]">
          {currentMeta.nameVi}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#8A847C] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#E5E0D8] shadow-[0_14px_40px_rgba(24,23,21,0.12)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#E5E0D8] mb-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8A847C]">
              Chọn ngôn ngữ học tập
            </div>
            <p className="text-[11px] text-[#57534E]">
              Tiến độ từng ngôn ngữ được lưu độc lập
            </p>
          </div>

          <div className="space-y-1">
            {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
              const meta = LANGUAGES[code];
              const isSelected = code === activeLang;
              const stat = progressByLang[code] || {
                learned: 0,
                total: 0,
                completedTopics: 0,
              };

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[#181715] text-white"
                      : "hover:bg-[#F2EFE9] text-[#181715]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-white shrink-0"
                      style={{
                        backgroundColor: isSelected
                          ? meta.accentColor
                          : "#57534E",
                      }}
                    >
                      {meta.shortLabel}
                    </span>
                    <div>
                      <div className="text-xs font-semibold">{meta.nameVi}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? "text-[#E5E0D8]" : "text-[#8A847C]"
                        }`}
                      >
                        {meta.nativeName} • Đã học {stat.learned}/{stat.total} từ
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#1F5E3B]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

