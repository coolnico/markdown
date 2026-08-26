"use client";

/**
 * Generate a real PDF file from HTML content and trigger download.
 */
export async function generatePdf(
  html: string,
  filename: string = "document.pdf"
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  // Create a hidden container to render the HTML
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#fff";
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      } as never)
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
