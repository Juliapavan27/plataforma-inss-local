# Google Ads — Guia passo a passo (primeira campanha)

Feito para a **primeira vez** no Google Ads. Segue de cima para baixo, na ordem. Não pule
etapas. Atualizado em 04/08/2026.

**Decisões já fechadas:**
- Orçamento: **R$ 50/dia**, com **teto de R$ 700 em 14 dias** — no dia 14 você para e avalia.
- Estratégia de lance: **Maximizar cliques com limite de CPC** (NÃO "Maximizar conversões" — explico por quê).
- **2 grupos** concentrados (auxílio-doença + benefício negado genérico), não os 7.
- Não desligar antes do dia 14.

> ## ⚠️ ANTES DE TUDO — OAB
> Você é advogada. O Provimento 205/2021 restringe publicidade e captação. A defesa existe
> (quem anuncia é a plataforma, e recurso administrativo não exige advogado), mas isso é
> decisão sua. **Confirme com alguém da OAB antes de publicar.** E, no anúncio, **não**
> use o ângulo "sem advogado" — sendo você advogada, é o que mais chama atenção do conselho.

---

# PARTE 1 — Ligar a conversão (faça ISTO primeiro)

Sem isso, o Google gasta seu dinheiro cego: não sabe quais cliques viraram venda e otimiza
para o clique errado. **Não crie campanha antes de terminar esta parte.**

### 1.1 — No GA4 (você já fez, confirme)
- Administrador → **Eventos** → o `purchase` está com a **estrela preenchida** (evento principal). ✅ Só ele.

### 1.2 — Vincular GA4 ao Google Ads
1. No **GA4** → Administrador → **Links de produtos** → **Links do Google Ads**.
2. Clique em **Vincular** → escolha sua conta do Google Ads → **Confirmar**.

### 1.3 — Importar a conversão no Google Ads
1. No **Google Ads** → ícone de ferramentas (chave inglesa, no topo) → **Metas** → **Conversões**.
2. Botão **+ Nova ação de conversão** → escolha **Importar** → **Google Analytics 4** → **Web**.
3. Marque **`purchase`** → **Importar e continuar**.
4. Abra a conversão `purchase` importada e confirme que está como **"Primária"**.
   - Se aparecerem `qualify_lead` ou `close_convert_lead`, deixe como **"Secundária"** ou não importe. Só `purchase` é primária.

**Não siga para a Parte 2 sem isto pronto.**

---

# PARTE 2 — Configurar cobrança (se ainda não tiver)

Primeira vez: o Google pede forma de pagamento antes de veicular.
1. Ferramentas → **Faturamento** → **Configurações de pagamento**.
2. País: **Brasil**. Fuso: **(GMT-03:00) Brasília**. Moeda: **BRL** — ⚠️ a moeda **não pode ser mudada depois**, confira.
3. Adicione cartão de crédito. (O Google cobra conforme você gasta, não antecipado.)

---

# PARTE 3 — Criar a campanha

### 3.1 — Começar do jeito certo (evita as automações que queimam verba)
1. No topo → **+ Criar** → **Campanha**.
2. Quando pedir o objetivo, role até o fim e escolha **"Criar uma campanha sem meta específica"** (às vezes aparece como "sem orientação de meta"). Isso destrava o controle manual. **Não** escolha os objetivos guiados — eles forçam configurações ruins.
3. Tipo de campanha: **Pesquisa**. (NUNCA "Máximo desempenho / Performance Max" nem "Display" — torram orçamento pequeno.)
4. Se perguntar "como quer atingir a meta" (site, ligações): pode **desmarcar tudo** e seguir, ou marcar só "Visitas ao site" com a URL `https://www.recursofacil.com`.
5. **Avançar**.

### 3.2 — Configurações da campanha
| Campo | O que colocar |
|---|---|
| Nome | `Recurso Facil - Pesquisa - Benefício negado` |
| **Redes** | Clique para expandir e **DESMARQUE** "Incluir rede de pesquisa" (parceiros) e "Incluir rede de Display". Só a Pesquisa do Google. |
| Locais | **Brasil** (país inteiro) |
| ⚙️ Opções de local | Clique em "Opções de local" e escolha **"Presença: pessoas que estão ou frequentam os locais visados"** — NÃO deixe no padrão "presença ou interesse", senão paga por gente fora do Brasil pesquisando sobre o assunto. |
| Idioma | **Português** |
| Segmentos de público | Pule (não adicione nada agora) |
| **Orçamento** | **R$ 50** por dia |
| **Lances** | Veja 3.3 abaixo |

