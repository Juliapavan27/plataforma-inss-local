# Campanha Google Ads — Recurso Fácil

Guia pronto para lançar. Feito para orçamento de **R$ 15–20/dia**, começando pequeno
e concentrado. Atualizado em 04/08/2026.

> **Antes de tudo — OAB.** Você é advogada, e o Provimento 205/2021 restringe publicidade
> e captação. A defesa existe (quem anuncia é a plataforma, e recurso administrativo não
> exige advogado), mas isso é decisão sua, não minha. Confirme com alguém da OAB antes de
> subir. O resto deste guia pressupõe que você já resolveu isso.

---

## PASSO 1 — Ligar a conversão (é o que faz ou quebra tudo)

Sem isso, o Google gasta seu dinheiro às cegas: ele não sabe quais cliques viraram venda,
e não consegue otimizar. Faça **antes** de criar a campanha.

1. **GA4** → Administrador → **Eventos** → ache `purchase` → marque como **evento
   principal** (a chavinha "Marcar como principal").
2. **GA4** → Administrador → **Links de produtos** → **Links do Google Ads** → vincule a
   sua conta do Google Ads.
3. **Google Ads** → Ferramentas → **Conversões** → **+ Nova** → **Importar** → Google
   Analytics 4 → importe o `purchase`.
4. Confirme que a conversão aparece como **"Primária"** em Conversões.

Só depois disso siga para o passo 2.

---

## PASSO 2 — Criar a campanha

**Tipo:** Pesquisa (Search). **NÃO** use "Performance Max" nem "Display" — o Google
empurra os dois com força, e eles torram orçamento pequeno sem você ver onde. Só Pesquisa.

| Configuração | Valor |
|---|---|
| Objetivo | "Criar campanha sem meta" (evita o Google forçar automações) |
| Tipo | Pesquisa |
| Redes | **Desmarque** "Rede de Display" e "parceiros de pesquisa" |
| Local | Brasil |
| Idioma | Português |
| Orçamento | R$ 20/dia |
| Lances (bidding) | **"Maximizar cliques" com limite de CPC de R$ 3,50** — comece assim. Sem histórico de conversão, o lance por conversão não tem como aprender. Depois de ~20–30 conversões, troque para "Maximizar conversões". |

**Desligue** em Configurações → "Recomendações" → **auto-aplicar**. O Google auto-aplica
mudanças (correspondência ampla, orçamento maior) que queimam verba de iniciante.

---

## PASSO 3 — Grupos de anúncios e palavras-chave

Com R$ 20/dia, **comece com 2 grupos só**. Espalhar em 7 = nada em cada um. Auxílio-doença
é o benefício mais negado (mais volume); o segundo grupo pega a busca genérica.

Use **correspondência de frase** (`"aspas"`) e **exata** (`[colchetes]`). **Nunca** ampla
(sem sinal) — ampla é o que mais queima dinheiro.

### Grupo 1 — Auxílio-doença → leva para `/beneficio-negado/auxilio-doenca`
```
[auxílio doença negado]
[inss negou auxílio doença]
"recurso auxílio doença negado"
"auxílio doença indeferido"
[perícia negou auxílio doença]
```

### Grupo 2 — Benefício negado (genérico) → leva para `/beneficio-negado`
```
[benefício negado inss]
[inss indeferiu meu pedido]
"como recorrer do inss"
"recurso administrativo inss"
[carta de indeferimento inss]
```

> Manda para a **página do benefício**, não para a home e não direto para o formulário. A
> página do benefício explica, gera confiança (marca desconhecida + tema sério) e tem o
> botão para gerar o recurso. Tráfego pago frio jogado num formulário puro converte pior.

### Quando quiser um 3º grupo (BPC é o próximo) → `/beneficio-negado/bpc-loas`
```
[bpc negado]
[loas negado]
"recurso bpc loas"
[benefício assistencial negado]
```

---

## PASSO 4 — Palavras negativas (cole todas de uma vez)

Sem isso, você paga por quem nunca vai comprar: quem quer fazer sozinho, quem procura
emprego no INSS, quem quer telefone. Em **Palavras-chave → Negativas**, cole:

```
grátis
gratuito
gratuita
sozinho
sozinha
como fazer sozinho
modelo grátis
telefone
0800
135
meu inss login
agendar perícia
emprego
vaga
concurso
salário
empréstimo
consignado
pente fino
o que é
quanto ganha
tabela
simulador
```

---

## PASSO 5 — O anúncio (Anúncio de pesquisa responsivo)

Cole os títulos e descrições abaixo. O Google combina eles sozinho. **Nenhum promete
resultado** — de propósito: prometer êxito é problema com a OAB e com o Google.

**Títulos** (até 15; cada um ≤ 30 caracteres):
```
INSS Negou? Você Pode Recorrer
Recurso Administrativo INSS
Recurso Contra o INSS
Prazo de 30 Dias Para Recorrer
Recorra do Indeferimento
Recurso em PDF e Word
Pronto Para Protocolar
Entrega em até 24h
A Partir de R$ 281 no Pix
Sem % Sobre Seu Benefício
Pagamento Único
Feito com Base na Lei 8.213
Recurso Fácil
```

**Descrições** (até 4; cada uma ≤ 90 caracteres):
```
Descreva o caso, anexe documentos e receba o recurso pronto para o Meu INSS.
Fundamentação técnica, entrega em até 24h, em PDF e Word para revisar antes.
A partir de R$ 281 no Pix. Sem mensalidade e sem percentual sobre o benefício.
Você tem 30 dias para recorrer de uma negativa do INSS. Comece agora.
```

**Recursos (extensões)** — preencha estes, aumentam muito a taxa de clique:
- **Sitelinks:** "Auxílio-doença negado" → `/beneficio-negado/auxilio-doenca` · "BPC/LOAS negado" → `/beneficio-negado/bpc-loas` · "Como funciona" → `/#como-funciona` · "Perguntas frequentes" → `/faq`
- **Frases de destaque:** Entrega em até 24h · Garantia de 7 dias · Pagamento único · PDF e Word
- **Snippet estruturado** (Tipo: Serviços): Auxílio-doença, BPC/LOAS, Aposentadoria, Pensão por morte

---

## PASSO 6 — Critério de parada (combine agora, siga depois)

Depois de gastar ~R$ 400–600 (2–4 semanas):

| O que aconteceu | O que significa | O que fazer |
|---|---|---|
| Vendas acontecendo | O canal funciona | Aumente devagar, 20% por vez |
| Cliques e formulários iniciados, mas 0 venda | Trava no checkout ou preço | Não é o anúncio — me chame |
| Cliques mas ninguém inicia o formulário | A página não convence | Falta prova social — me chame |
| Quase nenhum clique | Lance baixo ou palavra sem volume | Ajustar lance/palavras |

O objetivo das primeiras semanas **não é lucro** — é descobrir qual benefício e qual
anúncio funcionam. Com R$ 20/dia, resultado modesto é esperado e normal.

---

## Lembretes

- **O painel vai subcontar.** Bloqueador de anúncios (que muita gente tem) impede parte do
  rastreamento. O número real de vendas é o do **Mercado Pago**, sempre. O Google/GA4
  mostram *por onde veio*, não *quanto entrou*.
- **Sua capacidade de entrega é o limite real.** Você escreve cada recurso. Se o anúncio
  trouxer mais pedidos do que você dá conta, a entrega atrasa e vira reclamação. Cresça no
  ritmo que consegue atender.
- **Não confie nas "Recomendações" do Google.** Elas quase sempre empurram gastar mais e
  ampliar correspondência. Leia, mas aplique só o que entender.
