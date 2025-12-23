# 🚀 Setup Completo - MAYA Social Media

## 📋 Checklist Rápido

- [ ] 1. Criar conta e fazer login
- [ ] 2. Criar organização
- [ ] 3. Criar marca/cliente
- [ ] 4. Configurar templates de conteúdo
- [ ] 5. Gerar plano mensal com IA
- [ ] 6. Revisar e aprovar conteúdos

---

## 🎯 Passo a Passo Completo

### **Passo 1: Acessar o Sistema**

1. Abra: `https://maya-social-web.vercel.app`
2. Clique em **"Login com Google"**
3. Escolha sua conta Google
4. Autorize o acesso

---

### **Passo 2: Criar Organização**

Após o login, você será direcionado para criar uma organização:

**Preencha:**
- **Nome:** Nome da sua empresa/agência (ex: "Minha Agência Digital")
- **Slug:** Identificador único (ex: "minha-agencia")

👉 Clique em **"Criar Organização"**

---

### **Passo 3: Criar Marca/Cliente**

Agora vamos adicionar sua marca ou cliente:

**Preencha:**
- **Nome:** Nome da marca (ex: "Loja Fashion Style")
- **Slug:** Identificador único (ex: "fashion-style")
- **Cor Primária:** Cor principal da marca (ex: "#FF6B6B")
- **Logo:** (Opcional) Upload do logo

👉 Clique em **"Criar Marca"**

---

### **Passo 4: Configurar Templates de Conteúdo**

Agora vem a parte importante! Vá em **"Templates"** no menu lateral.

#### **Opção A: Templates Padrão (Recomendado - Mais Rápido)**

1. Clique em **"Criar Templates Padrão"**
2. O sistema cria 6 templates básicos automaticamente:
   - Feed Produto (Segunda 12h)
   - Reels Terça (Terça 12h)
   - Feed Lifestyle (Quarta 12h)
   - Stories Quinta (Quinta 18h)
   - Feed Promoção (Sexta 12h)
   - Reels Sábado (Sábado 10h)
3. Pronto! ✅

#### **Opção B: Templates Personalizados**

Clique em **"+ Novo Template"** e configure conforme sua estratégia:

**Exemplo de Template:**
- **Nome:** Feed Segunda
- **Tipo:** FEED, REELS, STORIES ou CAROUSEL
- **Dia da Semana:** Segunda-feira
- **Horário:** 12:00
- **Recorrência:** SEMANAL, QUINZENAL ou MENSAL
- **Categoria:** PRODUTO, PROMO, LIFESTYLE, etc.

**Dica:** Crie templates que façam sentido para seu negócio e público.

---

### **Passo 5: Gerar Plano Mensal**

Agora vamos gerar o calendário do mês!

1. Vá em **"Calendário"** no menu lateral
2. Selecione o mês desejado (ex: Janeiro 2025)
3. Clique em **"Gerar Mês"**

**O que acontece:**
- Sistema cria automaticamente todos os posts do mês
- Baseado nos templates que você configurou
- Cada post recebe um código único (ex: `MARCA_2025-01_FE_01_PRODUTO_v1`)

---

### **Passo 6: 🆕 GERAÇÃO AUTOMÁTICA COM IA**

Aqui está a funcionalidade mais poderosa! Você pode gerar briefs e artes automaticamente.

#### **Como Funciona:**

Quando você gera o calendário mensal, pode ativar a geração automática de:
- ✅ **Briefs** → IA cria título, caption, hashtags, objetivos
- ✅ **Artes** → IA gera prompts detalhados para criação visual
- ✅ **Direção criativa** → Cores, fontes, composição

#### **Benefícios:**

- ⏱️ **Economia de tempo:** De horas para minutos
- 🎨 **Qualidade:** Briefs profissionais e criativos
- 📊 **Consistência:** Padrão elevado em todos os posts
- 🚀 **Produtividade:** Foco na execução, não no planejamento

---

### **Passo 7: Revisar Conteúdos Gerados**

1. Vá em **"Conteúdos"** no menu lateral
2. Veja todos os posts criados
3. Cada post terá:
   - **Código único**
   - **Brief** (se gerado com IA)
   - **Data/hora de publicação**
   - **Status:** PLANNED, BRIEFED, IN_PRODUCTION, etc.

---

### **Passo 8: Workflow de Produção**

Para cada post:

1. **Brief** → Criado automaticamente pela IA ou manualmente
2. **Produção** → Designer/produtor cria o conteúdo
3. **Upload** → Sobe os assets no sistema
4. **Aprovação** → Responsável aprova ou pede revisão
5. **Agendamento** → Post vai para fila de publicação
6. **Publicação** → Post é publicado nas redes sociais

---

## 🎨 Exemplos de Briefs que a IA Gera

