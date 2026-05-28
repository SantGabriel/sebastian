<div align="center">
   <img src="assets/logo.png" alt="Sebastian Logo" height="200" />
</div>

# Sebastian - O seu mordomo orquestrador de Currículo

Ferramenta para processar vagas em lote, calcular fit, gerar currículo (Curriculum Vitae - CV), Carta de Apresentação (Cover Letter - CL) por vaga com dashboard local, seja para uma vaga no Brasil ou na gringa.

## Requisitos

- Node.js 22.21+
- npm

## 1) Instalação e execução

- Sebastian precisa de Node.js para gerar os CVs. Baixe aqui: https://nodejs.org/en/download/archive/v22.21.1
- Instale os pacotes necessários rodando o comando:
```bash
npm install
```

- Iniciar o projeto com o comando:
```bash
npm start
```

## 2) Arquivos que você edita

- `vagas.txt`: copie o texto bruto das vagas, separadas por `-----------------------------`. Pode ser tanto em português quanto em inglês.
- `.github/skills/cv-base/SKILL.md`: base de experiência do candidato (fonte de verdade)
- `.github/skills/contexto/SKILL.md`: regras adicionais pessoais

## 3) Fluxo com o agente para gerar CV/CL

Antes de começar pela primeira vez, dê uma olá para o Sebastian! Ele vai te perguntar alguns dados pessoais importantes seus para colocar no currículo.
Você pode pedir o agente para atualizar esse dados a qualquer momento.
No fim ele vai te pedir para preencher o seu [CV base](.github/skills/cv-base/SKILL.md).

Após isso:

1. Peça para processar as vagas e gerar os fits.
2. Reveja os fits no dashboard `http://localhost:3001/index.html`. Olhe a descrição da vaga e os gaps para ver se estão coerentes. Caso não estejam, você pode pedir correções
   - Você pode e deve pedir para remover as vagas em que o seu score está muito baixo.
3. Feito a revisão dos fits, peça para gerar os CVs/CLs. Você pode pedir para gerar somente um dos dois pelo numero da vaga.
Exemplo: 1) CV; 2) CL; 3) CV e CL.
4. Reveja os CVs/CLs no dashboard `http://localhost:3001/index.html`. Veja o que foi gerado e se está coerente. Caso queira ajustes, peça para corrigir o CV/CL da vaga específica.
5. Para baixar o CV/CL, existe um botão no canto inferior direito da tela **Baixar PDF**

Após autorização, os botões de CV/CL da vaga são liberados no dashboard.

## 4) CV genêrico

Em Algumas plataformas de vagas, é necessário subir um CV genérico para depois aplicar para as vagas. O Sebastian pode te ajudar a gerar esse CV genérico baseado no seu CV base e contexto.
Basta pedir "gere um CV genêrico" que ele vai gerar 2, um português e um inglês.

## 5) Entrevista

Sebastian também pode te ajudar a se preparar para a entrevista de uma vaga específica. Ele vai analisar os requisitos e gerar perguntas e respostas para você praticar.

Para isso, informe o número da vaga e peça a entrevista.
<br> Exemplo: `Entrevista para a vaga 2`

Ou você pode colar a vaga no chat com o agente e pedir para gerar a entrevista.
<br> Exemplo: `Entrevista para a vaga abaixo: [texto da vaga]`

O resultado da entrevista é gerado no arquivo `insights.md` para você revisar.

## 6) Pós uso

Você pode limpar os arquivos do `vagas.txt` e recomeçar outro bloco de vagas ou apenas adicionar mais vagas.
Sugiro que limpe o arquivo depois que não precisar mais gerar os CVs/CLs para aquelas vagas. 
É interessante guardar os CVs e CLs dentro de uma pasta para quando for chamado para uma entrevista, você saiba qual CV/CL a empresa recebeu.

## 7) Solução rápida de problemas

- **Botão PDF falha:** confirme se `npm start` está rodando na porta `3001`.
- **CV/CL bloqueado:** a vaga ainda não foi autorizada.

<div align="center">
   <img src="assets/papel%20de%20parede.jpg" alt="Sebastian wallpaper" width="100%" />
</div>