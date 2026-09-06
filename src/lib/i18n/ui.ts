import type { Locale } from "./config";

/**
 * Textos de interface (chrome) do site público.
 * Os CONTEÚDOS vêm da API (campos _pt/_en); aqui só vive o que é UI.
 */
export interface UiStrings {
  dirName: string;
  brandLine1: string;
  brandLine2: string;
  nav: { home: string; projects: string; about: string; investor: string; contact: string };
  search: { placeholder: string; aria: string };
  theme: { toDark: string; toLight: string };
  menu: { open: string; close: string };
  footer: {
    aboutText: string;
    certificate: string;
    quickLinks: string;
    links: { allProjects: string; about: string; opportunities: string; requestInfo: string; govPortal: string };
    contacts: string;
    social: string;
    openDataTitle: string;
    openDataText: string;
    rights: string;
    privacy: string;
    terms: string;
    accessibility: string;
  };
  cookies: {
    text: string;
    policy: string;
    necessary: string;
    necessaryDesc: string;
    analytics: string;
    analyticsDesc: string;
    accept: string;
    reject: string;
    save: string;
    settings: string;
  };
  common: {
    viewAll: string;
    readMore: string;
    seeDetails: string;
    backToListing: string;
    notFound: string;
    loading: string;
    retry: string;
    apiErrorTitle: string;
    apiErrorText: string;
    networkErrorTitle: string;
    empty: string;
    clearFilters: string;
    print: string;
    share: string;
    copyLink: string;
    linkCopied: string;
    home: string;
    breadcrumbSep: string;
    projectsCount: string;
  };
  home: {
    heroBadge: string;
    heroTitle1: string;
    heroTitleAccent: string;
    heroTitle2: string;
    heroSubtitle: string;
    ctaProjects: string;
    ctaContact: string;
    statsTitle: string;
    statsSubtitle: string;
    featuredTitle: string;
    featuredSubtitle: string;
    executionLabel: string;
    updatesTitle: string;
    investorBadge: string;
    investorTitle: string;
    investorText: string;
    investorCta: string;
    alertTitle: string;
    alertText: string;
    alertCta: string;
    prevSlide: string;
    nextSlide: string;
    goToSlide: string;
    municipalitySuffix: string;
  };
  projects: {
    title: string;
    searchPlaceholder: string;
    filter: string;
    filters: string;
    apply: string;
    clear: string;
    byMunicipality: string;
    bySector: string;
    byStatus: string;
    all: string;
    sortBy: string;
    sortRecent: string;
    sortValue: string;
    sortProgress: string;
    sortName: string;
    gridAria: string;
    listAria: string;
    empty: string;
    showing: string;
    perPage: string;
    execLabel: string;
    fabAria: string;
    favoritesAdd: string;
    favoritesRemove: string;
    favoritesToastAdd: string;
    favoritesToastRemove: string;
    municipalitySuffix: string;
  };
  detail: {
    description: string;
    objectives: string;
    timeline: string;
    documents: string;
    location: string;
    mapNote: string;
    mapLink: string;
    summary: string;
    totalValue: string;
    valueUsd: string;
    financing: string;
    municipality: string;
    executor: string;
    supervisor: string;
    startDate: string;
    endDate: string;
    progressLabel: string;
    managerContact: string;
    requestInfo: string;
    related: string;
    galleryOf: string;
    imageAlt: string;
    stages: [string, string, string];
    stageStart: string;
    stageEnd: string;
    noImage: string;
    notFoundTitle: string;
  };
  about: {
    title: string;
    subtitle: string;
    messageLabel: string;
    missionVisionValues: string;
    mission: string;
    vision: string;
    values: string;
    orgTitle: string;
    timelineTitle: string;
    videoTitle: string;
    watchVideo: string;
    videoConsent: string;
    videoConsentBtn: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    fallbackTitle: string;
    fallbackSubtitle: string;
  };
  investor: {
    title: string;
    subtitle: string;
    indicatorsTitle: string;
    opportunitiesTitle: string;
    requestStudy: string;
    testimonialsTitle: string;
    documentsTitle: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    fallbackCorridor: string;
    noOpportunities: string;
    viewAll: string;
    viewAllOpportunities: string;
    searchPlaceholder: string;
    opportunityBadge: string;
    filterByType: string;
    filterBySector: string;
    sortRecent: string;
    sortName: string;
    sortPopular: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    phone: string;
    phonePh: string;
    company: string;
    companyPh: string;
    interest: string;
    interestOptions: string[];
    municipality: string;
    municipalityAll: string;
    project: string;
    projectAny: string;
    projectPlaceholder: string;
    message: string;
    messagePh: string;
    captcha: string;
    captchaPh: string;
    privacy: string;
    privacyLink: string;
    submit: string;
    sending: string;
    successTitle: string;
    successText: string;
    successCta: string;
    errorTitle: string;
    sidebarTitle: string;
    phoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    hoursLabel: string;
    mapNote: string;
    mapTitle: string;
    responseTime: string;
    responseValue: string;
    responseNote: string;
    required: string;
    invalidEmail: string;
    wrongCaptcha: string;
    mustAccept: string;
    selectOne: string;
    serverError: string;
  };
  privacy: { title: string; intro: string };
  notFound: { title: string; text: string; cta: string };
}

