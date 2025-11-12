import PdfObjectViewer from "@/components/PdfObjectViewer";

export default function TermsPrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-white/90">
      <h1 className="text-2xl font-semibold mb-4">
        Aviso de Privacidad y Condiciones de Uso
      </h1>
      <PdfObjectViewer
        src="/legal/pdfs/avisoprivacidad.pdf"
        height="85vh"
      />
    </main>
  );
}
