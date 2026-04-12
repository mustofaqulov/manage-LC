import { jsPDF } from 'jspdf';

interface RubricScore {
  criterionName: string;
  score: number;
  maxScore: number;
  feedback?: string | null;
}

interface ResponseData {
  questionId: string;
  questionType: string;
  answer?: Record<string, any> | null;
  aiSummary?: string | null;
  rubricScores?: RubricScore[] | null;
}

interface CriterionBreakdown {
  criterionName: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface PartAnalysis {
  partNumber: number;
  partName: string;
  score: number;
  maxScore: number;
  criteriaBreakdown: CriterionBreakdown[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface CrossPartComparison {
  strongestPart: number;
  weakestPart: number;
  patterns: string[];
  progressionNotes: string[];
}

interface SpeakingAnalysis {
  estimatedSpeakingLevel?: string | null;
  overallSummary: string;
  partAnalyses: PartAnalysis[];
  crossPartComparison: CrossPartComparison;
  overallStrengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  confidence?: number | null;
  generatedAt: string;
}

interface AttemptDetail {
  id: string;
  testTitle: string;
  cefrLevel: string;
  estimatedCefrLevel?: string | null;
  startedAt: string;
  scoredAt?: string | null;
  totalScore?: number | null;
  maxTotalScore?: number | null;
  scorePercentage?: number | null;
  aiSummary?: string | null;
  responses?: ResponseData[] | null;
}

const ORANGE = [255, 115, 0] as const;
const DARK = [30, 30, 30] as const;
const GRAY = [100, 100, 100] as const;
const LIGHT_GRAY = [220, 220, 220] as const;
const GREEN = [34, 197, 94] as const;
const RED = [239, 68, 68] as const;
const BLUE = [59, 130, 246] as const;

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawSection(doc: jsPDF, title: string, y: number, pageWidth: number, margin: number): number {
  doc.setFillColor(...ORANGE);
  doc.rect(margin, y, pageWidth - margin * 2, 0.5, 'F');
  y += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ORANGE);
  doc.text(title.toUpperCase(), margin, y);
  y += 6;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  return y;
}

function checkPage(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    return margin + 10;
  }
  return y;
}

export function generateAttemptPdf(
  detail: AttemptDetail,
  analysis: SpeakingAnalysis | null,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const lineH = 5;
  let y = margin;

  // ===== HEADER =====
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ManageLC', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CEFR Speaking Exam Report', margin, 19);

  const dateStr = new Date(detail.startedAt).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(dateStr, pageWidth - margin, 19, { align: 'right' });

  y = 38;

  // ===== TEST INFO CARD =====
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(detail.testTitle, contentWidth - 40);
  doc.text(titleLines, margin + 4, y + 8);

