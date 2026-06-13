<div align="center">
   <img src="assets/logo.png" alt="Sebastian Logo" height="200" />
</div>

# Sebastian - O seu mordomo orquestrador de Currículo ATS

O agente de IA capaz de processar vagas em lote, fazer o fit com a vaga, gerar currículo (Curriculum Vitae - CV) e carta de apresentação (Cover Letter - CL) por vaga seguindos critérios de ATS, com dashboard local, seja para uma vaga no Brasil ou na gringa.
O dashboard exibe informações importantes sobre cada vaga, incluindo: modalidade de trabalho (Remoto, Presencial ou Híbrida), tipo de contratação (CLT, PJ ou CLT/PJ), score de fit, pontos positivos e gaps.

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

## 2) Informações que você precisa fornecer

### Dados pessoais
Antes de começar pela primeira vez, dê uma olá para o Sebastian! Ele vai te perguntar alguns dados pessoais importantes seus para colocar no currículo. Você pode pedir o agente para atualizar esses dados a qualquer momento.

### [ai/skills/cv-base/SKILL.md](ai/skills/cv-base/SKILL.md)
Base de experiência do candidato (fonte de verdade).
Aqui você vai criar uma espécie de grande currículo com todas as suas experiências, habilidades, educação e idiomas. O Sebastian vai usar esse CV base para extrair as informações relevantes para cada vaga e gerar um CV personalizado.
Não economize detalhes aqui, pois quanto mais completo for o CV base, melhor serão os CVs personalizados gerados para cada vaga.
<br>
Dicas:
1. Use o [CV base template](ai/skills/cv-base/SKILL.md.example) como base. Lá há sugestões de seções e subseções, mas você pode adicionar ou remover a medida que achar necessário.
2. Fale detalhes de cada projeto/feature que você fez no seu trabalho, de preferência as mais longas e complexas, informando:
   - O que foi o projeto/feature (ex: Aplicação de Cache usando Redis)
   - Em quanto tempo levou para ser feito 
   - Quais foram as tecnologias utilizadas 
   - Quais foram os resultados obtidos (Ex: aumentou em 20% o número de vendas ou reduziu em 30% o tempo de resposta do sistema)
   - Que posição você exercia nesse projeto/feature
   - Como era o dia a dia do projeto/feature (ex: reuniões diárias, planejamento semanal, Kanban, Scrum)
3. Fale não apenas das suas experiências profissionais, mas também de projetos pessoais e acadêmicos, trabalhos voluntários, monitorias, TCCs, programa de iniciação científica
4. Fale um pouco sobre você: suas soft skills, o que você prefere fazer e trabalhar, se gosta mais de presencial/hibrído/remoto, se tem disponibilidade para viajar ou se mudar
5. Você pode citar também conceitos que você conhece, mas nunca praticou ou tem pouca prática. Ex: sitemap, SSR, TDD, SOLID.
6. Site integrações que você fez como: gateway de pagamento, serviços de nuvem, distribuidores, sistemas do governo.

### [ai/skills/contexto/SKILL.md](ai/skills/contexto/SKILL.md)
Aqui são você pode dar contexto para o Sebastian do que preencher em algumas situações. 
<br>
Exemplos:
1. Apesar de eu ter trabalhado profissionalmente apenas com Backend, eu tenho bastante conhecimento e prática com Frontend, especialmente em React, então pode preencher experiência com React mesmo que não tenha sido profissional.
2. Apesar de eu ter trabalhado com Java, foi um período muito curto e não me sinto seguro trabalhando com essa stack por conta própria, portanto qualquer vaga que o exigir experiência sólida, coloque como um gap.
3. Não informar o exato número de vendas que a empresa teve, isso é um dado sigiloso e só lhe informei para te dar um contexto de que o sistema era grande
4. Quero apenas vagas remotas. Se forem híbridas ou presenciais, informar isso como gap e colocar score 0

Obs: Com o tempo, a medida que for usando o Sebastian e pedindo correções, ele pode lhe sugerir informações novas a serem preenchidas no contexto. A medida que você aceitar as sugestões, Sebastian vai adicioná-los automaticamente.

### [Vagas](vagas.txt)
Copie o texto bruto das vagas que deseja se candidatar separadas por `-----------------------------`. Pode ser tanto em português quanto em inglês. O Sebastian vai identificar o idioma automaticamente.

**Importante:** Antes de cada vaga, cole o link direto da vaga. O Sebastian vai usar esse link no dashboard para facilitar o acesso à vaga original.

Formato:
```
https://www.linkedin.com/jobs/view/123456789

[Texto da vaga aqui...]
-----------------------------

https://www.linkedin.com/jobs/view/987654321

[Próxima vaga...]
```

<br>
Você pode usar o arquivo [vagas.txt.example](vagas.txt.example) como base.

## 3) Fluxo com o agente para gerar CV/CL

1. Peça para processar as vagas. No meio do processo, o Sebastian pode te fazer perguntas de sobre os requisitos da vaga para ter certeza se você tem ou não uma habilidade específica, ou alguma outra dúvida. Responda às perguntas para que ele possa ter um melhor entendimento do seu perfil e gerar um fit mais preciso. Baseado nas respostas, o Sebastian pode sugerir alterações no seu CV ou no contexto.
2. Aṕos os fits serem gerados, acesse-os no dashboard `http://localhost:3001/index.html`. Olhe a descrição da vaga e os gaps para ver se estão coerentes. Caso não estejam, você pode pedir correções
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

- Se quiser processar um novo lote de vagas do zero, basta limpar as vagas antigas `vagas.txt` e preencher com as novas e dizer "reiniciar processo" que o Sebastian vai reiniciar o processo.
  - Se você quiser processar apenas adicionar novas vagas, basta adicionar novas vagas no arquivo `vagas.txt` e pedir para processar as demais vagas. 
- É interessante guardar os CVs e CLs dentro de uma pasta para quando for chamado para uma entrevista, você saiba qual CV/CL a empresa recebeu.

## 7) Solução rápida de problemas

- **Botão PDF falha:** confirme se `npm start` está rodando na porta `3001`.
- **CV/CL bloqueado:** a vaga ainda não foi autorizada.

<div align="center">
   <img src="assets/papel%20de%20parede.jpg" alt="Sebastian wallpaper" width="100%" />
</div>