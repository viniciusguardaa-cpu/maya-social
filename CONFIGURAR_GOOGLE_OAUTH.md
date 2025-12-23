# 🔐 Configurar Google OAuth

## Problema Atual

Erro: `Error 400: redirect_uri_mismatch`

Isso acontece porque o Google OAuth não está configurado com as URLs corretas do Vercel.

---

## 📋 Passo a Passo para Configurar

### **1. Acesse o Google Cloud Console**

1. Vá para: https://console.cloud.google.com
2. Faça login com sua conta Google
3. Selecione ou crie um projeto

### **2. Ativar Google+ API**

1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Procure por **"Google+ API"**
3. Clique em **"Enable"** (Ativar)

### **3. Criar Credenciais OAuth**

1. Vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"Create Credentials"** → **"OAuth client ID"**
3. Se pedir, configure a **OAuth consent screen** primeiro:
   - User Type: **External**
   - App name: **MAYA Social Media**
   - User support email: seu email
   - Developer contact: seu email
   - Salve

### **4. Configurar OAuth Client**

**Application type:** Web application

**Name:** MAYA Social Media

**Authorized JavaScript origins:**
```
https://maya-social-web.vercel.app
http://localhost:3000
http://localhost:3001
```

**Authorized redirect URIs:**
```
https://maya-social-web.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

### **5. Copiar Credenciais**

Após criar, você receberá:
- **Client ID:** `algo.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-...`

### **6. Configurar no Vercel**

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **maya-social-web**
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

```
GOOGLE_CLIENT_ID = seu_client_id_aqui
GOOGLE_CLIENT_SECRET = seu_client_secret_aqui
NEXTAUTH_URL = https://maya-social-web.vercel.app
NEXTAUTH_SECRET = gere_uma_string_aleatoria_32_chars
```

Para gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

5. Clique em **Save**
6. Faça **Redeploy** do projeto

### **7. Configurar Localmente (Opcional)**

Edite `apps/web/.env.local`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_string_aleatoria
```

---

## ✅ Testar

1. Acesse: https://maya-social-web.vercel.app
2. Clique em **"Login com Google"**
3. Deve funcionar sem erros!

---

## 🔧 Troubleshooting

### Erro: "redirect_uri_mismatch"
**Solução:** Verifique se a URL no Google Console está EXATAMENTE igual à URL do Vercel

### Erro: "invalid_client"
**Solução:** Verifique se GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão corretos no Vercel

### Erro: "access_denied"
**Solução:** Usuário cancelou ou não tem permissão. Normal se clicar em "Cancelar"

---

## 📞 Suporte

Se continuar com problemas:
1. Verifique os logs do Vercel
2. Verifique o Console do navegador
3. Confirme que as variáveis de ambiente estão salvas no Vercel
