/**
 * Limpeza do texto da carta de indeferimento antes de sair do navegador.
 *
 * `redactPii` cobre o que tem formato reconhecível (CPF, NB, e-mail, telefone),
 * mas não cobre **nome** — e o nome é o dado mais identificador da carta.
 * Detectar nome em texto livre é impossível sem estragar o conteúdo; o que dá
 * para fazer com segurança é apagar o valor que vem depois dos rótulos que a
 * carta do INSS usa, que são poucos e previsíveis.
 *
 * Nada disso é necessário para dizer POR QUE o benefício foi negado — que é a
 * única coisa que a análise faz.
 *
 * Roda no navegador e de novo no servidor: se o cliente for contornado, o dado
 * sensível ainda não chega ao modelo.
 */
import { redactPii } from "./pii";

/** Rótulos usados nas comunicações do INSS antes do nome de uma pessoa. */
// Grupo NÃO capturante de propósito: este padrão é embutido em outro regex, e
// um grupo capturante aqui desloca os índices de lá.
const ROTULOS_NOME =
  /\b(?:requerente|nome(?:\s+d[oa]\s+(?:requerente|segurad[oa]|instituidor|benefici[áa]ri[oa]))?|segurad[oa]|benefici[áa]ri[oa]|instituidor(?:\s+do\s+benef[íi]cio)?|dependente|titular)\s*:\s*/;

/** Palavra que pode fazer parte de um nome: capitalizada, ou toda em maiúsculas. */
const PALAVRA_NOME = "[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç']*";

/** Conectores minúsculos comuns em nome brasileiro ("José da Silva"). */
const CONECTOR = "(?:d[aeo]s?|e)";

/**
 * Siglas de campo que vêm em maiúsculas e por isso pareciam sobrenome — sem
 * isso, "Requerente: MARIA SOUZA CPF: 123..." engolia o rótulo CPF junto.
 */
const SIGLAS_CAMPO =
  "(?!(?:CPF|NB|RG|NIT|PIS|PASEP|DER|DIB|DCB|CID|CNIS|INSS|DATA|BENEFICIO|BENEFÍCIO|ESPECIE|ESPÉCIE|PROTOCOLO|REQUERIMENTO)\\b)";

/**
 * Apaga o nome que segue um rótulo.
 *
 * Consome só sequências de palavras capitalizadas (2 a 6), que é o formato de
 * nome nas comunicações do INSS. Parar na primeira palavra minúscula evita
 * engolir o resto da frase quando a carta não tem pontuação entre os campos —
 * era o que acontecia com a versão anterior, baseada em pontuação.
 */
function removerNomes(texto: string) {
  // O rótulo é casado sem distinção de maiúsculas; o nome, COM. Um regex único
  // com flag `i` fazia o padrão de nome aceitar palavras minúsculas e engolir
  // o texto seguinte, então a checagem do nome fica numa segunda passada.
  const P = `${SIGLAS_CAMPO}${PALAVRA_NOME}`;
  const nome = new RegExp(`^${P}(?:\\s+(?:${CONECTOR}|${P})){1,5}`);
  const re = new RegExp(`(${ROTULOS_NOME.source})([^\\n]{0,120})`, "gi");

  return texto.replace(re, (_todo, rotulo: string, resto: string) => {
    const achado = resto.match(nome);
    if (!achado) return `${rotulo}${resto}`;
    // Um conector no fim ("Maria de") é preposição da frase seguinte, não parte
    // do nome — devolve ao texto em vez de engolir.
    const capturado = achado[0].replace(new RegExp(`\\s+${CONECTOR}$`), "");
    return `${rotulo}[NOME]${resto.slice(capturado.length)}`;
  });
}

export function limparTextoCarta(texto: string): string {
  return redactPii(removerNomes(texto))
    // O telefone entre parênteses deixa um "(" órfão: a regex de PII começa nos
    // dígitos, não no parêntese.
    .replace(/\(\s*\[FONE\]/g, "[FONE]")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
