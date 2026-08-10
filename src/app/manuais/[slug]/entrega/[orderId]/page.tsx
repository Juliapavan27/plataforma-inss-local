import { Download } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ManualReader } from "@/components/manuais/manual-reader";
import { loadManualForDelivery } from "@/lib/manuais-service";
import { SUPPORT_EMAIL } from "@/lib/support";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Seu manual",
  robots: { index: false, follow: false },
};

/**
 * Entrega do manual pago. Acesso pelo mesmo token assinado do checkout (também
 * enviado por e-mail), sem exigir login. Só abre se o pedido está pago.
 */
export default async function EntregaManualPage({
  params,
  searchParams,
}: {
  params: { slug: string; orderId: string };
  searchParams: { t?: string };
}) {
  const token = searchParams.t ?? null;
  const data = await loadManualForDelivery(params.orderId, token);

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="container py-20">
          <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-8 text-center">
            <h1 className="font-display text-xl font-semibold text-ink-950">
              Não conseguimos abrir este manual
            </h1>
            <p className="mt-3 text-sm text-ink-600">
              O link pode ter expirado. Escreva para {SUPPORT_EMAIL} que a gente reenvia
              seu acesso.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { manual, order } = data;
  const pdfUrl = `/api/manuais/${order.id}/pdf?t=${encodeURIComponent(token ?? "")}`;

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="container py-10">
          <div className="mx-auto mb-8 flex max-w-3xl flex-col items-start justify-between gap-4 rounded-2xl border border-success-200 bg-success-50 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-ink-900">Compra confirmada — seu manual está liberado</p>
              <p className="text-sm text-ink-600">
                Enviamos o PDF para {order.buyerEmail}. Guarde este link para reabrir quando quiser.
              </p>
            </div>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-none px-5 py-3">
              <Download className="h-4 w-4" /> Baixar PDF
            </a>
          </div>
          <ManualReader manual={manual} />
        </div>
      </main>
      <Footer />
    </>
  );
}
