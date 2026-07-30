/**
 * Injeta um bloco JSON-LD.
 *
 * `dangerouslySetInnerHTML` é o caminho correto aqui: dentro de
 * `<script type="application/ld+json">` o React escaparia as aspas e o Google
 * leria lixo. O conteúdo vem sempre do nosso próprio código, nunca do usuário.
 *
 * O `</` é escapado porque um `</script>` dentro da string encerraria a tag
 * antes da hora — é a única via de injeção que existe aqui.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
