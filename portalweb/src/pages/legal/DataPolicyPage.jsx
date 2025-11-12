import PdfObjectViewer from "@/components/PdfObjectViewer";

export default function DataPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-white/90">
      <h1 className="text-2xl font-semibold mb-4">
        Política de Protección de Datos
      </h1>
      <PdfObjectViewer
        src="/legal/pdfs/politicadatos.pdf"
        height="85vh"
      />
    </main>
  );
}
