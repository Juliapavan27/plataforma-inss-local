/**
 * Busca de endereço por CEP usando o ViaCEP (público e gratuito).
 *
 * Roda no navegador, direto do formulário — o objetivo é o cliente digitar
 * 8 números e ver rua/bairro/cidade preenchidos sozinhos, em vez de digitar
 * o endereço inteiro.
 */

export interface EnderecoCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    // O ViaCEP responde 200 com { erro: true } quando o CEP não existe.
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    // Falha de rede não deve travar o formulário — o cliente digita manualmente.
    return null;
  }
}

export function maskCep(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