### 3.3 — A estratégia de lance (o erro nº 1 de iniciante)
1. Em "Lances", o Google vai sugerir **"Conversões"** por padrão. **NÃO aceite.**
   - Motivo: "Maximizar conversões" só funciona depois de ~15-30 conversões, e você tem **zero**. Começar assim faz a campanha gastar mal ou nem gastar.
2. Clique em **"Ou selecione uma estratégia de lances diretamente"**.
3. Escolha **"Cliques"** (Maximizar cliques).
4. Marque **"Definir um limite máximo de custo por clique"** e coloque **R$ 5,00**.
   - Isso impede o Google de pagar mais que R$ 5 por clique. Se depois de 2-3 dias tiver quase nenhum clique, suba para R$ 6,50 (o leilão de previdenciário é caro).
5. **Quando trocar:** depois de acumular ~20-30 vendas (`purchase`), aí sim mude para "Maximizar conversões". Não antes.

### 3.4 — Outras opções (role até "Mais configurações")
- **Rotação de anúncios:** "Otimizar: preferir os melhores anúncios".
- **Programação:** deixe rodando **24h, todos os dias** (a pessoa pesquisa a qualquer hora).
- **Dispositivos:** todos.

**Avançar** para os grupos de anúncios.

---

# PARTE 4 — Grupos de anúncios e palavras-chave

Crie **2 grupos**. Use os sinais de correspondência **exatamente** como estão: `[colchetes]` =
exata, `"aspas"` = frase. **Nunca** digite sem sinal (isso vira correspondência ampla, que é
o que mais queima dinheiro).

### Grupo 1 — "Auxilio-doenca"
- **URL final** deste grupo: `https://www.recursofacil.com/beneficio-negado/auxilio-doenca`
- Palavras-chave:
```
[auxílio doença negado]
[inss negou auxílio doença]
"recurso auxílio doença negado"
"auxílio doença indeferido"
[perícia negou auxílio doença]
```

### Grupo 2 — "Beneficio-negado"
- **URL final** deste grupo: `https://www.recursofacil.com/beneficio-negado`
- Palavras-chave:
```
[benefício negado inss]
[inss indeferiu meu pedido]
[inss negou meu benefício]
"como recorrer do inss"
"recurso administrativo inss"
[carta de indeferimento inss]
```

> **A URL final importa muito.** Cada grupo manda para a página do seu tema — não para a
> home. Isso melhora a nota de qualidade (clique mais barato) e converte melhor.

---

# PARTE 5 — Palavras-chave negativas (corta quem nunca compra)

Sem isto, você paga por quem quer fazer sozinho, procura emprego no INSS ou quer telefone.
No menu esquerdo → **Palavras-chave** → aba **Negativas** → **+** → cole a lista toda de uma
vez (nível campanha):

```
grátis
gratuito
gratuita
sozinho
sozinha
como fazer sozinho
modelo grátis
modelo de recurso
advogado
advogada
escritório
oab
governo
oficial
gov.br
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
antecipação
pente fino
o que é
significado
quanto ganha
tabela
simulador
```

---

# PARTE 6 — O anúncio (Anúncio de pesquisa responsivo)

Cole os títulos e descrições abaixo. O Google combina eles sozinho. **Nenhum promete
resultado nem diz "sem advogado"** — de propósito (OAB + política do Google).

**Títulos** (adicione todos; cada um ≤ 30 caracteres):
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

**Descrições** (adicione todas; cada uma ≤ 90 caracteres):
```
Descreva o caso, anexe documentos e receba o recurso pronto para o Meu INSS.
Fundamentação técnica, entrega em até 24h, em PDF e Word para revisar antes.
A partir de R$ 281 no Pix. Sem mensalidade e sem percentual sobre o benefício.
Você tem 30 dias para recorrer de uma negativa do INSS. Comece agora.
```

**Caminho de exibição** (os dois campos ao lado da URL): `recurso` / `inss`
→ aparece como `recursofacil.com/recurso/inss`.

### Recursos / Extensões (preencha, aumentam MUITO o clique)
- **Sitelinks (links de site):**
  - "Auxílio-doença negado" → `/beneficio-negado/auxilio-doenca`
  - "BPC/LOAS negado" → `/beneficio-negado/bpc-loas`
  - "Como funciona" → `/#como-funciona`
  - "Perguntas frequentes" → `/faq`
