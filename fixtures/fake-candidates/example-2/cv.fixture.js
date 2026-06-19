// CVs genéricos — não direcionados a nenhuma vaga específica
// Renderizados via src/pages/cv.html?job=generico e src/pages/cv.html?job=generico-en
/** @typedef {import('../../../src/interfaces/job-data').DataCV} DataCV */
/** @type DataCV[] */
export const CV_FIXTURE = [
  {
    id: "generico",
    empresa: "CV Genérico",
    vaga: "Desenvolvedor de Software",
    lang: "pt",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "São Paulo - SP",
      titulo: "Desenvolvedor de Software Júnior",
      subtitulo: "JavaScript | React | Node.js | PostgreSQL",
      resumo: "Desenvolvedor júnior com <strong>1 ano</strong> de experiência profissional em desenvolvimento web full stack na TechStart Brasil. Desenvolvo features em <strong>React</strong> no frontend e <strong>Node.js/Express</strong> no backend, participando ativamente de code reviews com desenvolvedores sêniors. Recém-formado em Engenharia de Software pela Universidade Federal de São Paulo, com projetos acadêmicos envolvendo APIs REST e aplicações CRUD. Forte disposição para aprendizado contínuo, trabalho em equipe e crescimento técnico em ambiente colaborativo e ágil.",
      experiencias: [
        {
          cargo: "Desenvolvedor de Software Júnior",
          empresa: "TechStart Brasil",
          url: "",
          inicio: "Março 2025",
          fim: "Atual",
          stack: "JavaScript | React | Node.js | Express | PostgreSQL",
          bullets: [
            "Desenvolvi <strong>5 features de dashboard</strong> desde o onboarding, em SaaS de gestão de projetos para agências, incluindo filtros dinâmicos, gráficos interativos e relatórios exportáveis em PDF.",
            "Participei ativamente de <strong>code reviews</strong> com desenvolvedores sêniors, aprendendo boas práticas de testing, git workflow com branches feature e padronização de código com ESLint.",
            "Contribuí na resolução de <strong>12 bugs</strong> e refatoração de código legado sob mentoria, em 2 releases de produto com foco em estabilidade e performance.",
            "Implementei testes unitários com <strong>Jest</strong> para novas features, alcançando cobertura de 70% no módulo de relatórios e reduzindo regressões em sprints seguintes."
          ]
        },
        {
          cargo: "Estagiário de Desenvolvimento Web",
          empresa: "WebAgil Solutions",
          url: "",
          inicio: "Agosto 2024",
          fim: "Fevereiro 2025",
          stack: "HTML | CSS | JavaScript | PHP | MySQL",
          bullets: [
            "Desenvolvi <strong>8 landing pages</strong> responsivas e formulários de captação de leads para 3 clientes, garantindo compatibilidade entre navegadores e dispositivos móveis com testes manuais.",
            "Auxiliei na manutenção de sistemas PHP legados, corrigindo <strong>15+ bugs</strong> e implementando pequenas funcionalidades sob supervisão de desenvolvedores plenos.",
            "Participei de reuniões de planejamento <strong>Sprint</strong>, aprendendo metodologias ágeis, organização de backlog com Jira e estimativas de story points."
          ]
        },
        {
          cargo: "Desenvolvedor Freelancer",
          empresa: "Autônomo",
          url: "",
          inicio: "Janeiro 2024",
          fim: "Julho 2024",
          stack: "JavaScript | React | Node.js | MongoDB",
          bullets: [
            "Desenvolvi <strong>3 sistemas</strong> web para pequenas empresas locais, incluindo sistema de agendamento, loja virtual e painel administrativo com autenticação JWT.",
            "Atuei em todo o ciclo de desenvolvimento, desde levantamento de requisitos com cliente até deploy em produção na Vercel e Railway, gerenciando expectativas e prazos.",
            "Implementei integração com APIs de pagamento e notificações por e-mail, garantindo fluxo completo de compra para os clientes dos sistemas desenvolvidos."
          ]
        }
      ],
      skills: [
        "React",
        "JavaScript ES6+",
        "HTML/CSS",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Git",
        "Jest",
        "REST APIs"
      ],
      educacao: [
        {
          curso: "Bacharelado em Engenharia de Software",
          inst: "Universidade Federal de São Paulo",
          periodo: "2021 - 2025",
          stack: "Java | Python | C | SQL | Estruturas de Dados"
        }
      ],
      certificados: [
        { nome: "AWS Certified Cloud Practitioner", url: "", periodo: "2024" }
      ],
      idiomas: [
        "Inglês - B1"
      ]
    }
  },

  {
    id: "generico-en",
    empresa: "Generic CV",
    vaga: "Software Developer",
    lang: "en",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "São Paulo - Brazil",
      titulo: "Junior Software Developer",
      subtitulo: "JavaScript | React | Node.js | PostgreSQL",
      resumo: "Junior developer with <strong>1 year</strong> of professional experience in full stack web development at TechStart Brasil. I build features in <strong>React</strong> on the frontend and <strong>Node.js/Express</strong> on the backend, actively participating in code reviews with senior developers. Recently graduated in Software Engineering from the Universidade Federal de São Paulo, with academic projects involving REST APIs and CRUD applications. Strong drive for continuous learning, teamwork and technical growth in a collaborative agile environment.",
      experiencias: [
        {
          cargo: "Junior Software Developer",
          empresa: "TechStart Brasil",
          url: "",
          inicio: "March 2025",
          fim: "Present",
          stack: "JavaScript | React | Node.js | Express | PostgreSQL",
          bullets: [
            "Built <strong>5 dashboard features</strong> since onboarding, for a project management SaaS for agencies, including dynamic filters, interactive charts and PDF exportable reports.",
            "Actively participated in <strong>code reviews</strong> with senior developers, learning testing best practices, git workflow with feature branches and ESLint code standardization.",
            "Contributed to fixing <strong>12 bugs</strong> and legacy code refactoring under mentorship, across 2 product releases focused on stability and performance.",
            "Implemented unit tests with <strong>Jest</strong> for new features, reaching 70% coverage in the reports module and reducing regressions in following sprints."
          ]
        },
        {
          cargo: "Web Development Intern",
          empresa: "WebAgil Solutions",
          url: "",
          inicio: "August 2024",
          fim: "February 2025",
          stack: "HTML | CSS | JavaScript | PHP | MySQL",
          bullets: [
            "Built <strong>8 responsive landing pages</strong> and lead capture forms for 3 clients, ensuring cross-browser and mobile device compatibility with manual testing.",
            "Assisted in maintaining legacy PHP systems, fixing <strong>15+ bugs</strong> and implementing small features under mid-level developer supervision.",
            "Participated in <strong>Sprint</strong> planning meetings, learning agile methodologies, Jira backlog organization and story point estimation."
          ]
        },
        {
          cargo: "Freelance Developer",
          empresa: "Self-employed",
          url: "",
          inicio: "January 2024",
          fim: "July 2024",
          stack: "JavaScript | React | Node.js | MongoDB",
          bullets: [
            "Built <strong>3 web systems</strong> for small local businesses, including scheduling system, e-commerce store and admin panel with JWT authentication.",
            "Handled the full development cycle from client requirements gathering to production deployment on Vercel and Railway, managing expectations and deadlines.",
            "Implemented payment API integration and email notifications, ensuring complete purchase flow for the end users of the developed systems."
          ]
        }
      ],
      skills: [
        "React",
        "JavaScript ES6+",
        "HTML/CSS",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Git",
        "Jest",
        "REST APIs"
      ],
      educacao: [
        {
          curso: "Bachelor's in Software Engineering",
          inst: "Universidade Federal de São Paulo",
          periodo: "2021 - 2025",
          stack: "Java | Python | C | SQL | Data Structures"
        }
      ],
      certificados: [
        { nome: "AWS Certified Cloud Practitioner", url: "", periodo: "2024" }
      ],
      idiomas: [
        "Portuguese - Native",
        "English - B1"
      ]
    }
  },
];
