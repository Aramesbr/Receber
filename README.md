# Receber — Arames Brasil

Aplicativo web de controle de recebimento de materiais.

## Tecnologias
- React + TypeScript
- Vite
- Tailwind CSS
- Armazenamento local do navegador (`localStorage`)

## Executar

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Armazenamento e privacidade

Esta edição não utiliza Firebase, autenticação externa, GitHub Actions ou serviços de nuvem. Os rascunhos e o histórico são armazenados no `localStorage` do navegador/dispositivo em que o aplicativo estiver aberto.

**Importante:** os dados não são sincronizados entre aparelhos e podem ser perdidos se os dados do navegador forem apagados. Faça cópias de segurança antes de limpar o navegador ou trocar de dispositivo.


## Revisão técnica (20/11/2026)

A versão revisada inclui:
- geração de identificadores com alternativa para navegadores/webviews sem `crypto.randomUUID()`;
- validação e normalização dos registros recuperados do armazenamento local, evitando que dados incompletos ou inválidos quebrem telas e cálculos;
- aviso visível quando o navegador não permite salvar o rascunho;
- validação mais consistente de pesos decimais (vírgula ou ponto) e quantidades inteiras;
- remoção da dependência `jspdf`, que não era importada pelo código; a impressão continua usando a janela de impressão do navegador.

A verificação sintática dos arquivos TypeScript/TSX foi concluída sem erros. A compilação completa (`npm run build`) ainda precisa ser executada em um ambiente com as dependências instaladas; neste ambiente, a instalação de pacotes não foi concluída por indisponibilidade/tempo de resposta do registro npm. Faça `npm install` e depois `npm run build` antes de publicar.