- **Frases de destaque (callouts):** Entrega em até 24h · Garantia de 7 dias · Pagamento único · PDF e Word · Sem mensalidade
- **Snippets estruturados** → tipo **"Serviços"**: Auxílio-doença, BPC/LOAS, Aposentadoria, Pensão por morte, Salário-maternidade

---

# PARTE 7 — Os 5 erros que o Google vai te induzir a cometer

O Google ganha quando você gasta mais. Ele vai empurrar tudo isto — **recuse**:

1. **"Ative o Máximo Desempenho / PMax"** → NÃO. Só Pesquisa.
2. **"Use correspondência ampla para alcançar mais"** → NÃO. Só exata e frase.
3. **"Aplicar recomendações automaticamente"** → **DESLIGUE.** Ferramentas → Recomendações → ícone de engrenagem → desative o auto-aplicar. Senão o Google muda sua campanha sozinho.
4. **"Aumente seu orçamento para não perder cliques"** → NÃO durante o teste. R$ 50 é o teto.
5. **Notas de otimização por e-mail/telefone** ("um especialista Google liga para otimizar") → pode ouvir, mas eles empurram gastar mais e ampliar. Não aplique nada que você não entendeu.

---

# PARTE 8 — Publicar e acompanhar

### Ao publicar
- O anúncio entra em **"Em análise"** — o Google leva de algumas horas até 1 dia para aprovar. Normal.
- **Orçamento diário oscila:** o Google pode gastar até ~2x num dia (R$ 100) e menos em outro, mas a média fecha em R$ 50/dia. Não se assuste com um dia mais alto.

### O que olhar, e quando
- **Primeiros 2-3 dias:** só confira se está **veiculando** (teve impressões e cliques). Se zero clique, suba o limite de CPC para R$ 6,50.
- **Não mexa em nada nos primeiros 3-4 dias.** Campanha nova precisa de tempo. Ajustar cedo demais estraga o aprendizado.
- **A partir do dia 4:** olhe o **Relatório de termos de pesquisa** (Palavras-chave → Termos de pesquisa) — ali aparece o que a pessoa REALMENTE digitou. Se aparecer coisa ruim (ex: "recurso educação", "recurso da apple"), adicione como negativa.

### O número que vale
O painel do Google vai mostrar **menos** vendas que o Mercado Pago (bloqueador de anúncios come parte). **A verdade do dinheiro é o Mercado Pago.** O Google só diz *por onde veio*.

### Critério de parada (dia 14, após ~R$ 700)
| O que aconteceu | Significa | O que fazer |
|---|---|---|
| Teve venda(s) | O canal funciona | Continue; suba 20% por vez |
| Cliques + formulários iniciados, mas 0 venda | Trava no checkout/preço | Não é o anúncio — me chame |
| Cliques, mas ninguém inicia o formulário | A página não convence | Falta prova social — me chame |
| Quase nenhum clique | Lance baixo / palavra sem volume | Subir CPC ou revisar palavras |

**Expectativa honesta:** tráfego frio, marca nova, sem avaliações. A 1ª venda provavelmente
cai na **1ª ou 2ª semana**, não no dia 1. Ter cliques por 3-4 dias sem venda é normal. Não
desligue antes do dia 14.

---

# PARTE 9 — Checklist final antes de clicar em "Publicar"

- [ ] Conversão `purchase` importada e como **Primária**
- [ ] Tipo = **Pesquisa** (não PMax/Display)
- [ ] Rede de Display e parceiros de pesquisa **desmarcados**
- [ ] Local = Brasil, opção **"Presença"** (não "interesse")
- [ ] Orçamento = **R$ 50/dia**
- [ ] Lance = **Maximizar cliques**, limite de CPC **R$ 5**
- [ ] 2 grupos, cada um com sua **URL final** correta
- [ ] Palavras só em **[exata]** e **"frase"** — nenhuma ampla
- [ ] Lista de **negativas** colada
- [ ] Anúncio sem "sem advogado" e sem promessa de resultado
- [ ] Sitelinks, callouts e snippets preenchidos
- [ ] Auto-aplicar recomendações **desligado**
- [ ] Teto mental: **R$ 700 / 14 dias**, avaliar no dia 14

---

Qualquer tela que aparecer diferente do que está aqui, tira print e me manda **antes** de
clicar — é a primeira vez, melhor perguntar do que gastar errado.
