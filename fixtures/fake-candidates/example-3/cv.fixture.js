// CVs genéricos — não direcionados a nenhuma vaga específica
// Renderizados via src/pages/cv.html?job=generico e src/pages/cv.html?job=generico-en
/** @typedef {import('../../../src/interfaces/job-data').DataCV} DataCV */
/** @type DataCV[] */
export const CV_FIXTURE = [
  {
    id: "generico",
    empresa: "CV Genérico",
    vaga: "Desenvolvedor Backend",
    lang: "pt",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "Curitiba - PR",
      titulo: "Desenvolvedor Backend Sênior",
      subtitulo: "Node.js | Python | PostgreSQL | AWS",
      resumo: "Desenvolvedor com <strong>5 anos</strong> de experiência em desenvolvimento web, atuando desde sites corporativos até APIs de alta performance. Como <strong>Desenvolvedor Sênior</strong> na Solutions Lab, arquitetei APIs que suportam 500 req/s para soluções mobile-first de varejo em 3 países, mentorei 2 desenvolvedores juniores e reduzi latência em 40%. Trajetória construída em agências e consultorias, com forte experiência full stack em React, Vue e Node.js e crescente interesse em <strong>arquitetura de microsserviços</strong> e sistemas distribuídos na nuvem.",
      experiencias: [
        {
          cargo: "Desenvolvedor Backend Sênior",
          empresa: "Solutions Lab",
          url: "",
          inicio: "Agosto 2023",
          fim: "Atual",
          stack: "Node.js | Python | FastAPI | PostgreSQL | AWS",
          bullets: [
            "Arquitetei <strong>3 APIs</strong> que suportam 500 req/s para soluções mobile-first de varejo em 3 países, utilizando Node.js e Python com arquitetura de microsserviços e fila de mensagens com RabbitMQ.",
            "Reduzi latência em <strong>40%</strong> e custo de infraestrutura em 25% através de otimizações de queries N+1, cache com Redis e implementação de CDN para assets estáticos na AWS CloudFront.",
            "Mentoria de <strong>2 desenvolvedores juniores</strong> em boas práticas de backend, arquitetura de microsserviços e testes automatizados com cobertura acima de 80% usando Jest e Supertest.",
            "Implementei pipeline de <strong>CI/CD</strong> com GitHub Actions, automatizando testes, builds e deploys em ambientes de staging e produção na AWS com zero downtime."
          ]
        },
        {
          cargo: "Desenvolvedor Full Stack",
          empresa: "ByteWeb Studio",
          url: "",
          inicio: "Novembro 2021",
          fim: "Julho 2023",
          stack: "React | Vue | Node.js | Python | PostgreSQL",
          bullets: [
            "Entreguei <strong>15+ projetos</strong> de e-commerce e sites corporativos em 20 meses, atuando em todo o stack desde o levantamento de requisitos até o deploy em produção.",
            "Reduzi bugs em produção em <strong>40%</strong> através de automação de testes com Jest e Cypress, mantendo 95% de feedback positivo de clientes.",
            "Desenvolvi APIs REST documentadas com <strong>Swagger</strong>, facilitando integração com times de frontend e parceiros externos em 3 projetos diferentes."
          ]
        },
        {
          cargo: "Desenvolvedor Web Júnior",
          empresa: "Agência Digital Nova Era",
          url: "",
          inicio: "Março 2020",
          fim: "Outubro 2021",
          stack: "HTML | CSS | JavaScript | PHP | WordPress",
          bullets: [
            "Desenvolvi <strong>25+ sites</strong> responsivos com WordPress e landing pages estáticas para clientes diversos, garantindo performance e compatibilidade cross-browser em todos os projetos.",
            "Reduzi tempo de desenvolvimento em <strong>20%</strong> através de automação de processos repetitivos e criação de templates reutilizáveis para novos projetos.",
            "Atuei em suporte técnico e manutenção de sites em produção, resolvendo issues de performance e segurança de forma proativa e documentando soluções."
          ]
        }
      ],
      skills: [
        "Node.js (Express)",
        "Python (FastAPI)",
        "React",
        "Vue",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Docker",
        "AWS (EC2, S3, RDS)",
        "Git",
        "REST APIs"
      ],
      projetos: [
        {
          nome: "API de Rastreamento de Pedidos para E-commerce",
          url: "https://github.com/felipe-mendes/order-tracking-api",
          stack: "Node.js | Express | PostgreSQL | Redis | Docker",
          periodo: "2023 - Atual",
          descricao: "API REST para rastreamento de pedidos em tempo real, com sistema de webhooks para notificações automáticas de status. Utilizada por 2 clientes reais adquiridos durante atuação na ByteWeb Studio, com código aberto no GitHub. Implementa autenticação JWT, filas assíncronas com Bull e cache Redis para performance em picos de volume de pedidos."
        },
        {
          nome: "CLI de Migração de Banco de Dados",
          url: "https://github.com/felipe-mendes/db-migrate-cli",
          stack: "Python | SQLAlchemy | Click | PostgreSQL | MySQL",
          periodo: "2022 - 2023",
          descricao: "Ferramenta de linha de comando em Python para automatizar migrações de MySQL para PostgreSQL, com validação de schema e rollback automático. Desenvolvida para uso interno na ByteWeb Studio, acelerando migrações em 3 projetos e eliminando erros manuais. Publicada no PyPI com documentação completa e testes de integração."
        }
      ],
      educacao: [
        { curso: "Ensino Médio", inst: "Colégio Estadual do Paraná", periodo: "2017 - 2019", stack: "" }
      ],
      certificados: [
        { nome: "AWS Certified Cloud Practitioner", url: "", periodo: "2023" },
        { nome: "Node.js Application Developer - OpenJS Foundation", url: "", periodo: "2023" },
        { nome: "Docker Certified Associate", url: "", periodo: "2024" },
        { nome: "PostgreSQL Associate Certification - EDB", url: "", periodo: "2022" },
        { nome: "The Complete JavaScript Course - Udemy", url: "", periodo: "2021" }
      ],
      idiomas: [
        "Inglês - B2"
      ]
    }
  },

  {
    id: "generico-en",
    empresa: "Generic CV",
    vaga: "Backend Developer",
    lang: "en",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "Curitiba - Brazil",
      titulo: "Senior Backend Developer",
      subtitulo: "Node.js | Python | PostgreSQL | AWS",
      resumo: "Developer with <strong>5 years</strong> of experience in web development, ranging from corporate websites to high-performance APIs. As <strong>Senior Developer</strong> at Solutions Lab, I architected APIs supporting 500 req/s for mobile-first retail solutions across 3 countries, mentored 2 junior developers and reduced latency by 40%. Background built across agencies and consultancies, with strong full stack experience in React, Vue and Node.js and growing interest in <strong>microservices architecture</strong> and distributed cloud systems.",
      experiencias: [
        {
          cargo: "Senior Backend Developer",
          empresa: "Solutions Lab",
          url: "",
          inicio: "August 2023",
          fim: "Present",
          stack: "Node.js | Python | FastAPI | PostgreSQL | AWS",
          bullets: [
            "Architected <strong>3 APIs</strong> supporting 500 req/s for mobile-first retail solutions across 3 countries, using Node.js and Python with microservices architecture and RabbitMQ message queue.",
            "Reduced latency by <strong>40%</strong> and infrastructure costs by 25% through N+1 query optimization, Redis caching and AWS CloudFront CDN implementation for static assets.",
            "Mentored <strong>2 junior developers</strong> on backend best practices, microservices architecture and automated testing with coverage above 80% using Jest and Supertest.",
            "Implemented <strong>CI/CD</strong> pipeline with GitHub Actions, automating tests, builds and deployments across staging and production environments on AWS with zero downtime."
          ]
        },
        {
          cargo: "Full Stack Developer",
          empresa: "ByteWeb Studio",
          url: "",
          inicio: "November 2021",
          fim: "July 2023",
          stack: "React | Vue | Node.js | Python | PostgreSQL",
          bullets: [
            "Delivered <strong>15+ projects</strong> for e-commerce and corporate sites in 20 months, working across the full stack from requirements gathering to production deployment.",
            "Reduced production bugs by <strong>40%</strong> through test automation with Jest and Cypress, maintaining 95% positive client feedback.",
            "Built REST APIs documented with <strong>Swagger</strong>, facilitating integration with frontend teams and external partners across 3 different projects."
          ]
        },
        {
          cargo: "Junior Web Developer",
          empresa: "Agência Digital Nova Era",
          url: "",
          inicio: "March 2020",
          fim: "October 2021",
          stack: "HTML | CSS | JavaScript | PHP | WordPress",
          bullets: [
            "Built <strong>25+ responsive websites</strong> with WordPress and static landing pages for various clients, ensuring performance and cross-browser compatibility across all projects.",
            "Cut development time by <strong>20%</strong> through automation of repetitive processes and creation of reusable templates for new projects.",
            "Handled technical support and production site maintenance, proactively resolving performance and security issues and documenting solutions."
          ]
        }
      ],
      skills: [
        "Node.js (Express)",
        "Python (FastAPI)",
        "React",
        "Vue",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Docker",
        "AWS (EC2, S3, RDS)",
        "Git",
        "REST APIs"
      ],
      projetos: [
        {
          nome: "E-commerce Order Tracking API",
          url: "https://github.com/felipe-mendes/order-tracking-api",
          stack: "Node.js | Express | PostgreSQL | Redis | Docker",
          periodo: "2023 - Present",
          descricao: "REST API for real-time order tracking with a webhook system for automatic status notifications. Used by 2 real clients acquired during time at ByteWeb Studio, open source on GitHub. Implements JWT authentication, async queues with Bull and Redis caching for performance during high-volume order processing periods."
        },
        {
          nome: "Database Migration CLI",
          url: "https://github.com/felipe-mendes/db-migrate-cli",
          stack: "Python | SQLAlchemy | Click | PostgreSQL | MySQL",
          periodo: "2022 - 2023",
          descricao: "Command-line tool in Python to automate MySQL to PostgreSQL database migrations with schema validation and automatic rollback. Built for internal use at ByteWeb Studio, speeding up migrations across 3 projects and eliminating manual errors. Published on PyPI with full documentation and integration tests."
        }
      ],
      educacao: [
        { curso: "High School Diploma", inst: "Colégio Estadual do Paraná", periodo: "2017 - 2019", stack: "" }
      ],
      certificados: [
        { nome: "AWS Certified Cloud Practitioner", url: "", periodo: "2023" },
        { nome: "Node.js Application Developer - OpenJS Foundation", url: "", periodo: "2023" },
        { nome: "Docker Certified Associate", url: "", periodo: "2024" },
        { nome: "PostgreSQL Associate Certification - EDB", url: "", periodo: "2022" },
        { nome: "The Complete JavaScript Course - Udemy", url: "", periodo: "2021" }
      ],
      idiomas: [
        "Portuguese - Native",
        "English - B2"
      ]
    }
  },
];