const pt: UiStrings = {
  dirName: "ltr",
  brandLine1: "Governo Provincial",
  brandLine2: "de Benguela",
  nav: { home: "Início", projects: "Projetos", about: "Sobre a Gestão", investor: "Investidor", contact: "Contacto" },
  search: { placeholder: "Pesquisar projectos...", aria: "Pesquisar" },
  theme: { toDark: "Alternar modo escuro", toLight: "Alternar modo claro" },
  menu: { open: "Menu", close: "Fechar menu" },
  footer: {
    aboutText:
      "Portal de Projectos de Benguela. BENGUELA DE MUNICÍPIO A MUNICÍPIO RUMO AO DESENVOLVIMENTO.",
    certificate: "Certificado de Transparência 2025",
    quickLinks: "Links Rápidos",
    links: {
      allProjects: "Todos os Projetos",
      about: "Sobre a Gestão",
      opportunities: "Oportunidades de Investimento",
      requestInfo: "Solicitar Informações",
      govPortal: "Portal do Governo",
    },
    contacts: "Contactos",
    social: "Redes Sociais",
    openDataTitle: "Dados Abertos",
    openDataText: "Informação pública disponível sob licença Creative Commons.",
    rights: "© {year} Governo Provincial de Benguela. Todos os direitos reservados.",
    privacy: "Política de Privacidade",
    terms: "Termos de Uso",
    accessibility: "Acessibilidade",
  },
  cookies: {
    text: "Este site utiliza cookies para melhorar a experiência de navegação e análise estatística.",
    policy: "Política de Privacidade",
    necessary: "Necessários",
    necessaryDesc: "Sessão, tema e preferências. Não podem ser desativados.",
    analytics: "Analytics",
    analyticsDesc: "Medição de audiência anónima (Google Analytics), se configurado.",
    accept: "Aceitar todos",
    reject: "Só necessários",
    save: "Guardar preferências",
    settings: "Ver e gerir as definições",
  },
  common: {
    viewAll: "Ver todos",
    readMore: "Leia mais →",
    seeDetails: "Ver detalhes",
    backToListing: "Voltar à listagem",
    notFound: "Não encontrado",
    loading: "A carregar...",
    retry: "Tentar novamente",
    apiErrorTitle: "Não foi possível obter dados",
    apiErrorText: "O serviço de dados não respondeu. Tente novamente em instantes.",
    networkErrorTitle: "Sem ligação ao servidor",
    empty: "Sem resultados",
    clearFilters: "Limpar filtros",
    print: "Imprimir",
    share: "Partilhar",
    copyLink: "Copiar link",
    linkCopied: "Link copiado!",
    home: "Início",
    breadcrumbSep: "›",
    projectsCount: "{n} projetos",
  },
  home: {
    heroBadge: "+{n} Projetos em Execução",
    heroTitle1: "Acompanhe os Projetos que",
    heroTitleAccent: " Transformam",
    heroTitle2: " Benguela",
    heroSubtitle:
      "Transparência, desenvolvimento e oportunidades de investimento nos municípios da Província de Benguela.",
    ctaProjects: "Explorar Projetos",
    ctaContact: "Solicitar Informações",
    statsTitle: "Números da Província",
    statsSubtitle: "Investimento público em destaque",
    featuredTitle: "Projetos Estruturantes",
    featuredSubtitle: "Conheça as principais obras em curso",
    executionLabel: "Execução física",
    updatesTitle: "Últimas Atualizações",
    investorBadge: "Oportunidades",
    investorTitle: "Oportunidades para Investidores",
    investorText:
      "O Corredor do Lobito é a nova fronteira de oportunidades em Angola. Parcerias Público-Privadas em infraestrutura, agroindústria, logística e turismo aguardam investidores comprometidos com o desenvolvimento.",
    investorCta: "Quero Investir em Benguela",
    alertTitle: "Fique Informado",
    alertText: "Tem interesse num projeto, edital ou oportunidade de investimento? Fale connosco.",
    alertCta: "Solicitar Informações",
    prevSlide: "Projeto anterior",
    nextSlide: "Próximo projeto",
    goToSlide: "Ir para slide {n}",
    municipalitySuffix: "{m}, Benguela",
  },
  projects: {
    title: "Todos os Projetos",
    searchPlaceholder: "Pesquisar por nome, localização ou setor...",
    filter: "Filtrar",
    filters: "Filtros",
    apply: "Aplicar",
    clear: "Limpar",
    byMunicipality: "Por Município",
    bySector: "Por Setor",
    byStatus: "Por Status",
    all: "Todos",
    sortBy: "Ordenar",
    sortRecent: "Mais recentes",
    sortValue: "Maior valor",
    sortProgress: "Mais próximo da conclusão",
    sortName: "Nome A-Z",
    gridAria: "Modo grade",
    listAria: "Modo lista",
    empty: "Nenhum projeto encontrado com os filtros selecionados.",
    showing: "Mostrando {from}–{to} de {total} projectos",
    perPage: "{n} por página",
    execLabel: "Execução",
    fabAria: "Solicitar informações",
    favoritesAdd: "Adicionar aos favoritos",
    favoritesRemove: "Remover dos favoritos",
    favoritesToastAdd: "Projeto adicionado aos favoritos",
    favoritesToastRemove: "Projeto removido dos favoritos",
    municipalitySuffix: "{m}",
  },
  detail: {
    description: "Descrição",
    objectives: "Objetivos",
    timeline: "Linha do Tempo",
    documents: "Documentos",
    location: "Localização",
    mapNote: "Mapa integrado disponível em produção",
    mapLink: "Ver no OpenStreetMap",
    summary: "Resumo Executivo",
    totalValue: "Valor Total",
    valueUsd: "Equivalente USD",
    financing: "Fonte de Financiamento",
    municipality: "Município",
    executor: "Empresa Executora",
    supervisor: "Fiscalizador",
    startDate: "Início",
    endDate: "Conclusão Prevista",
    progressLabel: "Execução Física",
    managerContact: "Contacto do Gestor",
    requestInfo: "Solicitar Informações",
    related: "Projetos Relacionados",
    galleryOf: "Imagem {i} de {n} do projeto",
    imageAlt: "Imagem {i} do projeto {title}",
    stages: ["Etapa 1 — Fundações e estrutura", "Etapa 2 — Execução principal", "Etapa 3 — Acabamentos"],
    stageStart: "Início da Obra",
    stageEnd: "Conclusão Prevista",
    noImage: "Sem imagem disponível",
    notFoundTitle: "Projeto não encontrado",
  },
  about: {
    title: "Sobre o Governo Provincial de Benguela",
    subtitle: "Compromisso com a transparência e o desenvolvimento sustentável",
    messageLabel: "Mensagem do Governador",
    missionVisionValues: "Missão, Visão e Valores",
    mission: "Missão",
    vision: "Visão",
    values: "Valores",
    orgTitle: "Estrutura Organizacional",
    timelineTitle: "Principais Realizações",
    videoTitle: "Vídeo Institucional",
    watchVideo: "Reproduzir vídeo institucional",
    videoConsent: "O vídeo é fornecido por um serviço externo e só é carregado com o seu consentimento.",
    videoConsentBtn: "Aceitar e carregar vídeo",
    ctaTitle: "Conheça os nossos projectos",
    ctaText: "Explore todos os projectos em curso nos municípios de Benguela.",
    ctaButton: "Ver Projetos",
    fallbackTitle: "Sobre a Gestão",
    fallbackSubtitle: "O conteúdo institucional ainda não está publicado.",
  },
  investor: {
    title: "Invista em Benguela",
    subtitle:
      "O Corredor do Lobito é a nova fronteira de oportunidades em Angola. Conecte-se ao mercado africano mais dinâmico.",
    indicatorsTitle: "Indicadores da Província",
    opportunitiesTitle: "Oportunidades de Investimento",
    requestStudy: "Solicitar Estudo de Viabilidade",
    testimonialsTitle: "Investidores em Benguela",
    documentsTitle: "Documentos para Investidores",
    ctaTitle: "Pronto para investir em Benguela?",
    ctaText: "O nosso Gabinete de Investimentos está disponível para apoiar o seu projeto do início ao fim.",
    ctaButton: "Fale com o Gabinete de Investimentos",
    fallbackCorridor: "Corredor do Lobito",
    noOpportunities: "Nenhuma oportunidade de investimento disponível no momento.",
    viewAll: "Ver todas oportunidades",
    viewAllOpportunities: "Ver todas oportunidades de investimento",
    searchPlaceholder: "Buscar oportunidades...",
    opportunityBadge: "Oportunidade",
    filterByType: "Tipo de oportunidade",
    filterBySector: "Setor",
    sortRecent: "Mais recentes",
    sortName: "Por nome",
    sortPopular: "Mais populares",
  },
  contact: {
    title: "Solicite Informações sobre os Projetos",
    subtitle:
      "Investidores, fornecedores e cidadãos podem preencher o formulário para obter esclarecimentos.",
    name: "Nome Completo",
    namePh: "Ex: Ana Ferreira",
    email: "E-mail",
    emailPh: "nome@exemplo.com",
    phone: "Telefone",
    phonePh: "+244 9xx xxx xxx",
    company: "Empresa / Instituição",
    companyPh: "Nome da empresa (opcional)",
    interest: "Tipo de Interesse",
    interestOptions: ["Investidor", "Fornecedor", "Cidadão", "Jornalista", "Outro"],
    municipality: "Município de Interesse",
    municipalityAll: "Todos os municípios",
    project: "Projeto de Interesse",
    projectAny: "Todos os projectos",
    projectPlaceholder: "Selecione um projeto...",
    message: "Mensagem / Pergunta",
    messagePh: "Descreva detalhadamente a sua questão ou pedido de informação...",
    captcha: "Verificação de segurança",
    captchaPh: "?",
    privacy: "Li e aceito os",
    privacyLink: "termos de política de privacidade",
    submit: "Enviar Solicitação",
    sending: "A enviar...",
    successTitle: "Solicitação Enviada!",
    successText: "A sua solicitação foi enviada com sucesso. Entraremos em contacto em até 48h úteis.",
    successCta: "Voltar aos Projetos",
    sidebarTitle: "Outras Formas de Contacto",
    phoneLabel: "Telefone Geral",
    emailLabel: "E-mail Institucional",
    addressLabel: "Endereço",
    hoursLabel: "Horário",
    mapNote: "Mapa disponível em produção",
    mapTitle: "Governo Provincial de Benguela",
    responseTime: "Tempo de resposta",
    responseValue: "48h úteis",
    responseNote: "Dias úteis, 8h–17h",
    required: "Campo obrigatório",
    invalidEmail: "E-mail inválido",
    wrongCaptcha: "Resposta incorreta",
    mustAccept: "Aceite os termos para continuar",
    selectOne: "Selecione uma opção",
    serverError: "Não foi possível enviar o pedido. Tente novamente.",
    errorTitle: "O formulário não pode ser enviado",
  },
  privacy: {
    title: "Política de Privacidade e Cookies",
    intro: "Como o Portal de Projectos de Benguela trata os seus dados.",
  },
  notFound: {
    title: "Página não encontrada",
    text: "O endereço acessado não existe ou o conteúdo foi movido.",
    cta: "Voltar ao Início",
  },
};