  // Score badge
  if (detail.scorePercentage != null) {
    const score = Math.round(detail.scorePercentage);
    const [r, g, b] = score >= 70 ? GREEN : score >= 50 ? [245, 158, 11] as const : RED;
    doc.setFillColor(r, g, b);
    doc.roundedRect(pageWidth - margin - 24, y + 4, 22, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}%`, pageWidth - margin - 13, y + 12, { align: 'center' });
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  const meta: string[] = [];
  meta.push(`CEFR: ${detail.cefrLevel}`);
  if (detail.estimatedCefrLevel) meta.push(`Estimated: ${detail.estimatedCefrLevel}`);
  if (detail.totalScore != null && detail.maxTotalScore != null) {
    meta.push(`Score: ${Math.round(detail.totalScore)} / ${Math.round(detail.maxTotalScore)}`);
  }
  if (analysis?.confidence != null) {
    meta.push(`AI Confidence: ${Math.round(analysis.confidence * 100)}%`);
  }
  doc.text(meta.join('   |   '), margin + 4, y + 22);

  y += 36;

  // ===== AI OVERALL SUMMARY =====
  if (detail.aiSummary || analysis?.overallSummary) {
    y = checkPage(doc, y, 25, margin);
    y = drawSection(doc, 'AI Umumiy Tahlil', y, pageWidth, margin);

    const summary = analysis?.overallSummary || detail.aiSummary || '';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    y = wrapText(doc, summary, margin, y, contentWidth, lineH);
    y += 4;
  }

  // ===== STRENGTHS / IMPROVEMENTS / RECOMMENDATIONS =====
  if (analysis) {
    const cols = [
      { title: 'Kuchli Tomonlar', items: analysis.overallStrengths, color: GREEN },
      { title: "Rivojlantirish Kerak", items: analysis.areasForImprovement, color: RED },
      { title: 'Tavsiyalar', items: analysis.recommendations, color: BLUE },
    ] as const;

    for (const col of cols) {
      if (col.items.length === 0) continue;
      y = checkPage(doc, y, 20, margin);
      y = drawSection(doc, col.title, y, pageWidth, margin);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      for (const item of col.items) {
        y = checkPage(doc, y, 10, margin);
        doc.setTextColor(...col.color);
        doc.text('•', margin, y);
        doc.setTextColor(...DARK);
        y = wrapText(doc, item, margin + 5, y, contentWidth - 5, lineH);
        y += 1;
      }
      y += 3;
    }
  }

  // ===== PART ANALYSES =====
  if (analysis?.partAnalyses?.length) {
    y = checkPage(doc, y, 15, margin);
    y = drawSection(doc, "Bo'limlar bo'yicha Tahlil", y, pageWidth, margin);

    for (const part of analysis.partAnalyses) {
      y = checkPage(doc, y, 18, margin);

      // Part header
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(`Part ${part.partNumber}: ${part.partName}`, margin + 3, y + 7);

      const partPct = part.maxScore > 0 ? Math.round((part.score / part.maxScore) * 100) : 0;
      doc.setFontSize(9);
      doc.text(`${Math.round(part.score)} / ${Math.round(part.maxScore)} (${partPct}%)`, pageWidth - margin - 3, y + 7, { align: 'right' });

      y += 14;

      // Criteria breakdown
      if (part.criteriaBreakdown?.length) {
        for (const crit of part.criteriaBreakdown) {
          y = checkPage(doc, y, 14, margin);

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...GRAY);
          doc.text(crit.criterionName, margin + 4, y);

          const pct = crit.maxScore > 0 ? Math.round((crit.score / crit.maxScore) * 100) : 0;
          const [r, g, b] = pct >= 70 ? GREEN : pct >= 50 ? [245, 158, 11] as const : RED;
          doc.setTextColor(r, g, b);
          doc.text(`${Math.round(crit.score)}/${Math.round(crit.maxScore)}`, pageWidth - margin - 3, y, { align: 'right' });

          // Score bar
          const barW = contentWidth - 8;
          doc.setFillColor(...LIGHT_GRAY);
          doc.rect(margin + 4, y + 2, barW, 2, 'F');
          doc.setFillColor(r, g, b);
          doc.rect(margin + 4, y + 2, barW * (pct / 100), 2, 'F');

          y += 6;

          if (crit.feedback) {
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...GRAY);
            y = wrapText(doc, crit.feedback, margin + 6, y, contentWidth - 8, 4.5);
            y += 2;
          }
        }
      }

      // Part recommendations
      if (part.recommendations?.length) {
        y = checkPage(doc, y, 8, margin);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ORANGE);
        doc.text('Tavsiyalar:', margin + 4, y);
        y += 4;
        for (const rec of part.recommendations) {
          y = checkPage(doc, y, 8, margin);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...GRAY);
          y = wrapText(doc, `• ${rec}`, margin + 6, y, contentWidth - 8, 4.5);
        }
      }

      y += 5;
    }
  }

  // ===== CROSS-PART COMPARISON =====
  if (analysis?.crossPartComparison) {
    const comp = analysis.crossPartComparison;
    const hasContent =
      comp.patterns?.length || comp.progressionNotes?.length;

    if (hasContent) {
      y = checkPage(doc, y, 15, margin);
      y = drawSection(doc, "Qismlar Taqqoslamasi", y, pageWidth, margin);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK);

      if (comp.strongestPart) {
        doc.text(`Eng kuchli qism: Part ${comp.strongestPart}`, margin, y);
        y += lineH;
      }
      if (comp.weakestPart) {
        doc.text(`Eng zaif qism: Part ${comp.weakestPart}`, margin, y);
        y += lineH;
      }

      for (const p of comp.patterns ?? []) {
        y = checkPage(doc, y, 8, margin);
        doc.setTextColor(...GRAY);
        y = wrapText(doc, `• ${p}`, margin, y, contentWidth, 4.5);
      }
      for (const n of comp.progressionNotes ?? []) {
        y = checkPage(doc, y, 8, margin);
        y = wrapText(doc, `• ${n}`, margin, y, contentWidth, 4.5);
      }
      y += 4;
    }
  }

  // ===== PER-RESPONSE: TRANSCRIPT + AI BAHOLASH =====
  const speakingResponses = (detail.responses ?? []).filter(
    (r) => r.questionType === 'SPEAKING_RESPONSE' &&
      (r.aiSummary || (r.rubricScores?.length ?? 0) > 0 || r.answer?.transcript || r.answer?.text || r.answer?.transcription)
  );

  if (speakingResponses.length > 0) {
    y = checkPage(doc, y, 15, margin);
    y = drawSection(doc, "Har bir Savol bo'yicha Tahlil", y, pageWidth, margin);

    for (let i = 0; i < speakingResponses.length; i++) {
      const resp = speakingResponses[i];
      y = checkPage(doc, y, 15, margin);

      // Savol header
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, y - 1, contentWidth, 8, 1.5, 1.5, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(`Savol ${i + 1}`, margin + 3, y + 5);
      y += 11;

      // Transcript (aytilgan so'zlar)
      const transcriptText: string =
        resp.answer?.transcript ||
        resp.answer?.transcription ||
        resp.answer?.text ||
        '';

      if (transcriptText) {
        y = checkPage(doc, y, 14, margin);

        // "Aytilgan so'zlar" label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ORANGE);
        doc.text('AYTILGAN SO\'ZLAR:', margin + 2, y);
        y += 4;

        // Transcript text in a light box
        const transcriptLines = doc.splitTextToSize(transcriptText, contentWidth - 8);
        const boxH = transcriptLines.length * 4.5 + 6;
        y = checkPage(doc, y, boxH + 4, margin);
        doc.setFillColor(255, 251, 245);
        doc.setDrawColor(255, 200, 140);
        doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 40, 10);
        doc.text(transcriptLines, margin + 4, y + 5);
        y += boxH + 4;
      }

      // AI umumiy fikr
      if (resp.aiSummary) {
        y = checkPage(doc, y, 10, margin);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...GRAY);
        doc.text('AI FIKR:', margin + 2, y);
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...GRAY);
        y = wrapText(doc, resp.aiSummary, margin + 2, y, contentWidth - 4, 4.5);
        y += 2;
      }

      // Rubric scores
      if (resp.rubricScores?.length) {
        y = checkPage(doc, y, 8, margin);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...GRAY);
        doc.text('BAHOLASH:', margin + 2, y);
        y += 4;

        for (const rs of resp.rubricScores) {
          y = checkPage(doc, y, 10, margin);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...GRAY);
          doc.text(rs.criterionName, margin + 4, y);
          const pct = rs.maxScore > 0 ? Math.round((rs.score / rs.maxScore) * 100) : 0;
          const [r, g, b] = pct >= 70 ? GREEN : pct >= 50 ? [245, 158, 11] as const : RED;
          doc.setTextColor(r, g, b);
          doc.text(`${Math.round(rs.score)}/${Math.round(rs.maxScore)}`, pageWidth - margin - 3, y, { align: 'right' });
          y += 4;
          if (rs.feedback) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...GRAY);
            y = wrapText(doc, rs.feedback, margin + 6, y, contentWidth - 8, 4.5);
            y += 1;
          }
        }
      }

      y += 5;
    }
  }

  // ===== FOOTER on each page =====
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(240, 240, 240);
    doc.rect(0, ph - 10, pageWidth, 10, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('ManageLC CEFR Platform', margin, ph - 4);
    doc.text(`Sahifa ${i} / ${totalPages}`, pageWidth - margin, ph - 4, { align: 'right' });
    if (analysis?.generatedAt) {
      const gen = new Date(analysis.generatedAt).toLocaleDateString('uz-UZ');
      doc.text(`AI tahlil sanasi: ${gen}`, pageWidth / 2, ph - 4, { align: 'center' });
    }
  }

  const filename = `managelc-report-${detail.cefrLevel}-${new Date(detail.startedAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
