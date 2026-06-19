// CVs genéricos — não direcionados a nenhuma vaga específica
// Renderizados via src/pages/cv.html?job=generico e src/pages/cv.html?job=generico-en
/** @typedef {import('../../../src/interfaces/job-data').DataCV} DataCV */
/** @type DataCV[] */
export const CV_FIXTURE = [
  {
    id: "generico",
    empresa: "CV Genérico",
    vaga: "Arquiteto de Soluções",
    lang: "pt",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "Belo Horizonte - MG",
      titulo: "Arquiteto de Soluções Sênior",
      subtitulo: "AWS | Azure | Kubernetes | Microserviços | Python",
      resumo: "Arquiteta de soluções com <strong>15 anos</strong> de experiência em desenvolvimento e arquitetura de sistemas de alta complexidade. Como <strong>Arquiteta Sênior</strong> na InnovaLabs, defini padrões de microserviços e estratégias de migração cloud para clientes Fortune 1000, liderei modernização de legado e reduzi time-to-market em 45%. Antes, atuei como <strong>Tech Lead</strong> em fintech processando R$ 50M/mês, reduzindo latência crítica de pagamentos de 2.5s para 450ms. Forte em <strong>arquitetura distribuída</strong>, governança de dados, mentoria técnica e design de sistemas orientado a eventos para alta disponibilidade.",
      experiencias: [
        {
          cargo: "Arquiteto de Soluções Sênior",
          empresa: "InnovaLabs",
          url: "",
          inicio: "Janeiro 2022",
          fim: "Atual",
          stack: "AWS | Azure | Kubernetes | Microserviços | Event-Driven Architecture",
          bullets: [
            "Arquitetei soluções de alta complexidade para clientes <strong>Fortune 1000</strong>, definindo padrões de microserviços, governança de dados e estratégias de migração multi-cloud entre AWS e Azure com redução de custos de 30%.",
            "Liderei programa de modernização de sistemas legados, reduzindo <strong>time-to-market</strong> em 45% através de padronização de processos, automação de deploy com GitLab CI/CD e adoção de práticas de DevOps em equipes distribuídas.",
            "Mentoria de 8 arquitetos e implementação de governance framework que reduziu riscos de compliance em 60%, com revisões de arquitetura, critérios de qualidade definidos e treinamentos mensais.",
            "Projetei sistema de eventos distribuído com Apache Kafka processando 100k mensagens por segundo, garantindo tolerância a falhas e entrega garantida em pipeline de dados para analytics em tempo real."
          ]
        },
        {
          cargo: "Tech Lead - Backend",
          empresa: "VelocityPay",
          url: "",
          inicio: "Junho 2019",
          fim: "Dezembro 2021",
          stack: "Java | Spring Boot | Kafka | Redis | Docker",
          bullets: [
            "Liderei equipe de <strong>6 engenheiros backend</strong>, redesenhando arquitetura de processamento de pagamentos de monolito para microsserviços event-driven com comunicação assíncrona via Kafka.",
            "Reduzi latência de processamento de pagamentos de 2.5s para <strong>450ms</strong> com otimização de queries N+1, cache distribuído com Redis e implementação de circuit breaker pattern no fluxo de cobrança.",
            "Implementei event sourcing para auditoria de transações financeiras, aumentando throughput em 200% e garantindo rastreabilidade completa de cada operação no sistema de pagamento.",
            "Estabeleci práticas de code review e testes automatizados com cobertura de 85%, reduzindo bugs em produção em 60% e melhorando estabilidade do time de entrega contínua."
          ]
        },
        {
          cargo: "Engenheiro de Software Pleno",
          empresa: "DataFlow Systems",
          url: "",
          inicio: "Novembro 2016",
          fim: "Maio 2019",
          stack: "Python | Apache Spark | Hadoop | AWS S3",
          bullets: [
            "Redesenhei plataforma de ETL processando <strong>10TB de dados diariamente</strong> com pipelines paralelos em Apache Spark, garantindo qualidade e consistência dos dados em produção.",
            "Desenvolvi library interna de validação de dados reutilizada por 4 times, reduzindo custos de infraestrutura em 40% e acelerando desenvolvimento de novos pipelines analíticos.",
            "Atuei em integração de fontes de dados heterogêneas, mapeando schemas, transformando dados para consumo de dashboards analíticos em tempo real e documentando processos de ETL."
          ]
        }
      ],
      skills: [
        "Domain-Driven Design",
        "Microserviços",
        "CQRS / Event Sourcing",
        "Python",
        "Java",
        "Go",
        "AWS",
        "Azure",
        "Kubernetes",
        "Terraform",
        "Apache Kafka",
        "PostgreSQL",
        "Observabilidade (Prometheus, Grafana)",
        "System Design"
      ],
      projetos: [
        {
          nome: "Platform de Monitoramento Open Source",
          url: "https://github.com/marina-oliveira/monitoring-stack",
          stack: "Python | Prometheus | Grafana | Docker | GitHub Actions",
          periodo: "2018 - 2020",
          descricao: "Stack de observabilidade open source para aplicações distribuídas, desenvolvida para simplificar o monitoramento de métricas em ambientes multi-serviço. Mais de 200 stars no GitHub, com comunidade ativa e contribuidores de 5 países, consolidada como referência em observabilidade para equipes de plataforma que adotam Prometheus e Grafana."
        },
        {
          nome: "SaaS de Análise de Performance de APIs",
          url: "",
          stack: "Python | AWS Lambda | DynamoDB | React | TypeScript",
          periodo: "2021 - Atual",
          descricao: "MVP pessoal para análise em tempo real de performance de APIs, construído com arquitetura serverless na AWS. Cobre todo o ciclo do produto, desde autenticação de usuários até dashboards de métricas e alertas proativos com Lambda e DynamoDB, aplicando padrões de SaaS escalável, multi-tenant e custo-eficiente aprendidos na prática como Arquiteta Sênior."
        }
      ],
      educacao: [
        {
          curso: "Mestrado em Ciência da Computação",
          inst: "UFMG",
          periodo: "2010 - 2012",
          stack: "Distributed Systems | Algorithms | C++ | Java"
        },
        {
          curso: "Bacharelado em Ciência da Computação",
          inst: "PUC Minas",
          periodo: "2008 - 2012",
          stack: "Java | C | Banco de Dados | Estruturas de Dados"
        }
      ],
      certificados: [
        { nome: "AWS Certified Solutions Architect - Professional", url: "", periodo: "2021" },
        { nome: "Certified Kubernetes Administrator (CKA)", url: "", periodo: "2020" },
        { nome: "Microsoft Certified: Azure Solutions Architect Expert", url: "", periodo: "2021" }
      ],
      idiomas: [
        "Inglês - C1",
        "Espanhol - B1"
      ]
    }
  },

  {
    id: "generico-en",
    empresa: "Generic CV",
    vaga: "Solutions Architect",
    lang: "en",
    tipos: ["cv"],
    cv: {
      authorized: true,
      local: "Belo Horizonte - Brazil",
      titulo: "Senior Solutions Architect",
      subtitulo: "AWS | Azure | Kubernetes | Microservices | Python",
      resumo: "Solutions architect with <strong>15 years</strong> of experience in development and high-complexity systems architecture. As <strong>Senior Architect</strong> at InnovaLabs, I defined microservices standards and cloud migration strategies for Fortune 1000 clients, led legacy modernization and cut time-to-market by 45%. Previously I served as <strong>Tech Lead</strong> at a fintech processing $10M/month, reducing critical payment latency from 2.5s to 450ms. Strong in <strong>distributed architecture</strong>, data governance, technical mentorship and event-driven system design for high availability.",
      experiencias: [
        {
          cargo: "Senior Solutions Architect",
          empresa: "InnovaLabs",
          url: "",
          inicio: "January 2022",
          fim: "Present",
          stack: "AWS | Azure | Kubernetes | Microservices | Event-Driven Architecture",
          bullets: [
            "Architected high-complexity solutions for <strong>Fortune 1000</strong> clients, defining microservices standards, data governance and multi-cloud migration strategies between AWS and Azure with 30% cost reduction.",
            "Led legacy systems modernization program, reducing <strong>time-to-market</strong> by 45% through process standardization, GitLab CI/CD deployment automation and DevOps adoption across distributed teams.",
            "Mentored 8 architects and implemented a governance framework that cut compliance risk by 60%, with architecture reviews, defined quality criteria and monthly training sessions.",
            "Designed a distributed event system with Apache Kafka processing 100k messages per second, ensuring fault tolerance and guaranteed delivery in data pipelines for real-time analytics."
          ]
        },
        {
          cargo: "Tech Lead - Backend",
          empresa: "VelocityPay",
          url: "",
          inicio: "June 2019",
          fim: "December 2021",
          stack: "Java | Spring Boot | Kafka | Redis | Docker",
          bullets: [
            "Led a team of <strong>6 backend engineers</strong>, redesigning payment processing architecture from monolith to event-driven microservices with asynchronous Kafka communication.",
            "Reduced payment processing latency from 2.5s to <strong>450ms</strong> through N+1 query optimization, distributed caching with Redis and circuit breaker pattern implementation in billing flow.",
            "Implemented event sourcing for financial transaction auditing, increasing throughput by 200% and ensuring full traceability of every operation in the payment system.",
            "Established code review practices and automated testing with 85% coverage, reducing production bugs by 60% and improving continuous delivery team stability."
          ]
        },
        {
          cargo: "Mid-level Software Engineer",
          empresa: "DataFlow Systems",
          url: "",
          inicio: "November 2016",
          fim: "May 2019",
          stack: "Python | Apache Spark | Hadoop | AWS S3",
          bullets: [
            "Redesigned ETL platform processing <strong>10TB of data daily</strong> with parallel pipelines in Apache Spark, ensuring data quality and consistency across all production sources.",
            "Built an internal data validation library reused by 4 teams, cutting infrastructure costs by 40% and accelerating development of new analytics data pipelines.",
            "Handled integration of heterogeneous data sources, mapping schemas, transforming data for real-time analytics dashboards and documenting ETL processes for onboarding new team members."
          ]
        }
      ],
      skills: [
        "Domain-Driven Design",
        "Microservices",
        "CQRS / Event Sourcing",
        "Python",
        "Java",
        "Go",
        "AWS",
        "Azure",
        "Kubernetes",
        "Terraform",
        "Apache Kafka",
        "PostgreSQL",
        "Observability (Prometheus, Grafana)",
        "System Design"
      ],
      projetos: [
        {
          nome: "Open Source Monitoring Platform",
          url: "https://github.com/marina-oliveira/monitoring-stack",
          stack: "Python | Prometheus | Grafana | Docker | GitHub Actions",
          periodo: "2018 - 2020",
          descricao: "Open source observability stack for distributed applications, built to simplify metrics monitoring across multi-service environments. Over 200 GitHub stars with an active community of contributors from 5 countries, established as a go-to reference for platform engineering teams adopting Prometheus and Grafana in production."
        },
        {
          nome: "API Performance Analytics SaaS",
          url: "",
          stack: "Python | AWS Lambda | DynamoDB | React | TypeScript",
          periodo: "2021 - Present",
          descricao: "Personal SaaS MVP for real-time API performance analysis, built with serverless architecture on AWS. Covers the full product cycle - user authentication, metrics dashboards and proactive alerts with Lambda and DynamoDB - applying scalable, multi-tenant and cost-efficient SaaS patterns learned in practice as a Senior Architect."
        }
      ],
      educacao: [
        {
          curso: "Master's in Computer Science",
          inst: "UFMG",
          periodo: "2010 - 2012",
          stack: "Distributed Systems | Algorithms | C++ | Java"
        },
        {
          curso: "Bachelor's in Computer Science",
          inst: "PUC Minas",
          periodo: "2008 - 2012",
          stack: "Java | C | Databases | Data Structures"
        }
      ],
      certificados: [
        { nome: "AWS Certified Solutions Architect - Professional", url: "", periodo: "2021" },
        { nome: "Certified Kubernetes Administrator (CKA)", url: "", periodo: "2020" },
        { nome: "Microsoft Certified: Azure Solutions Architect Expert", url: "", periodo: "2021" }
      ],
      idiomas: [
        "Portuguese - Native",
        "English - C1",
        "Spanish - B1"
      ]
    }
  },
];