const en: UiStrings = {
  dirName: "ltr",
  brandLine1: "Provincial Government",
  brandLine2: "of Benguela",
  nav: { home: "Home", projects: "Projects", about: "About", investor: "Investor", contact: "Contact" },
  search: { placeholder: "Search projects...", aria: "Search" },
  theme: { toDark: "Switch to dark mode", toLight: "Switch to light mode" },
  menu: { open: "Menu", close: "Close menu" },
  footer: {
    aboutText:
      "Benguela Projects Portal. BENGUELA FROM MUNICIPALITY TO MUNICIPALITY TOWARDS DEVELOPMENT.",
    certificate: "Transparency Certificate 2026",
    quickLinks: "Quick Links",
    links: {
      allProjects: "All Projects",
      about: "About the Administration",
      opportunities: "Investment Opportunities",
      requestInfo: "Request Information",
      govPortal: "Government Portal",
    },
    contacts: "Contacts",
    social: "Social Media",
    openDataTitle: "Open Data",
    openDataText: "Public information available under a Creative Commons license.",
    rights: "© {year} Provincial Government of Benguela. All rights reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    accessibility: "Accessibility",
  },
  cookies: {
    text: "This site uses cookies to improve browsing experience and statistical analysis.",
    policy: "Privacy Policy",
    necessary: "Necessary",
    necessaryDesc: "Session, theme and preferences. Cannot be disabled.",
    analytics: "Analytics",
    analyticsDesc: "Anonymous audience measurement (Google Analytics), if configured.",
    accept: "Accept all",
    reject: "Necessary only",
    save: "Save preferences",
    settings: "View and manage settings",
  },
  common: {
    viewAll: "View all",
    readMore: "Read more →",
    seeDetails: "See details",
    backToListing: "Back to listing",
    notFound: "Not found",
    loading: "Loading...",
    retry: "Try again",
    apiErrorTitle: "Data could not be loaded",
    apiErrorText: "The data service did not respond. Please try again in a moment.",
    networkErrorTitle: "No connection to server",
    empty: "No results",
    clearFilters: "Clear filters",
    print: "Print",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied!",
    home: "Home",
    breadcrumbSep: "›",
    projectsCount: "{n} projects",
  },
  home: {
    heroBadge: "+{n} Projects Underway",
    heroTitle1: "Follow the Projects that",
    heroTitleAccent: " Transform",
    heroTitle2: " Benguela",
    heroSubtitle:
      "Transparency, development and investment opportunities across the municipalities of Benguela Province.",
    ctaProjects: "Explore Projects",
    ctaContact: "Request Information",
    statsTitle: "Provincial Numbers",
    statsSubtitle: "Public investment highlights",
    featuredTitle: "Flagship Projects",
    featuredSubtitle: "Get to know the main works in progress",
    executionLabel: "Physical execution",
    updatesTitle: "Latest Updates",
    investorBadge: "Opportunities",
    investorTitle: "Opportunities for Investors",
    investorText:
      "The Lobito Corridor is Angola's new frontier of opportunity. Public-Private Partnerships in infrastructure, agro-industry, logistics and tourism await investors committed to development.",
    investorCta: "I Want to Invest in Benguela",
    alertTitle: "Stay Informed",
    alertText: "Interested in a project, tender or investment opportunity? Get in touch.",
    alertCta: "Request Information",
    prevSlide: "Previous project",
    nextSlide: "Next project",
    goToSlide: "Go to slide {n}",
    municipalitySuffix: "{m}, Benguela",
  },
  projects: {
    title: "All Projects",
    searchPlaceholder: "Search by name, location or sector...",
    filter: "Filter",
    filters: "Filters",
    apply: "Apply",
    clear: "Clear",
    byMunicipality: "By Municipality",
    bySector: "By Sector",
    byStatus: "By Status",
    all: "All",
    sortBy: "Sort",
    sortRecent: "Most recent",
    sortValue: "Highest value",
    sortProgress: "Closest to completion",
    sortName: "Name A-Z",
    gridAria: "Grid view",
    listAria: "List view",
    empty: "No projects found with the selected filters.",
    showing: "Showing {from}–{to} of {total} projects",
    perPage: "{n} per page",
    execLabel: "Execution",
    fabAria: "Request information",
    favoritesAdd: "Add to favorites",
    favoritesRemove: "Remove from favorites",
    favoritesToastAdd: "Project added to favorites",
    favoritesToastRemove: "Project removed from favorites",
    municipalitySuffix: "{m}",
  },
  detail: {
    description: "Description",
    objectives: "Objectives",
    timeline: "Timeline",
    documents: "Documents",
    location: "Location",
    mapNote: "Integrated map available in production",
    mapLink: "View on OpenStreetMap",
    summary: "Executive Summary",
    totalValue: "Total Value",
    valueUsd: "USD Equivalent",
    financing: "Financing Source",
    municipality: "Municipality",
    executor: "Contractor",
    supervisor: "Supervisor",
    startDate: "Start",
    endDate: "Expected Completion",
    progressLabel: "Physical Execution",
    managerContact: "Manager Contact",
    requestInfo: "Request Information",
    related: "Related Projects",
    galleryOf: "Image {i} of {n}",
    imageAlt: "Image {i} of project {title}",
    stages: ["Stage 1 — Foundations and structure", "Stage 2 — Main execution", "Stage 3 — Finishing"],
    stageStart: "Work Start",
    stageEnd: "Expected Completion",
    noImage: "No image available",
    notFoundTitle: "Project not found",
  },
  about: {
    title: "About the Provincial Government of Benguela",
    subtitle: "Committed to transparency and sustainable development",
    messageLabel: "Governor's Message",
    missionVisionValues: "Mission, Vision and Values",
    mission: "Mission",
    vision: "Vision",
    values: "Values",
    orgTitle: "Organizational Structure",
    timelineTitle: "Key Achievements",
    videoTitle: "Institutional Video",
    watchVideo: "Play institutional video",
    videoConsent: "The video is served by an external provider and is only loaded with your consent.",
    videoConsentBtn: "Accept and load video",
    ctaTitle: "Get to know our projects",
    ctaText: "Explore all the projects underway across the municipalities of Benguela.",
    ctaButton: "View Projects",
    fallbackTitle: "About the Administration",
    fallbackSubtitle: "Institutional content is not published yet.",
  },
  investor: {
    title: "Invest in Benguela",
    subtitle:
      "The Lobito Corridor is Angola's new frontier of opportunity. Connect to the most dynamic African market.",
    indicatorsTitle: "Provincial Indicators",
    opportunitiesTitle: "Investment Opportunities",
    requestStudy: "Request a Feasibility Study",
    testimonialsTitle: "Investors in Benguela",
    documentsTitle: "Documents for Investors",
    ctaTitle: "Ready to invest in Benguela?",
    ctaText: "Our Investment Office is available to support your project from start to finish.",
    ctaButton: "Talk to the Investment Office",
    fallbackCorridor: "Lobito Corridor",
    noOpportunities: "No investment opportunities available at this time.",
    viewAll: "View all opportunities",
    viewAllOpportunities: "View all investment opportunities",
    searchPlaceholder: "Buscar oportunidades...",
    opportunityBadge: "Opportunities",
    filterByType: "Type",
    filterBySector: "Setor",
    sortRecent: "More recentes",
    sortName: "By name",
    sortPopular: "Most populars",
  },
  contact: {
    title: "Request Information about the Projects",
    subtitle: "Investors, suppliers and citizens can fill in the form to get clarifications.",
    name: "Full Name",
    namePh: "e.g. Ana Ferreira",
    email: "E-mail",
    emailPh: "name@example.com",
    phone: "Phone",
    phonePh: "+244 9xx xxx xxx",
    company: "Company / Institution",
    companyPh: "Company name (optional)",
    interest: "Type of Interest",
    interestOptions: ["Investor", "Supplier", "Citizen", "Journalist", "Other"],
    municipality: "Municipality of Interest",
    municipalityAll: "All municipalities",
    project: "Project of Interest",
    projectAny: "All projects",
    projectPlaceholder: "Select a project...",
    message: "Message / Question",
    messagePh: "Describe your question or information request in detail...",
    captcha: "Security check",
    captchaPh: "?",
    privacy: "I have read and accept the",
    privacyLink: "privacy policy terms",
    submit: "Send Request",
    sending: "Sending...",
    successTitle: "Request Sent!",
    successText: "Your request was sent successfully. We will get back to you within 48 business hours.",
    successCta: "Back to Projects",
    sidebarTitle: "Other Ways to Contact Us",
    phoneLabel: "General Phone",
    emailLabel: "Institutional E-mail",
    addressLabel: "Address",
    hoursLabel: "Opening Hours",
    mapNote: "Map available in production",
    mapTitle: "Provincial Government of Benguela",
    responseTime: "Response time",
    responseValue: "48 business hours",
    responseNote: "Business days, 8am–5pm",
    required: "Required field",
    invalidEmail: "Invalid e-mail",
    wrongCaptcha: "Wrong answer",
    mustAccept: "Accept the terms to continue",
    selectOne: "Select an option",
    serverError: "The request could not be sent. Please try again.",
    errorTitle: "The form could not be submitted",
  },
  privacy: {
    title: "Privacy & Cookie Policy",
    intro: "How the Benguela Projects Portal handles your data.",
  },
  notFound: {
    title: "Page not found",
    text: "The address you accessed does not exist or the content was moved.",
    cta: "Back to Home",
  },
};

export const DICTIONARIES: Record<Locale, UiStrings> = { pt, en };

export function getUi(locale: Locale): UiStrings {
  return DICTIONARIES[locale] ?? DICTIONARIES.pt;
}

/** Interpolação simples: t("{n} projetos", { n: 12 }) */
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
