"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import { LanguageCode, VocabCard } from "@/types/language";
import { lookupWordGloss } from "@/lib/word-gloss-dictionary";
import { speakText } from "@/lib/speech";

interface HoverWordTooltipProps {
  token: string;
  languageCode: LanguageCode;
  allCards?: VocabCard[];
  disabled?: boolean;
  children: React.ReactNode;
}

export function HoverWordTooltip({
  token,
  languageCode,
  allCards = [],
  disabled = false,
  children,
}: HoverWordTooltipProps) {
  const [hovered, setHovered] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  const gloss = lookupWordGloss(token, languageCode, allCards);
  if (!gloss) {
    return <>{children}</>;
  }

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {hovered && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 w-max max-w-[230px] rounded-2xl bg-[#181715] text-white px-3.5 py-2.5 shadow-xl border border-white/15 text-left animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="flex items-center justify-between gap-2.5">
            <span className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white">{gloss.word}</span>
              <span className="text-[11px] font-mono text-[#FCA5A5]">
                {gloss.phonetic}
              </span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speakText(gloss.word, languageCode, 0.9);
              }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#A7F3D0] transition-colors shrink-0"
              title={`Nghe phát âm từ "${gloss.word}"`}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </span>

          <span className="mt-1 flex items-center gap-1.5">
            <span className="inline-block px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-[#D6D3CD]">
              {gloss.partOfSpeech}
            </span>
          </span>

          <span className="block mt-1 text-xs font-medium text-[#FAF8F5] leading-snug">
            {gloss.meaningVi}
          </span>

          {/* Caret pointer */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#181715]" />
        </span>
      )}
    </span>
  );
}

interface HoverableSentenceProps {
  sentence: string;
  languageCode: LanguageCode;
  allCards?: VocabCard[];
  className?: string;
}

/**
 * Splits a sentence into interactive words so hovering over any word
 * displays its pronunciation (IPA/Pinyin) and Vietnamese meaning.
 */
export function HoverableSentence({
  sentence,
  languageCode,
  allCards = [],
  className = "",
}: HoverableSentenceProps) {
  const tokens = sentence.split(/\s+/).filter(Boolean);

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1 ${className}`}>
      {tokens.map((token, idx) => {
        const isBlank = /^_+$/.test(token.replace(/[.,!?;:]/g, ""));
        if (isBlank) {
          return (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-[#1F5E3B]/10 text-[#1F5E3B] font-mono tracking-wider"
            >
              {token}
            </span>
          );
        }

        return (
          <HoverWordTooltip
            key={idx}
            token={token}
            languageCode={languageCode}
            allCards={allCards}
          >
            <span
              onClick={() => {
                const clean = token.replace(/[.,!?;:"'“”‘’()[\]]/g, "");
                if (clean) speakText(clean, languageCode, 0.9);
              }}
              className="cursor-help border-b border-dotted border-[#8A847C]/70 hover:border-[#1F5E3B] hover:text-[#1F5E3B] hover:bg-[#1F5E3B]/8 px-0.5 rounded-sm transition-colors"
            >
              {token}
            </span>
          </HoverWordTooltip>
        );
      })}
    </span>
  );
}

