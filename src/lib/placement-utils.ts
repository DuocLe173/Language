export interface PlacementRecommendation {
  recommendedDay: number;
  levelLabel: string;
  summaryVi: string;
}

export function computePlacementUnlockDay(
  correctCount: number,
  totalQuestions: number
): PlacementRecommendation {
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  if (ratio >= 0.95) {
    return {
      recommendedDay: 8,
      levelLabel: "Cao cấp (B2–C1)",
      summaryVi:
        "Nền tảng từ vựng của bạn rất vững! Hệ thống mở khóa thẳng tới Ngày 8 để bạn thử sức với các cụm từ nâng cao.",
    };
  }
  if (ratio >= 0.75) {
    return {
      recommendedDay: 6,
      levelLabel: "Trung cấp khá (B1–B2)",
      summaryVi:
        "Bạn đã nắm tốt các từ vựng cơ bản và trung cấp. Hệ thống mở khóa tới Ngày 6 để tiết kiệm thời gian học lại từ đầu.",
    };
  }
  if (ratio >= 0.5) {
    return {
      recommendedDay: 4,
      levelLabel: "Sơ trung cấp (A2–B1)",
      summaryVi:
        "Bạn có nền tảng giao tiếp cơ bản tốt. Hệ thống mở khóa tới Ngày 4 để bạn bắt đầu đúng nhịp độ phù hợp.",
    };
  }
  return {
    recommendedDay: 1,
    levelLabel: "Nền tảng (A1–A2)",
    summaryVi:
      "Bắt đầu từ Ngày 1 sẽ giúp bạn xây chắc phản xạ phát âm, mặt chữ và ngữ cảnh thực tế từ gốc.",
  };
}
