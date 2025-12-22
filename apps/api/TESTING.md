# Guia de Testes - API

## 📋 Visão Geral

Este projeto utiliza **Jest** como framework de testes. Atualmente temos cobertura de testes unitários para os módulos principais.

## 🚀 Comandos Disponíveis

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch (útil durante desenvolvimento)
npm run test:watch

# Rodar testes com cobertura
npm run test:cov

# Rodar testes E2E
npm run test:e2e
```

## ✅ Testes Implementados

### Users Module
- **UsersService** (`users.service.spec.ts`)
  - ✓ Buscar usuário por ID
  - ✓ Buscar usuário por email
  - ✓ Atualizar dados do usuário
  - ✓ Listar organizações do usuário
  - ✓ Tratamento de erros (usuário não encontrado)

- **UsersController** (`users.controller.spec.ts`)
  - ✓ Obter perfil do usuário autenticado
  - ✓ Atualizar perfil do usuário
  - ✓ Listar organizações do usuário

### Auth Module
- **AuthService** (`auth.service.spec.ts`)
  - ✓ Validar ou criar usuário via Google OAuth
  - ✓ Login e geração de JWT
  - ✓ Validação de token
  - ✓ Verificação de permissões por organização
  - ✓ Login com email
  - ✓ Tratamento de erros de autenticação

## 📝 Como Escrever Novos Testes

### 1. Testes Unitários de Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '../prisma/prisma.service';

describe('YourService', () => {
  let service: YourService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    // Mock dos métodos do Prisma que você vai usar
    model: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    mockPrismaService.model.findUnique.mockResolvedValue({ id: '1' });

    // Act
    const result = await service.yourMethod('1');

    // Assert
    expect(result).toEqual({ id: '1' });
    expect(mockPrismaService.model.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
});
```

### 2. Testes Unitários de Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your.controller';
import { YourService } from './your.service';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  const mockService = {
    yourMethod: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return data', async () => {
    mockService.yourMethod.mockResolvedValue({ data: 'test' });

    const result = await controller.yourEndpoint();

    expect(result).toEqual({ data: 'test' });
  });
});
```

## 🎯 Boas Práticas

### 1. **Estrutura AAA (Arrange-Act-Assert)**
```typescript
it('should do something', async () => {
  // Arrange - Preparar dados e mocks
  const mockData = { id: '1', name: 'Test' };
  mockService.method.mockResolvedValue(mockData);

  // Act - Executar a ação
  const result = await service.doSomething('1');

  // Assert - Verificar resultado
  expect(result).toEqual(mockData);
});
```

### 2. **Limpar Mocks**
Sempre use `afterEach(() => jest.clearAllMocks())` para evitar interferência entre testes.

### 3. **Testar Casos de Erro**
```typescript
it('should throw error when not found', async () => {
  mockService.method.mockRejectedValue(new NotFoundException());

  await expect(service.doSomething('999')).rejects.toThrow(NotFoundException);
});
```

### 4. **Usar Mocks Específicos**
Evite mockar tudo. Mocke apenas o que é necessário para o teste.

### 5. **Nomes Descritivos**
Use nomes que descrevem claramente o que está sendo testado:
- ✅ `should return user when found by id`
- ❌ `test user`

## 📊 Cobertura de Testes

Para ver a cobertura de testes:

```bash
npm run test:cov
```

Isso gerará um relatório em `coverage/` mostrando quais linhas de código estão cobertas.

## 🔄 Próximos Passos

### Módulos que precisam de testes:
- [ ] Organizations Module
- [ ] Brands Module
- [ ] Content Module
- [ ] Publications Module
- [ ] Calendar Module
- [ ] Analytics Module
- [ ] AI Module
- [ ] Meta Integration
- [ ] Drive Integration
- [ ] Templates Module
- [ ] Approvals Module

### Testes E2E
Criar testes end-to-end para fluxos completos:
- [ ] Fluxo de autenticação completo
- [ ] Criação e publicação de conteúdo
- [ ] Gestão de organizações e marcas
- [ ] Integração com APIs externas

## 🐛 Debugging de Testes

Se um teste falhar:

1. **Verifique os mocks**: Certifique-se de que os mocks estão retornando os dados corretos
2. **Use console.log**: Adicione logs temporários para ver o que está acontecendo
3. **Rode apenas um teste**: Use `.only` para focar em um teste específico
   ```typescript
   it.only('should do something', async () => {
     // seu teste
   });
   ```
4. **Verifique as chamadas**: Use `toHaveBeenCalledWith` para verificar se os métodos foram chamados corretamente

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