### Para Post de Produto
```
Título: Lançamento Exclusivo - Coleção Verão
Objetivo: Gerar desejo e conversões
Público-alvo: Mulheres 25-40 anos, classe A/B
Caption: A coleção que você esperava chegou! ☀️

Peças exclusivas com até 30% de desconto.
Cores vibrantes, tecidos leves e muito estilo.

📍 Disponível online e nas lojas
💳 Parcele em até 6x sem juros

Hashtags: #verao2025 #moda #lancamento #estilo
```

### Para Post de Engajamento
```
Título: Qual é o seu favorito?
Objetivo: Gerar engajamento e insights
Público-alvo: Seguidores ativos
Caption: Ajude a gente a decidir! 🤔

Qual dessas opções você prefere?
A) Opção 1
B) Opção 2
C) Opção 3

Comenta aqui embaixo! 👇

Hashtags: #enquete #voce decide #comunidade
```

---

## ⚙️ Configurações Importantes

### **Para Rodar Localmente**

Se você for desenvolvedor e quiser rodar o sistema localmente:

```bash
# 1. Clone o repositório
git clone <repo>
cd "MAYA - SOCIAL MIDIA"

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example apps/api/.env
# Edite apps/api/.env com suas configurações

# 4. Suba banco de dados
docker compose up -d postgres redis

# 5. Rode migrações
npm run db:push

# 6. Inicie o sistema
npm run dev

# Acesse:
# Frontend: http://localhost:3000
# API: http://localhost:4000
```

### **Variáveis de Ambiente Necessárias**

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="seu_secret_aqui"
GOOGLE_CLIENT_ID="seu_google_client_id"
GOOGLE_CLIENT_SECRET="seu_google_client_secret"

# IA (Opcional - para geração automática)
OPENAI_API_KEY="sk-..."
```

---

## 📊 Resultado Esperado

Após seguir todos os passos, você terá:

✅ **Calendário completo do mês**
- 20-30 posts planejados
- Distribuídos estrategicamente
- Horários otimizados

✅ **Briefs profissionais** (se usar IA)
- Títulos criativos
- Captions engajantes
- Hashtags relevantes
- Diretrizes claras

✅ **Workflow organizado**
- Status de cada post visível
- Aprovações rastreadas
- Histórico completo
- Auditoria de mudanças

---

## 🆘 Problemas Comuns

### "Erro ao gerar mês"
**Causa:** Nenhum template configurado  
**Solução:** Vá em Templates → Criar Templates Padrão

### "Briefs não foram gerados"
**Causa:** OPENAI_API_KEY não configurada  
**Solução:** Configure a chave da OpenAI no backend (opcional)

### "Não consigo fazer login"
**Causa:** Google OAuth não configurado  
**Solução:** Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET

### "Calendário vazio após gerar"
**Causa:** Templates inativos ou sem templates  
**Solução:** Ative os templates em Templates → Toggle ativo/inativo

---

## 🎯 Casos de Uso

### **Para Agências**
- Gerencie múltiplas marcas/clientes
- Equipe com diferentes permissões
- Workflow de aprovação estruturado

### **Para Empresas**
- Planeje todo o social media
- Integre com ferramentas existentes
- Acompanhe métricas e resultados

### **Para Freelancers**
- Organize projetos de clientes
- Automatize tarefas repetitivas
- Profissionalize entregas

---

## 🚀 Dicas Pro

### **1. Use Templates Estratégicos**
Não crie templates aleatórios. Pense em:
- Dias de maior engajamento do seu público
- Horários de pico
- Mix de conteúdo (produto, valor, engajamento)

### **2. Aproveite a IA**
A geração automática economiza horas de trabalho:
- Briefs consistentes
- Ideias criativas
- Direção de arte profissional

### **3. Mantenha Consistência**
- Use categorias claras
- Siga o calendário
- Revise antes de aprovar

### **4. Acompanhe Métricas**
- Veja o que funciona
- Ajuste a estratégia
- Otimize continuamente

---

## 📞 Suporte

Se tiver qualquer problema:
1. Abra o Console do navegador (F12)
2. Veja os erros na aba Network
3. Consulte a documentação técnica
4. Entre em contato com suporte

---

## 📚 Documentação Adicional

- **API Reference:** `/apps/api/docs/`
- **Arquitetura:** `/docs/ARCHITECTURE.md`
- **Batch Generation:** `/apps/api/docs/BATCH_GENERATION.md`
- **Exemplos:** `/apps/api/docs/BATCH_GENERATION_EXAMPLES.md`

---

## ✨ Próximos Passos

Depois de configurar tudo:

1. ✅ Teste a geração com IA
2. ✅ Ajuste templates conforme necessário
3. ✅ Configure integrações (Google Drive, Meta API)
4. ✅ Treine sua equipe no workflow
5. ✅ Comece a produzir conteúdo de qualidade!

**Bem-vindo ao MAYA! 🎉**
