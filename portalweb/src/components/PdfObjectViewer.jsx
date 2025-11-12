// src/components/PdfObjectViewer.jsx
export default function PdfObjectViewer({
  src, // URL del PDF (misma origin recomendado para evitar CORS)
  className = "",
  height = "80vh", // Puedes pasar "calc(100vh - 120px)" si quieres algo más preciso
  downloadLabel = "Descargar PDF",
}) {
  return (
    <div className={`rounded-xl overflow-hidden bg-black/20 ${className}`}>
      <object
        data={`${src}#view=FitH`} // puedes añadir #page=1 o #zoom=page-width
        type="application/pdf"
        className="w-full"
        style={{ height }}
      >
        <p className="p-4 text-white/80">
          No se pudo mostrar el PDF en este navegador.{" "}
          <a
            className="underline"
            href={src}
            target="_blank"
            rel="noopener noreferrer"
          >
            {downloadLabel}
          </a>
          .
        </p>
      </object>
    </div>
  );
}
