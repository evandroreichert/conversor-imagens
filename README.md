# Conversor de Imagens & Gerador WhatsApp

## Sobre o Projeto

Uma aplicação web moderna que combina duas ferramentas essenciais:

1. **Conversor de Imagens** - Converte imagens entre diferentes formatos (JPEG, PNG, WebP) com processamento client-side usando Canvas HTML.
2. **Gerador de Links WhatsApp** - Cria links wa.me personalizados com QR codes.

## Funcionalidades

### Conversor de Imagens
- Conversão entre formatos JPEG, PNG e WebP
- Processamento totalmente no navegador (sem upload para servidor)
- Interface drag-and-drop intuitiva
- Preview em tempo real
- Download automático da imagem convertida
- Suporte a múltiplos formatos de entrada

### Gerador WhatsApp
- Formatação automática de números brasileiros
- Geração de links wa.me personalizados
- Criação de QR codes escaneáveis
- Mensagem pré-definida opcional
- Funcionalidades de copiar link e download do QR code
- Abertura direta no WhatsApp

## Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes de interface
- **QR Server API** - Geração de QR codes