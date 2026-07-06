import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-neutral-50">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-medium text-neutral-500">Erro 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-neutral-600">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
