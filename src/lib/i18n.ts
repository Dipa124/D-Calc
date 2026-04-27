// D-Calc — Internationalization System

export type Locale = 'es' | 'en' | 'zh' | 'eu';

export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  zh: '中文',
  eu: 'Euskera',
};

// Detect locale from browser
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'es';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('eu')) return 'eu';
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('en')) return 'en';
  return 'es';
}

// ─── Translation Keys ───

export interface Translations {
  // App
  appName: string;
  appSubtitle: string;
  appDescription: string;
  
  // Header
  saveProject: string;
  resetProject: string;
  copyPrice: string;
  priceCopied: string;
  priceCopiedDesc: string;
  
  // Summary
  pieces: string;
  time: string;
  weight: string;
  
  // Sections
  saleType: string;
  parameters: string;
  printParameters: string;
  projectPieces: string;
  suggestedPrices: string;
  costBreakdown: string;
  exportSection: string;
  advancedSettings: string;
  showAdvanced: string;
  hideAdvanced: string;
  
  // Actions
  add: string;
  addFirstPiece: string;
  noPiecesYet: string;
  noPiecesDesc: string;
  recordSale: string;
  saleRecorded: string;
  saleRecordedDesc: string;
  projectSaved: string;
  projectUpdated: string;
  errorSaving: string;
  errorRecording: string;
  
  // Sale types
  wholesale: string;
  wholesaleDesc: string;
  retail: string;
  retailDesc: string;
  customSale: string;
  customSaleDesc: string;
  rush: string;
  rushDesc: string;
  customize: string;
  
  // Pricing tiers
  competitive: string;
  competitiveDesc: string;
  standard: string;
  standardDesc: string;
  premium: string;
  premiumDesc: string;
  luxury: string;
  luxuryDesc: string;
  selected: string;
  margin: string;
  
  // Piece form
  pieceName: string;
  filamentColor: string;
  filamentType: string;
  customFilamentName: string;
  weightGrams: string;
  costPerKg: string;
  hours: string;
  minutes: string;
  quantity: string;
  waste: string;
  postProcessing: string;
  laborTime: string;
  finishType: string;
  customFinishDesc: string;
  custom: string;
  
  // Finishing types
  noFinish: string;
  lightSanding: string;
  fullSanding: string;
  primerPaint: string;
  fullPaint: string;
  vaporSmoothing: string;
  epoxyCoating: string;
  customFinish: string;
  free: string;
  perPiece: string;
  
  // Parameters
  printerCost: string;
  printerLifespan: string;
  maintenance: string;
  powerConsumption: string;
  electricityCost: string;
  laborRate: string;
  supervisionRate: string;
  supervisionDesc: string;
  additionalLabor: string;
  additionalLaborDesc: string;
  failureRate: string;
  overhead: string;
  taxRate: string;
  packaging: string;
  shipping: string;
  designTime: string;
  designRate: string;
  printerModel: string;
  selectPrinter: string;
  printerDefaults: string;
  
  // Tooltips
  tooltipPrinterCost: string;
  tooltipLifespan: string;
  tooltipMaintenance: string;
  tooltipPower: string;
  tooltipElectricity: string;
  tooltipLaborRate: string;
  tooltipSupervision: string;
  tooltipAdditionalLabor: string;
  tooltipFailureRate: string;
  tooltipOverhead: string;
  tooltipTaxRate: string;
  tooltipPackaging: string;
  tooltipShipping: string;
  tooltipDesignTime: string;
  tooltipDesignRate: string;
  tooltipPrintWeight: string;
  tooltipFilamentCost: string;
  tooltipPrintTime: string;
  tooltipWaste: string;
  tooltipQuantity: string;
  tooltipPostProcessing: string;
  tooltipLaborTime: string;
  tooltipFinishingType: string;
  tooltipFinishingCost: string;
  tooltipCustomFilament: string;
  tooltipColor: string;
  tooltipFilamentType: string;
  tooltipSaleType: string;
  tooltipCustomMultiplier: string;
  tooltipPrinterModel: string;
  
  // Breakdown
  material: string;
  operation: string;
  profit: string;
  shippingPackage: string;
  materialWithWaste: string;
  printerDepreciation: string;
  electricity: string;
  maintenanceCost: string;
  labor: string;
  finishing: string;
  failureRisk: string;
  subtotal: string;
  overheadCost: string;
  baseCost: string;
  profitPerUnit: string;
  taxPerUnit: string;
  totalPerUnit: string;
  totalForQty: string;
  totalMaterial: string;
  totalBase: string;
  totalProfitLabel: string;
  priceBeforeTax: string;
  priceWithIva: string;
  taxIncluded: string;
  projectTotal: string;
  
  // Export
  producerReport: string;
  buyerTicket: string;
  producerReportTitle: string;
  buyerTicketTitle: string;
  detailedReport: string;
  printParametersLabel: string;
  subpieceBreakdown: string;
  projectSummary: string;
  budget3d: string;
  validFor30: string;
  generatedBy: string;
  unitPrice: string;
  packagingAndShipping: string;
  
  // Auth
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  nameOptional: string;
  nameRequired: string;
  enter: string;
  createAccount: string;
  noAccount: string;
  hasAccount: string;
  logout: string;
  dashboard: string;
  loginDesc: string;
  registerDesc: string;
  minPassword: string;
  minPasswordBoth: string;
  emailInvalid: string;
  fieldRequired: string;
  incorrectCredentials: string;
  loginError: string;
  registerError: string;
  saveYourProjects: string;
  saveProjectsDesc: string;
  
  // Currency
  currency: string;
  selectCurrency: string;
  
  // Language
  language: string;
  selectLanguage: string;
  
  // Footer
  footerText: string;
  footerDisclaimer: string;
  
  // Dashboard
  totalRevenue: string;
  totalSales: string;
  avgPrice: string;
  recentSales: string;
  monthlyBreakdown: string;
  salesByTier: string;
  
  // Print time
  printTime: string;

  // Navigation
  navHome: string;
  navCalculator: string;
  navDashboard: string;

  // Home page
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  featureCalc: string;
  featureCalcDesc: string;
  featureTiers: string;
  featureTiersDesc: string;
  featureProfiles: string;
  featureProfilesDesc: string;
  featureProjects: string;
  featureProjectsDesc: string;
  featureExport: string;
  featureExportDesc: string;
  featureCurrency: string;
  featureCurrencyDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Printer profiles
  printerProfiles: string;
  createProfile: string;
  editProfile: string;
  deleteProfile: string;
  profileName: string;
  profileModel: string;
  profilePrice: string;
  profileLifespanYears: string;
  profilePower: string;
  profileFailureRate: string;
  profileMaintenance: string;
  profileDefault: string;
  profileGeneric: string;
  noProfilesYet: string;
  noProfilesDesc: string;
  createFirstProfile: string;

  // Dashboard page
  myProjects: string;
  noProjectsYet: string;
  loadProject: string;
  deleteProject: string;
  apiInfo: string;
  apiKeyDesc: string;
  activeProjects: string;

  // Auth page
  welcomeBack: string;
  createYourAccount: string;
  orContinueWith: string;

  // Logistics & Business
  logisticsBusiness: string;
  tooltipLogisticsBusiness: string;
  pieceLaborRate: string;
  tooltipPieceLaborRate: string;
  pieceDesignTime: string;
  tooltipPieceDesignTime: string;
  pieceDesignRate: string;
  tooltipPieceDesignRate: string;
  signInToCreateProfiles: string;
  designCost: string;

  // Home page extended
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  featuresTitle: string;
  featuresSubtitle: string;
  howItWorksTitle: string;
  ctaTitlePrefix: string;
  ctaTitleHighlight: string;
  ctaTitleSuffix: string;
  ctaSubtitle: string;
  noRegistrationRequired: string;
  registerBenefits: string;
  designPerPiece: string;
  laborPerPiece: string;
  shareReport: string;
  shareReportDesc: string;
  accountSettings: string;
  deleteAccount: string;
  changeData: string;
  loginToCreateProfile: string;

  // Settings
  theme: string;

  // Post-processing
  postProcessType: string;
  tooltipPostProcessType: string;
  postProcessRate: string;
  tooltipPostProcessRate: string;

  // Extra expenses
  extraExpenses: string;
  addExpense: string;
  expenseDescription: string;
  expensePrice: string;
  removeExpense: string;

  // Amortization
  dailyUsageHours: string;
  tooltipDailyUsage: string;
  amortizationMonths: string;
  tooltipAmortization: string;
  monthlyMaintenance: string;
  tooltipMonthlyMaintenance: string;
  additionalInitialCost: string;
  tooltipAdditionalCost: string;
  bufferFactor: string;
  tooltipBufferFactor: string;
  commissionPct: string;
  tooltipCommissionPct: string;
  commissionFixed: string;
  tooltipCommissionFixed: string;
  priceRounding: string;
  tooltipPriceRounding: string;
  minimumOrder: string;
  tooltipMinimumOrder: string;
  amortizationPerHour: string;

  // Price rounding options
  noRounding: string;
  round99: string;
  round50: string;
  round100: string;

  // Post-process types
  postProcessNone: string;
  postProcessSupportRemoval: string;
  postProcessSanding: string;
  postProcessPainting: string;
  postProcessAssembly: string;
  postProcessGluing: string;
  postProcessPolishing: string;
  postProcessCustom: string;

  // Export
  downloadPDF: string;

  // Cost display
  costPerHourLabel: string;
  extraExpensesLabel: string;

  // Share
  shareProducer: string;
  shareInvoice: string;

  // Toast messages
  shareLinkCopied: string;
  errorSharing: string;

  // Monthly expenses
  monthlyExpenses: string;
  addMonthlyExpense: string;
  monthlyAmount: string;
  tooltipMonthlyExpenses: string;
}

const translations: Record<Locale, Translations> = {
  es: {
    appName: 'D-Calc',
    appSubtitle: 'Calculadora profesional de impresión 3D',
    appDescription: 'Calculadora profesional de costes para impresión 3D FDM. Estima precios de filamento, tiempo, energía y mano de obra con precisión industrial. Gratuita y sin registro.',
    saveProject: 'Guardar proyecto',
    resetProject: 'Restablecer proyecto',
    copyPrice: 'Copiar precio',
    priceCopied: 'Precio copiado',
    priceCopiedDesc: 'copiado al portapapeles',
    pieces: 'Piezas',
    time: 'Tiempo',
    weight: 'Peso',
    saleType: 'Tipo de venta',
    parameters: 'Parámetros',
    printParameters: 'Parámetros de impresión',
    projectPieces: 'Piezas del proyecto',
    suggestedPrices: 'Precios sugeridos',
    costBreakdown: 'Desglose',
    exportSection: 'Exportar',
    advancedSettings: 'Ajustes avanzados',
    showAdvanced: 'Mostrar ajustes avanzados',
    hideAdvanced: 'Ocultar ajustes avanzados',
    add: 'Añadir',
    addFirstPiece: 'Añadir primera pieza',
    noPiecesYet: 'Sin piezas todavía',
    noPiecesDesc: 'Añade la primera pieza para calcular el precio de impresión 3D.',
    recordSale: 'Registrar venta',
    saleRecorded: 'Venta registrada',
    saleRecordedDesc: '— registrado correctamente',
    projectSaved: 'Proyecto guardado',
    projectUpdated: 'Proyecto actualizado',
    errorSaving: 'No se pudo guardar el proyecto',
    errorRecording: 'No se pudo registrar la venta',
    wholesale: 'Mayorista',
    wholesaleDesc: 'Venta al por mayor',
    retail: 'Minorista',
    retailDesc: 'Venta al por menor',
    customSale: 'Personalizado',
    customSaleDesc: 'Multiplicador personalizado',
    rush: 'Urgente',
    rushDesc: 'Pedido urgente con prioridad',
    customize: 'Personalizar',
    competitive: 'Competitivo',
    competitiveDesc: 'Precio agresivo para competir',
    standard: 'Estándar',
    standardDesc: 'Equilibrio entre beneficio y competitividad',
    premium: 'Premium',
    premiumDesc: 'Posicionamiento de calidad',
    luxury: 'Lujo',
    luxuryDesc: 'Servicio exclusivo y acabado premium',
    selected: 'Seleccionado',
    margin: 'Margen',
    pieceName: 'Nombre de la pieza',
    filamentColor: 'Color del filamento',
    filamentType: 'Tipo de filamento',
    customFilamentName: 'Nombre del filamento',
    weightGrams: 'Peso (g)',
    costPerKg: 'Coste (€/kg)',
    hours: 'Horas',
    minutes: 'Minutos',
    quantity: 'Cantidad',
    waste: 'Desperdicio (%)',
    postProcessing: 'Postprocesado (min)',
    laborTime: 'Mano obra (min)',
    finishType: 'Tipo de acabado',
    customFinishDesc: 'Descripción del acabado',
    custom: 'Personalizado',
    noFinish: 'Sin acabado',
    lightSanding: 'Lijado ligero',
    fullSanding: 'Lijado completo',
    primerPaint: 'Imprimación y pintura',
    fullPaint: 'Pintura completa',
    vaporSmoothing: 'Alisado por vapor',
    epoxyCoating: 'Recubrimiento epoxi',
    customFinish: 'Acabado personalizado',
    free: 'Gratis',
    perPiece: '/pieza',
    printerCost: 'Coste impresora',
    printerLifespan: 'Vida útil (h)',
    maintenance: 'Mant. (€/h)',
    powerConsumption: 'Consumo (W)',
    electricityCost: 'Electricidad (€/kWh)',
    laborRate: 'Tarifa mano obra (€/h)',
    supervisionRate: 'Supervisión (€/h)',
    supervisionDesc: 'Tarifa para supervisión de impresión (5% del tiempo de impresión)',
    additionalLabor: 'Labores adicionales (€/h)',
    additionalLaborDesc: 'Tarifa para trabajo manual adicional aparte del postprocesado',
    failureRate: 'Tasa fallo (%)',
    overhead: 'Overhead (%)',
    taxRate: 'IVA (%)',
    packaging: 'Embalaje (€)',
    shipping: 'Envío (€)',
    designTime: 'Diseño (min)',
    designRate: 'Tarifa diseño (€/h)',
    printerModel: 'Modelo de impresora',
    selectPrinter: 'Seleccionar impresora',
    printerDefaults: 'Genérica',
    tooltipPrinterCost: 'Precio de compra de la impresora. Se usa para calcular la depreciación por hora de uso.',
    tooltipLifespan: 'Horas estimadas de vida útil de la impresora antes de necesitar reemplazo.',
    tooltipMaintenance: 'Coste de mantenimiento preventivo y reparaciones por hora de impresión.',
    tooltipPower: 'Consumo eléctrico medio de la impresora durante la impresión en vatios.',
    tooltipElectricity: 'Precio de la electricidad por kilovatio-hora según tu compañía eléctrica.',
    tooltipLaborRate: 'Coste horario de mano de obra para postprocesado y trabajo manual directo.',
    tooltipSupervision: 'Tarifa para supervisión pasiva de la impresión. Se aplica al 5% del tiempo de impresión (revisión periódica).',
    tooltipAdditionalLabor: 'Tarifa para labores adicionales como preparación, montaje, ensamblaje, etc. Se aplica al tiempo de mano de obra que asignes a cada pieza.',
    tooltipFailureRate: 'Porcentaje de probabilidad de fallo en la impresión. Se añade como prima de riesgo.',
    tooltipOverhead: 'Porcentaje de gastos generales (alquiler, software, etc.) sobre el coste base.',
    tooltipTaxRate: 'Tipo impositivo del IVA/IGIC aplicable a la venta.',
    tooltipPackaging: 'Coste fijo de embalaje por proyecto (caja, relleno, cinta, etc.).',
    tooltipShipping: 'Coste de envío por proyecto. Se añade al precio final.',
    tooltipDesignTime: 'Tiempo dedicado al diseño 3D del modelo (si aplica).',
    tooltipDesignRate: 'Tarifa horaria para el tiempo de diseño del modelo.',
    tooltipPrintWeight: 'Peso del filamento necesario para imprimir la pieza, en gramos.',
    tooltipFilamentCost: 'Precio del filamento por kilogramo. Varía según tipo y marca.',
    tooltipPrintTime: 'Tiempo estimado de impresión. Afecta a depreciación, electricidad y mantenimiento.',
    tooltipWaste: 'Porcentaje extra de material para compensar purgas, soportes y fallos.',
    tooltipQuantity: 'Número de unidades idénticas de esta pieza.',
    tooltipPostProcessing: 'Tiempo dedicado al postprocesado: retirar soportes, lijado, pintura, etc.',
    tooltipLaborTime: 'Tiempo de trabajo manual adicional (preparación, montaje, ensamblaje). Independiente del postprocesado y de la supervisión automática.',
    tooltipFinishingType: 'Tipo de acabado aplicado a la pieza tras la impresión.',
    tooltipFinishingCost: 'Coste del acabado por cada unidad de la pieza.',
    tooltipCustomFilament: 'Nombre del filamento personalizado.',
    tooltipColor: 'Color del filamento usado para identificar la pieza visualmente.',
    tooltipFilamentType: 'Tipo de filamento. Determina el precio recomendado por kg.',
    tooltipSaleType: 'Tipo de venta. Afecta al multiplicador de margen: mayorista reduce, urgente aumenta.',
    tooltipCustomMultiplier: 'Multiplicador de margen personalizado. Puedes introducir cualquier valor positivo.',
    tooltipPrinterModel: 'Selecciona tu modelo de impresora para auto-rellenar los parámetros de consumo, vida útil y tasa de fallo.',
    material: 'Material',
    operation: 'Operación',
    profit: 'Beneficio',
    shippingPackage: 'Envío+Emb.',
    materialWithWaste: 'Material (con desperdicio)',
    printerDepreciation: 'Depreciación impresora',
    electricity: 'Electricidad',
    maintenanceCost: 'Mantenimiento',
    labor: 'Mano de obra',
    finishing: 'Acabado',
    failureRisk: 'Riesgo de fallo',
    subtotal: 'Subtotal/unidad',
    overheadCost: 'Overhead/unidad',
    baseCost: 'Coste base/unidad',
    profitPerUnit: 'Beneficio/unidad',
    taxPerUnit: 'IVA/unidad',
    totalPerUnit: 'Total/unidad',
    totalForQty: 'Total ×{qty}',
    totalMaterial: 'Coste total material',
    totalBase: 'Coste base total',
    totalProfitLabel: 'Beneficio total',
    priceBeforeTax: 'Precio sin IVA',
    priceWithIva: 'Precio con IVA',
    taxIncluded: 'IVA incluido',
    projectTotal: 'PRECIO TOTAL DEL PROYECTO',
    producerReport: 'Reporte productor',
    buyerTicket: 'Factura',
    producerReportTitle: 'Reporte detallado del productor',
    buyerTicketTitle: 'Factura de impresión 3D',
    detailedReport: 'Reporte Productor',
    printParametersLabel: 'Parámetros de impresión',
    subpieceBreakdown: 'Desglose por subpieza',
    projectSummary: 'Resumen del proyecto',
    budget3d: 'Presupuesto de impresión 3D',
    validFor30: 'Válido 30 días desde',
    generatedBy: 'Reporte generado por D-Calc',
    unitPrice: 'Precio por unidad',
    packagingAndShipping: 'Embalaje y envío',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Email',
    password: 'Contraseña',
    name: 'Nombre',
    nameOptional: 'Nombre (opcional)',
    nameRequired: 'Nombre',
    enter: 'Entrar',
    createAccount: 'Crear cuenta',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    logout: 'Cerrar sesión',
    dashboard: 'Dashboard',
    loginDesc: 'Accede a tu cuenta para guardar proyectos y ver estadísticas',
    registerDesc: 'Guarda tus proyectos y accede a estadísticas de ventas',
    minPassword: 'Mínimo 6 caracteres',
    minPasswordBoth: 'La contraseña debe tener al menos 6 caracteres',
    emailInvalid: 'Formato de email no válido',
    fieldRequired: 'Este campo es obligatorio',
    incorrectCredentials: 'Email o contraseña incorrectos',
    loginError: 'Error al iniciar sesión',
    registerError: 'Error al crear la cuenta',
    saveYourProjects: 'Guarda tus proyectos',
    saveProjectsDesc: 'Inicia sesión para guardar proyectos, registrar ventas y acceder a estadísticas.',
    currency: 'Moneda',
    selectCurrency: 'Seleccionar moneda',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    footerText: 'D-Calc — Calculadora profesional de impresión 3D FDM',
    footerDisclaimer: 'Los precios son estimaciones basadas en los parámetros introducidos',
    totalRevenue: 'Ingresos totales',
    totalSales: 'Ventas totales',
    avgPrice: 'Precio medio',
    recentSales: 'Ventas recientes',
    monthlyBreakdown: 'Desglose mensual',
    salesByTier: 'Ventas por nivel',
    printTime: 'Tiempo de impresión',
    navHome: 'Inicio',
    navCalculator: 'Calculadora',
    navDashboard: 'Panel',
    heroTitle: 'D-Calc',
    heroSubtitle: 'La calculadora profesional de impresión 3D que necesitas',
    heroCta: 'Empezar a calcular',
    featureCalc: 'Cálculo preciso',
    featureCalcDesc: 'Costes de material, energía, depreciación y mano de obra con precisión industrial',
    featureTiers: '4 niveles de precio',
    featureTiersDesc: 'Competitivo, Estándar, Premium y Lujo con márgenes ajustables',
    featureProfiles: 'Perfiles de impresora',
    featureProfilesDesc: 'Guarda las especificaciones de tus impresoras para reutilización rápida',
    featureProjects: 'Gestión de proyectos',
    featureProjectsDesc: 'Guarda, carga y organiza tus proyectos de impresión 3D',
    featureExport: 'Exportación PDF',
    featureExportDesc: 'Genera reportes de productor y facturas profesionales',
    featureCurrency: 'Multi-moneda',
    featureCurrencyDesc: 'EUR, USD, GBP, CNY y 6 monedas más con detección automática',
    step1Title: 'Configura',
    step1Desc: 'Introduce los parámetros de tu impresora y los costes operativos',
    step2Title: 'Añade piezas',
    step2Desc: 'Define cada pieza con material, tiempo, peso y acabado',
    step3Title: 'Obtén precios',
    step3Desc: 'Elige tu nivel de precio y exporta el presupuesto',
    printerProfiles: 'Perfiles de impresora',
    createProfile: 'Crear perfil',
    editProfile: 'Editar perfil',
    deleteProfile: 'Eliminar perfil',
    profileName: 'Nombre del perfil',
    profileModel: 'Modelo',
    profilePrice: 'Precio de compra',
    profileLifespanYears: 'Vida útil (años)',
    profilePower: 'Consumo (W)',
    profileFailureRate: 'Tasa fallo (%)',
    profileMaintenance: 'Mant. (€/h)',
    profileDefault: 'Perfil por defecto',
    profileGeneric: 'Genérica',
    noProfilesYet: 'Sin perfiles todavía',
    noProfilesDesc: 'Crea tu primer perfil de impresora para reutilizar sus parámetros',
    createFirstProfile: 'Crear primer perfil',
    myProjects: 'Mis proyectos',
    noProjectsYet: 'Sin proyectos guardados',
    loadProject: 'Cargar proyecto',
    deleteProject: 'Eliminar proyecto',
    apiInfo: 'Información API',
    apiKeyDesc: 'Usa la API REST de D-Calc para integrar el cálculo en tus propias aplicaciones',
    activeProjects: 'Proyectos activos',
    welcomeBack: 'Bienvenido de nuevo',
    createYourAccount: 'Crea tu cuenta',
    orContinueWith: 'O continúa con',
    logisticsBusiness: 'Logística y negocio',
    tooltipLogisticsBusiness: 'Impuestos, embalaje, envío y amortización del proyecto.',
    pieceLaborRate: 'Tarifa mano obra (€/h)',
    tooltipPieceLaborRate: 'Coste horario de mano de obra para esta pieza (postprocesado + trabajo manual).',
    pieceDesignTime: 'Diseño (min)',
    tooltipPieceDesignTime: 'Tiempo dedicado al diseño 3D de esta pieza.',
    pieceDesignRate: 'Tarifa diseño (€/h)',
    tooltipPieceDesignRate: 'Tarifa horaria para el tiempo de diseño de esta pieza.',
    signInToCreateProfiles: 'Inicia sesión para crear perfiles',
    designCost: 'Coste diseño',
    heroBadge: 'Impresión 3D FDM',
    heroTitlePrefix: 'Calcula con',
    heroTitleHighlight: 'Precisión',
    featuresTitle: 'Todo lo que necesitas',
    featuresSubtitle: 'Herramientas profesionales para negocios de impresión 3D',
    howItWorksTitle: 'Cómo funciona',
    ctaTitlePrefix: '¿Listo para',
    ctaTitleHighlight: 'cotizar',
    ctaTitleSuffix: 'tus impresiones?',
    ctaSubtitle: 'Gratuito, sin registro obligatorio. Empieza a calcular costes en segundos.',
    noRegistrationRequired: 'Sin registro obligatorio',
    registerBenefits: 'Regístrate para acceder al dashboard, guardar proyectos y más',
    designPerPiece: 'Diseño por pieza',
    laborPerPiece: 'Mano de obra por pieza',
    shareReport: 'Compartir informe',
    shareReportDesc: 'Genera un enlace para compartir solo la vista del informe',
    accountSettings: 'Ajustes de cuenta',
    deleteAccount: 'Eliminar cuenta',
    changeData: 'Cambiar datos',
    loginToCreateProfile: 'Inicia sesión para crear perfiles',
    theme: 'Tema',
    postProcessType: 'Tipo de postprocesado',
    tooltipPostProcessType: 'Selecciona el tipo de postprocesado. La tarifa se ajustará automáticamente.',
    postProcessRate: 'Tarifa postproc. (€/h)',
    tooltipPostProcessRate: 'Tarifa horaria para el trabajo de postprocesado.',
    extraExpenses: 'Gastos extra',
    addExpense: 'Añadir gasto',
    expenseDescription: 'Descripción',
    expensePrice: 'Precio',
    removeExpense: 'Quitar',
    dailyUsageHours: 'Uso diario (h)',
    tooltipDailyUsage: 'Horas medias de uso diario de la impresora para calcular la amortización.',
    amortizationMonths: 'Amortización (meses)',
    tooltipAmortization: 'Periodo de amortización en meses para recuperar la inversión de la impresora.',
    monthlyMaintenance: 'Mant. mensual (€)',
    tooltipMonthlyMaintenance: 'Coste mensual estimado de mantenimiento de la impresora.',
    additionalInitialCost: 'Inversión adicional (€)',
    tooltipAdditionalCost: 'Inversión inicial adicional (herramientas, accesorios, etc.) a amortizar.',
    bufferFactor: 'Factor buffer',
    tooltipBufferFactor: 'Multiplicador para tiempos de inactividad inesperados (1.0 = sin buffer, 1.3 = 30% extra).',
    commissionPct: 'Comisión (%)',
    tooltipCommissionPct: 'Porcentaje de comisión de plataforma (Etsy, Amazon, etc.).',
    commissionFixed: 'Comisión fija (€)',
    tooltipCommissionFixed: 'Comisión fija por venta en la plataforma.',
    priceRounding: 'Redondeo precio',
    tooltipPriceRounding: 'Redondeo psicológico del precio final.',
    minimumOrder: 'Pedido mínimo (€)',
    tooltipMinimumOrder: 'Precio mínimo del pedido. Si el total es menor, se aplica este mínimo.',
    amortizationPerHour: 'Amortización/h',
    noRounding: 'Sin redondeo',
    round99: '.99',
    round50: '.50',
    round100: 'Entero',
    postProcessNone: 'Ninguno',
    postProcessSupportRemoval: 'Retirar soportes',
    postProcessSanding: 'Lijado',
    postProcessPainting: 'Pintura',
    postProcessAssembly: 'Montaje',
    postProcessGluing: 'Pegado',
    postProcessPolishing: 'Pulido',
    postProcessCustom: 'Personalizado',
    downloadPDF: 'Descargar PDF',
    costPerHourLabel: 'Coste/h impresora',
    extraExpensesLabel: 'Gastos extra',
    shareProducer: 'Compartir reporte',
    shareInvoice: 'Compartir factura',
    shareLinkCopied: '¡Enlace copiado!',
    errorSharing: 'Error al compartir',
    monthlyExpenses: 'Gastos mensuales',
    addMonthlyExpense: 'Añadir gasto mensual',
    monthlyAmount: 'Importe mensual (€)',
    tooltipMonthlyExpenses: 'Gastos mensuales fijos (alquiler, software, seguro, etc.). Se distribuyen entre las horas de uso mensuales.',
  },
  en: {
    appName: 'D-Calc',
    appSubtitle: 'Professional 3D printing calculator',
    appDescription: 'Professional cost calculator for FDM 3D printing. Estimate filament, time, energy and labor prices with industrial precision. Free and no registration required.',
    saveProject: 'Save project',
    resetProject: 'Reset project',
    copyPrice: 'Copy price',
    priceCopied: 'Price copied',
    priceCopiedDesc: 'copied to clipboard',
    pieces: 'Pieces',
    time: 'Time',
    weight: 'Weight',
    saleType: 'Sale type',
    parameters: 'Parameters',
    printParameters: 'Print parameters',
    projectPieces: 'Project pieces',
    suggestedPrices: 'Suggested prices',
    costBreakdown: 'Breakdown',
    exportSection: 'Export',
    advancedSettings: 'Advanced settings',
    showAdvanced: 'Show advanced settings',
    hideAdvanced: 'Hide advanced settings',
    add: 'Add',
    addFirstPiece: 'Add first piece',
    noPiecesYet: 'No pieces yet',
    noPiecesDesc: 'Add the first piece to calculate the 3D printing price.',
    recordSale: 'Record sale',
    saleRecorded: 'Sale recorded',
    saleRecordedDesc: '— recorded successfully',
    projectSaved: 'Project saved',
    projectUpdated: 'Project updated',
    errorSaving: 'Could not save project',
    errorRecording: 'Could not record sale',
    wholesale: 'Wholesale',
    wholesaleDesc: 'Bulk sales',
    retail: 'Retail',
    retailDesc: 'Individual sales',
    customSale: 'Custom',
    customSaleDesc: 'Custom multiplier',
    rush: 'Rush',
    rushDesc: 'Urgent priority order',
    customize: 'Customize',
    competitive: 'Competitive',
    competitiveDesc: 'Aggressive pricing to compete',
    standard: 'Standard',
    standardDesc: 'Balance between profit and competitiveness',
    premium: 'Premium',
    premiumDesc: 'Quality positioning',
    luxury: 'Luxury',
    luxuryDesc: 'Exclusive service and premium finish',
    selected: 'Selected',
    margin: 'Margin',
    pieceName: 'Piece name',
    filamentColor: 'Filament color',
    filamentType: 'Filament type',
    customFilamentName: 'Filament name',
    weightGrams: 'Weight (g)',
    costPerKg: 'Cost (€/kg)',
    hours: 'Hours',
    minutes: 'Minutes',
    quantity: 'Quantity',
    waste: 'Waste (%)',
    postProcessing: 'Post-processing (min)',
    laborTime: 'Labor (min)',
    finishType: 'Finish type',
    customFinishDesc: 'Finish description',
    custom: 'Custom',
    noFinish: 'No finish',
    lightSanding: 'Light sanding',
    fullSanding: 'Full sanding',
    primerPaint: 'Primer & paint',
    fullPaint: 'Full paint',
    vaporSmoothing: 'Vapor smoothing',
    epoxyCoating: 'Epoxy coating',
    customFinish: 'Custom finish',
    free: 'Free',
    perPiece: '/piece',
    printerCost: 'Printer cost',
    printerLifespan: 'Lifespan (h)',
    maintenance: 'Maint. (€/h)',
    powerConsumption: 'Power (W)',
    electricityCost: 'Electricity (€/kWh)',
    laborRate: 'Labor rate (€/h)',
    supervisionRate: 'Supervision (€/h)',
    supervisionDesc: 'Rate for print supervision (5% of print time)',
    additionalLabor: 'Additional labor (€/h)',
    additionalLaborDesc: 'Rate for additional manual work besides post-processing',
    failureRate: 'Failure rate (%)',
    overhead: 'Overhead (%)',
    taxRate: 'Tax (%)',
    packaging: 'Packaging (€)',
    shipping: 'Shipping (€)',
    designTime: 'Design (min)',
    designRate: 'Design rate (€/h)',
    printerModel: 'Printer model',
    selectPrinter: 'Select printer',
    printerDefaults: 'Generic',
    tooltipPrinterCost: 'Purchase price of the printer. Used to calculate depreciation per hour of use.',
    tooltipLifespan: 'Estimated lifespan hours before replacement is needed.',
    tooltipMaintenance: 'Preventive maintenance and repair cost per printing hour.',
    tooltipPower: 'Average power consumption during printing in watts.',
    tooltipElectricity: 'Electricity price per kilowatt-hour from your utility company.',
    tooltipLaborRate: 'Hourly labor cost for post-processing and direct manual work.',
    tooltipSupervision: 'Rate for passive print supervision. Applied to 5% of print time (periodic checking).',
    tooltipAdditionalLabor: 'Rate for additional tasks like preparation, assembly, etc. Applied to the labor time you assign to each piece.',
    tooltipFailureRate: 'Probability percentage of print failure. Added as a risk premium.',
    tooltipOverhead: 'Overhead percentage (rent, software, etc.) on base cost.',
    tooltipTaxRate: 'Applicable VAT/sales tax rate.',
    tooltipPackaging: 'Fixed packaging cost per project (box, filler, tape, etc.).',
    tooltipShipping: 'Shipping cost per project. Added to the final price.',
    tooltipDesignTime: 'Time spent on 3D model design (if applicable).',
    tooltipDesignRate: 'Hourly rate for design time.',
    tooltipPrintWeight: 'Filament weight needed to print the piece, in grams.',
    tooltipFilamentCost: 'Filament price per kilogram. Varies by type and brand.',
    tooltipPrintTime: 'Estimated print time. Affects depreciation, electricity and maintenance.',
    tooltipWaste: 'Extra material percentage to compensate for purges, supports and failures.',
    tooltipQuantity: 'Number of identical units of this piece.',
    tooltipPostProcessing: 'Time spent on post-processing: removing supports, sanding, painting, etc.',
    tooltipLaborTime: 'Additional manual work time (preparation, assembly). Independent from post-processing and automatic supervision.',
    tooltipFinishingType: 'Type of finish applied to the piece after printing.',
    tooltipFinishingCost: 'Finishing cost per unit of the piece.',
    tooltipCustomFilament: 'Custom filament name.',
    tooltipColor: 'Filament color used to visually identify the piece.',
    tooltipFilamentType: 'Filament type. Determines the recommended price per kg.',
    tooltipSaleType: 'Sale type. Affects margin multiplier: wholesale reduces, rush increases.',
    tooltipCustomMultiplier: 'Custom margin multiplier. You can enter any positive value.',
    tooltipPrinterModel: 'Select your printer model to auto-fill consumption, lifespan and failure rate parameters.',
    material: 'Material',
    operation: 'Operation',
    profit: 'Profit',
    shippingPackage: 'Ship+Pkg',
    materialWithWaste: 'Material (with waste)',
    printerDepreciation: 'Printer depreciation',
    electricity: 'Electricity',
    maintenanceCost: 'Maintenance',
    labor: 'Labor',
    finishing: 'Finishing',
    failureRisk: 'Failure risk',
    subtotal: 'Subtotal/unit',
    overheadCost: 'Overhead/unit',
    baseCost: 'Base cost/unit',
    profitPerUnit: 'Profit/unit',
    taxPerUnit: 'Tax/unit',
    totalPerUnit: 'Total/unit',
    totalForQty: 'Total ×{qty}',
    totalMaterial: 'Total material cost',
    totalBase: 'Total base cost',
    totalProfitLabel: 'Total profit',
    priceBeforeTax: 'Price before tax',
    priceWithIva: 'Price with VAT',
    taxIncluded: 'Tax included',
    projectTotal: 'TOTAL PROJECT PRICE',
    producerReport: 'Producer report',
    buyerTicket: 'Invoice',
    producerReportTitle: 'Detailed producer report',
    buyerTicketTitle: '3D Printing Invoice',
    detailedReport: 'Producer Report',
    printParametersLabel: 'Print parameters',
    subpieceBreakdown: 'Per-piece breakdown',
    projectSummary: 'Project summary',
    budget3d: '3D printing quote',
    validFor30: 'Valid 30 days from',
    generatedBy: 'Report generated by D-Calc',
    unitPrice: 'Unit price',
    packagingAndShipping: 'Packaging & shipping',
    login: 'Sign in',
    register: 'Sign up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    nameOptional: 'Name (optional)',
    nameRequired: 'Name',
    enter: 'Sign in',
    createAccount: 'Create account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    logout: 'Sign out',
    dashboard: 'Dashboard',
    loginDesc: 'Sign in to save projects and view statistics',
    registerDesc: 'Save your projects and access sales statistics',
    minPassword: 'Minimum 6 characters',
    minPasswordBoth: 'Password must be at least 6 characters',
    emailInvalid: 'Invalid email format',
    fieldRequired: 'This field is required',
    incorrectCredentials: 'Incorrect email or password',
    loginError: 'Error signing in',
    registerError: 'Error creating account',
    saveYourProjects: 'Save your projects',
    saveProjectsDesc: 'Sign in to save projects, record sales and access statistics.',
    currency: 'Currency',
    selectCurrency: 'Select currency',
    language: 'Language',
    selectLanguage: 'Select language',
    footerText: 'D-Calc — Professional FDM 3D printing calculator',
    footerDisclaimer: 'Prices are estimates based on the entered parameters',
    totalRevenue: 'Total revenue',
    totalSales: 'Total sales',
    avgPrice: 'Average price',
    recentSales: 'Recent sales',
    monthlyBreakdown: 'Monthly breakdown',
    salesByTier: 'Sales by tier',
    printTime: 'Print time',
    navHome: 'Home',
    navCalculator: 'Calculator',
    navDashboard: 'Dashboard',
    heroTitle: 'D-Calc',
    heroSubtitle: 'The professional 3D printing calculator you need',
    heroCta: 'Start calculating',
    featureCalc: 'Precise calculation',
    featureCalcDesc: 'Material, energy, depreciation and labor costs with industrial precision',
    featureTiers: '4 pricing tiers',
    featureTiersDesc: 'Competitive, Standard, Premium and Luxury with adjustable margins',
    featureProfiles: 'Printer profiles',
    featureProfilesDesc: 'Save your printer specs for quick reuse across projects',
    featureProjects: 'Project management',
    featureProjectsDesc: 'Save, load and organize your 3D printing projects',
    featureExport: 'PDF export',
    featureExportDesc: 'Generate producer reports and professional invoices',
    featureCurrency: 'Multi-currency',
    featureCurrencyDesc: 'EUR, USD, GBP, CNY and 6 more currencies with auto-detection',
    step1Title: 'Configure',
    step1Desc: 'Enter your printer parameters and operational costs',
    step2Title: 'Add pieces',
    step2Desc: 'Define each piece with material, time, weight and finishing',
    step3Title: 'Get prices',
    step3Desc: 'Choose your pricing tier and export the quote',
    printerProfiles: 'Printer profiles',
    createProfile: 'Create profile',
    editProfile: 'Edit profile',
    deleteProfile: 'Delete profile',
    profileName: 'Profile name',
    profileModel: 'Model',
    profilePrice: 'Purchase price',
    profileLifespanYears: 'Lifespan (years)',
    profilePower: 'Power (W)',
    profileFailureRate: 'Failure rate (%)',
    profileMaintenance: 'Maint. (€/h)',
    profileDefault: 'Default profile',
    profileGeneric: 'Generic',
    noProfilesYet: 'No profiles yet',
    noProfilesDesc: 'Create your first printer profile to reuse its parameters',
    createFirstProfile: 'Create first profile',
    myProjects: 'My projects',
    noProjectsYet: 'No saved projects',
    loadProject: 'Load project',
    deleteProject: 'Delete project',
    apiInfo: 'API info',
    apiKeyDesc: 'Use the D-Calc REST API to integrate calculations into your own apps',
    activeProjects: 'Active projects',
    welcomeBack: 'Welcome back',
    createYourAccount: 'Create your account',
    orContinueWith: 'Or continue with',
    logisticsBusiness: 'Logistics & Business',
    tooltipLogisticsBusiness: 'Tax, packaging, shipping and amortization costs for the project.',
    pieceLaborRate: 'Labor rate (€/h)',
    tooltipPieceLaborRate: 'Hourly labor cost for this piece (post-processing + manual work).',
    pieceDesignTime: 'Design (min)',
    tooltipPieceDesignTime: 'Time spent on 3D design for this piece.',
    pieceDesignRate: 'Design rate (€/h)',
    tooltipPieceDesignRate: 'Hourly rate for design time of this piece.',
    signInToCreateProfiles: 'Sign in to create profiles',
    designCost: 'Design cost',
    heroBadge: 'FDM 3D Printing',
    heroTitlePrefix: 'Calculate with',
    heroTitleHighlight: 'Precision',
    featuresTitle: 'Everything you need',
    featuresSubtitle: 'Professional tools for professional 3D printing businesses',
    howItWorksTitle: 'How it works',
    ctaTitlePrefix: 'Ready to',
    ctaTitleHighlight: 'price',
    ctaTitleSuffix: 'your prints?',
    ctaSubtitle: 'Free, no registration required. Start calculating costs in seconds.',
    noRegistrationRequired: 'No registration required',
    registerBenefits: 'Sign up to access the dashboard, save projects, and more',
    designPerPiece: 'Design per piece',
    laborPerPiece: 'Labor per piece',
    shareReport: 'Share report',
    shareReportDesc: 'Generate a link to share only the report view',
    accountSettings: 'Account settings',
    deleteAccount: 'Delete account',
    changeData: 'Change data',
    loginToCreateProfile: 'Sign in to create profiles',
    theme: 'Theme',
    postProcessType: 'Post-process type',
    tooltipPostProcessType: 'Select the type of post-processing. The rate will auto-adjust.',
    postProcessRate: 'Post-process rate (€/h)',
    tooltipPostProcessRate: 'Hourly rate for post-processing work.',
    extraExpenses: 'Extra expenses',
    addExpense: 'Add expense',
    expenseDescription: 'Description',
    expensePrice: 'Price',
    removeExpense: 'Remove',
    dailyUsageHours: 'Daily usage (h)',
    tooltipDailyUsage: 'Average daily printer usage hours for amortization calculation.',
    amortizationMonths: 'Amortization (months)',
    tooltipAmortization: 'Payback period in months to recover the printer investment.',
    monthlyMaintenance: 'Monthly maint. (€)',
    tooltipMonthlyMaintenance: 'Estimated monthly printer maintenance cost.',
    additionalInitialCost: 'Additional investment (€)',
    tooltipAdditionalCost: 'Additional initial investment (tools, accessories, etc.) to amortize.',
    bufferFactor: 'Buffer factor',
    tooltipBufferFactor: 'Multiplier for unexpected downtime (1.0 = no buffer, 1.3 = 30% extra).',
    commissionPct: 'Commission (%)',
    tooltipCommissionPct: 'Platform commission percentage (Etsy, Amazon, etc.).',
    commissionFixed: 'Fixed commission (€)',
    tooltipCommissionFixed: 'Fixed commission per sale on the platform.',
    priceRounding: 'Price rounding',
    tooltipPriceRounding: 'Psychological rounding of the final price.',
    minimumOrder: 'Minimum order (€)',
    tooltipMinimumOrder: 'Minimum order price. If total is lower, this minimum applies.',
    amortizationPerHour: 'Amortization/h',
    noRounding: 'No rounding',
    round99: '.99',
    round50: '.50',
    round100: 'Whole',
    postProcessNone: 'None',
    postProcessSupportRemoval: 'Remove supports',
    postProcessSanding: 'Sanding',
    postProcessPainting: 'Painting',
    postProcessAssembly: 'Assembly',
    postProcessGluing: 'Gluing',
    postProcessPolishing: 'Polishing',
    postProcessCustom: 'Custom',
    downloadPDF: 'Download PDF',
    costPerHourLabel: 'Printer cost/h',
    extraExpensesLabel: 'Extra expenses',
    shareProducer: 'Share report',
    shareInvoice: 'Share invoice',
    shareLinkCopied: 'Share link copied!',
    errorSharing: 'Failed to share report',
    monthlyExpenses: 'Monthly expenses',
    addMonthlyExpense: 'Add monthly expense',
    monthlyAmount: 'Monthly amount (€)',
    tooltipMonthlyExpenses: 'Fixed monthly expenses (rent, software, insurance, etc.). Distributed across monthly usage hours.',
  },
  zh: {
    appName: 'D-Calc',
    appSubtitle: '专业3D打印计算器',
    appDescription: '专业FDM 3D打印成本计算器。精确估算耗材、时间、能耗和人工费用。免费使用，无需注册。',
    saveProject: '保存项目',
    resetProject: '重置项目',
    copyPrice: '复制价格',
    priceCopied: '价格已复制',
    priceCopiedDesc: '已复制到剪贴板',
    pieces: '件数',
    time: '时间',
    weight: '重量',
    saleType: '销售类型',
    parameters: '参数',
    printParameters: '打印参数',
    projectPieces: '项目零件',
    suggestedPrices: '建议价格',
    costBreakdown: '成本明细',
    exportSection: '导出',
    advancedSettings: '高级设置',
    showAdvanced: '显示高级设置',
    hideAdvanced: '隐藏高级设置',
    add: '添加',
    addFirstPiece: '添加第一个零件',
    noPiecesYet: '暂无零件',
    noPiecesDesc: '添加第一个零件以计算3D打印价格。',
    recordSale: '记录销售',
    saleRecorded: '销售已记录',
    saleRecordedDesc: '— 已成功记录',
    projectSaved: '项目已保存',
    projectUpdated: '项目已更新',
    errorSaving: '无法保存项目',
    errorRecording: '无法记录销售',
    wholesale: '批发',
    wholesaleDesc: '批量销售',
    retail: '零售',
    retailDesc: '单件销售',
    customSale: '自定义',
    customSaleDesc: '自定义倍率',
    rush: '加急',
    rushDesc: '紧急优先订单',
    customize: '自定义',
    competitive: '竞争力',
    competitiveDesc: '激进定价策略',
    standard: '标准',
    standardDesc: '利润与竞争力的平衡',
    premium: '优质',
    premiumDesc: '品质定位',
    luxury: '豪华',
    luxuryDesc: '专属服务和顶级工艺',
    selected: '已选择',
    margin: '利润率',
    pieceName: '零件名称',
    filamentColor: '耗材颜色',
    filamentType: '耗材类型',
    customFilamentName: '耗材名称',
    weightGrams: '重量 (g)',
    costPerKg: '成本 (€/kg)',
    hours: '小时',
    minutes: '分钟',
    quantity: '数量',
    waste: '损耗 (%)',
    postProcessing: '后处理 (分钟)',
    laborTime: '人工 (分钟)',
    finishType: '表面处理',
    customFinishDesc: '处理说明',
    custom: '自定义',
    noFinish: '无处理',
    lightSanding: '轻度打磨',
    fullSanding: '全面打磨',
    primerPaint: '底漆和涂装',
    fullPaint: '完整涂装',
    vaporSmoothing: '蒸汽平滑',
    epoxyCoating: '环氧涂层',
    customFinish: '自定义处理',
    free: '免费',
    perPiece: '/件',
    printerCost: '打印机成本',
    printerLifespan: '使用寿命 (h)',
    maintenance: '维护 (€/h)',
    powerConsumption: '功耗 (W)',
    electricityCost: '电费 (€/kWh)',
    laborRate: '人工费率 (€/h)',
    supervisionRate: '监控费率 (€/h)',
    supervisionDesc: '打印监控费率（打印时间的5%）',
    additionalLabor: '额外人工 (€/h)',
    additionalLaborDesc: '除后处理外的额外手工工作费率',
    failureRate: '失败率 (%)',
    overhead: '间接费用 (%)',
    taxRate: '税率 (%)',
    packaging: '包装 (€)',
    shipping: '运费 (€)',
    designTime: '设计时间 (分钟)',
    designRate: '设计费率 (€/h)',
    printerModel: '打印机型号',
    selectPrinter: '选择打印机',
    printerDefaults: '通用',
    tooltipPrinterCost: '打印机的购买价格。用于计算每小时的折旧费。',
    tooltipLifespan: '需要更换前的估计使用寿命（小时）。',
    tooltipMaintenance: '每小时打印的预防性维护和维修成本。',
    tooltipPower: '打印过程中的平均功耗（瓦）。',
    tooltipElectricity: '电力公司每千瓦时的电价。',
    tooltipLaborRate: '后处理和直接手工工作的每小时人工成本。',
    tooltipSupervision: '被动打印监控费率。适用于打印时间的5%（定期检查）。',
    tooltipAdditionalLabor: '准备、组装等额外工作的费率。适用于分配给每个零件的劳动时间。',
    tooltipFailureRate: '打印失败的概率百分比。作为风险溢价添加。',
    tooltipOverhead: '基础成本上的间接费用百分比（租金、软件等）。',
    tooltipTaxRate: '适用的增值税/销售税率。',
    tooltipPackaging: '每个项目的固定包装成本（盒子、填充物、胶带等）。',
    tooltipShipping: '每个项目的运输成本。添加到最终价格。',
    tooltipDesignTime: '3D模型设计所花的时间（如适用）。',
    tooltipDesignRate: '设计时间的每小时费率。',
    tooltipPrintWeight: '打印零件所需的耗材重量，以克为单位。',
    tooltipFilamentCost: '每公斤耗材价格。因类型和品牌而异。',
    tooltipPrintTime: '估计打印时间。影响折旧、电力和维护。',
    tooltipWaste: '额外材料百分比，用于补偿清洗、支撑和失败。',
    tooltipQuantity: '此零件的相同单位数量。',
    tooltipPostProcessing: '后处理所花的时间：去除支撑、打磨、涂装等。',
    tooltipLaborTime: '额外手工工作时间（准备、组装）。独立于后处理和自动监控。',
    tooltipFinishingType: '打印后应用于零件的表面处理类型。',
    tooltipFinishingCost: '每件零件的表面处理成本。',
    tooltipCustomFilament: '自定义耗材名称。',
    tooltipColor: '用于视觉识别零件的耗材颜色。',
    tooltipFilamentType: '耗材类型。决定每公斤的建议价格。',
    tooltipSaleType: '销售类型。影响利润率倍率：批发降低，加急增加。',
    tooltipCustomMultiplier: '自定义利润率倍率。可以输入任何正值。',
    tooltipPrinterModel: '选择您的打印机型号以自动填充功耗、使用寿命和失败率参数。',
    material: '材料',
    operation: '运营',
    profit: '利润',
    shippingPackage: '运费+包装',
    materialWithWaste: '材料（含损耗）',
    printerDepreciation: '打印机折旧',
    electricity: '电力',
    maintenanceCost: '维护',
    labor: '人工',
    finishing: '表面处理',
    failureRisk: '失败风险',
    subtotal: '小计/件',
    overheadCost: '间接费用/件',
    baseCost: '基础成本/件',
    profitPerUnit: '利润/件',
    taxPerUnit: '税/件',
    totalPerUnit: '总计/件',
    totalForQty: '总计 ×{qty}',
    totalMaterial: '材料总成本',
    totalBase: '基础总成本',
    totalProfitLabel: '总利润',
    priceBeforeTax: '税前价格',
    priceWithIva: '含税价格',
    taxIncluded: '含税',
    projectTotal: '项目总价',
    producerReport: '生产者报告',
    buyerTicket: '发票',
    producerReportTitle: '详细生产者报告',
    buyerTicketTitle: '3D打印发票',
    detailedReport: '生产者报告',
    printParametersLabel: '打印参数',
    subpieceBreakdown: '零件成本明细',
    projectSummary: '项目摘要',
    budget3d: '3D打印报价',
    validFor30: '自以下日期起30天内有效',
    generatedBy: '报告由D-Calc生成',
    unitPrice: '单价',
    packagingAndShipping: '包装和运输',
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
    name: '姓名',
    nameOptional: '姓名（可选）',
    nameRequired: '姓名',
    enter: '登录',
    createAccount: '创建账户',
    noAccount: '没有账户？',
    hasAccount: '已有账户？',
    logout: '退出',
    dashboard: '仪表板',
    loginDesc: '登录以保存项目和查看统计',
    registerDesc: '保存项目并访问销售统计',
    minPassword: '至少6个字符',
    minPasswordBoth: '密码至少需要6个字符',
    emailInvalid: '邮箱格式无效',
    fieldRequired: '此字段为必填',
    incorrectCredentials: '邮箱或密码不正确',
    loginError: '登录出错',
    registerError: '创建账户出错',
    saveYourProjects: '保存您的项目',
    saveProjectsDesc: '登录以保存项目、记录销售和访问统计。',
    currency: '货币',
    selectCurrency: '选择货币',
    language: '语言',
    selectLanguage: '选择语言',
    footerText: 'D-Calc — 专业FDM 3D打印计算器',
    footerDisclaimer: '价格基于输入参数的估算',
    totalRevenue: '总收入',
    totalSales: '总销售',
    avgPrice: '平均价格',
    recentSales: '近期销售',
    monthlyBreakdown: '月度明细',
    salesByTier: '按级别销售',
    printTime: '打印时间',
    navHome: '首页',
    navCalculator: '计算器',
    navDashboard: '仪表板',
    heroTitle: 'D-Calc',
    heroSubtitle: '您需要的专业3D打印计算器',
    heroCta: '开始计算',
    featureCalc: '精确计算',
    featureCalcDesc: '材料、能源、折旧和人工成本，工业级精度',
    featureTiers: '4个价格层级',
    featureTiersDesc: '竞争力、标准、优质和豪华，可调利润率',
    featureProfiles: '打印机配置',
    featureProfilesDesc: '保存打印机规格，在项目中快速复用',
    featureProjects: '项目管理',
    featureProjectsDesc: '保存、加载和组织您的3D打印项目',
    featureExport: 'PDF导出',
    featureExportDesc: '生成生产者报告和专业发票',
    featureCurrency: '多货币',
    featureCurrencyDesc: '欧元、美元、英镑、人民币等10种货币，自动检测',
    step1Title: '配置',
    step1Desc: '输入打印机参数和运营成本',
    step2Title: '添加零件',
    step2Desc: '定义每个零件的材料、时间、重量和表面处理',
    step3Title: '获取价格',
    step3Desc: '选择价格层级并导出报价',
    printerProfiles: '打印机配置',
    createProfile: '创建配置',
    editProfile: '编辑配置',
    deleteProfile: '删除配置',
    profileName: '配置名称',
    profileModel: '型号',
    profilePrice: '购买价格',
    profileLifespanYears: '使用寿命（年）',
    profilePower: '功耗 (W)',
    profileFailureRate: '失败率 (%)',
    profileMaintenance: '维护 (€/h)',
    profileDefault: '默认配置',
    profileGeneric: '通用',
    noProfilesYet: '暂无配置',
    noProfilesDesc: '创建您的第一个打印机配置以复用参数',
    createFirstProfile: '创建第一个配置',
    myProjects: '我的项目',
    noProjectsYet: '暂无保存的项目',
    loadProject: '加载项目',
    deleteProject: '删除项目',
    apiInfo: 'API信息',
    apiKeyDesc: '使用D-Calc REST API将计算功能集成到您的应用中',
    activeProjects: '活跃项目',
    welcomeBack: '欢迎回来',
    createYourAccount: '创建您的账户',
    orContinueWith: '或继续使用',
    logisticsBusiness: '物流与商业',
    tooltipLogisticsBusiness: '项目的税费、包装、运输和摊销成本。',
    pieceLaborRate: '人工费率 (€/h)',
    tooltipPieceLaborRate: '此零件的每小时人工成本（后处理 + 手工工作）。',
    pieceDesignTime: '设计 (分钟)',
    tooltipPieceDesignTime: '此零件的3D设计时间。',
    pieceDesignRate: '设计费率 (€/h)',
    tooltipPieceDesignRate: '此零件的设计时间每小时费率。',
    signInToCreateProfiles: '登录以创建配置',
    designCost: '设计成本',
    heroBadge: 'FDM 3D打印',
    heroTitlePrefix: '精确计算',
    heroTitleHighlight: '精度',
    featuresTitle: '你需要的一切',
    featuresSubtitle: '专业3D打印业务工具',
    howItWorksTitle: '使用方法',
    ctaTitlePrefix: '准备好',
    ctaTitleHighlight: '定价',
    ctaTitleSuffix: '你的打印？',
    ctaSubtitle: '免费，无需注册。几秒钟内开始计算成本。',
    noRegistrationRequired: '无需注册',
    registerBenefits: '注册以访问仪表板、保存项目等',
    designPerPiece: '每件设计',
    laborPerPiece: '每件人工',
    shareReport: '分享报告',
    shareReportDesc: '生成链接仅分享报告视图',
    accountSettings: '账户设置',
    deleteAccount: '删除账户',
    changeData: '更改数据',
    loginToCreateProfile: '登录以创建配置',
    theme: '主题',
    postProcessType: '后处理类型',
    tooltipPostProcessType: '选择后处理类型。费率将自动调整。',
    postProcessRate: '后处理费率 (€/h)',
    tooltipPostProcessRate: '后处理工作的每小时费率。',
    extraExpenses: '额外费用',
    addExpense: '添加费用',
    expenseDescription: '描述',
    expensePrice: '价格',
    removeExpense: '删除',
    dailyUsageHours: '日使用 (h)',
    tooltipDailyUsage: '打印机日均使用小时数，用于摊销计算。',
    amortizationMonths: '摊销 (月)',
    tooltipAmortization: '回收打印机投资的摊销期（月）。',
    monthlyMaintenance: '月维护 (€)',
    tooltipMonthlyMaintenance: '打印机月度维护估算成本。',
    additionalInitialCost: '额外投资 (€)',
    tooltipAdditionalCost: '需要摊销的额外初始投资（工具、配件等）。',
    bufferFactor: '缓冲因子',
    tooltipBufferFactor: '意外停机时间的乘数（1.0 = 无缓冲，1.3 = 30%额外）。',
    commissionPct: '佣金 (%)',
    tooltipCommissionPct: '平台佣金百分比（Etsy、Amazon等）。',
    commissionFixed: '固定佣金 (€)',
    tooltipCommissionFixed: '平台上每笔销售的固定佣金。',
    priceRounding: '价格取整',
    tooltipPriceRounding: '最终价格的心理取整方式。',
    minimumOrder: '最低订单 (€)',
    tooltipMinimumOrder: '最低订单价格。如果总额更低，则适用此最低值。',
    amortizationPerHour: '摊销/小时',
    noRounding: '不取整',
    round99: '.99',
    round50: '.50',
    round100: '整数',
    postProcessNone: '无',
    postProcessSupportRemoval: '去支撑',
    postProcessSanding: '打磨',
    postProcessPainting: '上色',
    postProcessAssembly: '组装',
    postProcessGluing: '粘合',
    postProcessPolishing: '抛光',
    postProcessCustom: '自定义',
    downloadPDF: '下载 PDF',
    costPerHourLabel: '打印机成本/小时',
    extraExpensesLabel: '额外费用',
    shareProducer: '分享报告',
    shareInvoice: '分享发票',
    shareLinkCopied: '分享链接已复制！',
    errorSharing: '分享失败',
    monthlyExpenses: '月度支出',
    addMonthlyExpense: '添加月度支出',
    monthlyAmount: '月度金额 (€)',
    tooltipMonthlyExpenses: '固定月度支出（租金、软件、保险等）。按月使用小时数分摊。',
  },
  eu: {
    appName: 'D-Calc',
    appSubtitle: '3D inprimaketa kalkulagailu profesionala',
    appDescription: 'FDM 3D inprimaketarako kostu kalkulagailu profesionala. Harizpi, denbora, energia eta lan kostuak estimatu zehaztasun industrialekin. Doakoa eta erregistratu gabe.',
    saveProject: 'Gorde proiektua',
    resetProject: 'Berrezarri proiektua',
    copyPrice: 'Kopiatu prezioa',
    priceCopied: 'Prezioa kopiatuta',
    priceCopiedDesc: 'arbelean kopiatuta',
    pieces: 'Piezak',
    time: 'Denbora',
    weight: 'Pisua',
    saleType: 'Salmenta mota',
    parameters: 'Parametroak',
    printParameters: 'Inprimaketa parametroak',
    projectPieces: 'Proiektu piezak',
    suggestedPrices: 'Prezio iradokiak',
    costBreakdown: 'Zehaztapena',
    exportSection: 'Esportatu',
    advancedSettings: 'Ezarpen aurreratuak',
    showAdvanced: 'Erakutsi ezarpen aurreratuak',
    hideAdvanced: 'Ezkutatu ezarpen aurreratuak',
    add: 'Gehitu',
    addFirstPiece: 'Gehitu lehen pieza',
    noPiecesYet: 'Oraindik piezarik ez',
    noPiecesDesc: 'Gehitu lehen pieza 3D inprimaketa prezioa kalkulatzeko.',
    recordSale: 'Erregistratu salmenta',
    saleRecorded: 'Salmenta erregistratuta',
    saleRecordedDesc: '— ondo erregistratuta',
    projectSaved: 'Proiektua gorde da',
    projectUpdated: 'Proiektua eguneratuta',
    errorSaving: 'Ezin izan da proiektua gorde',
    errorRecording: 'Ezin izan da salmenta erregistratu',
    wholesale: 'Handizka',
    wholesaleDesc: 'Salmenta handizka',
    retail: 'Txikizka',
    retailDesc: 'Salmenta txikizka',
    customSale: 'Pertsonalizatua',
    customSaleDesc: 'Biderkatzaile pertsonalizatua',
    rush: 'Premiazkoa',
    rushDesc: 'Premiazko eskaera lehentasunarekin',
    customize: 'Pertsonalizatu',
    competitive: 'Lehiakorra',
    competitiveDesc: 'Prezio agresiboa lehiatzeko',
    standard: 'Estandarra',
    standardDesc: 'Irabazi eta lehiakortasunaren arteko oreka',
    premium: 'Premium',
    premiumDesc: 'Kalitate kokapena',
    luxury: 'Luxuzkoa',
    luxuryDesc: 'Zerbitzu esklusiboa eta akabera premium',
    selected: 'Hautatuta',
    margin: 'Marjina',
    pieceName: 'Pieza izena',
    filamentColor: 'Harizpi kolorea',
    filamentType: 'Harizpi mota',
    customFilamentName: 'Harizpi izena',
    weightGrams: 'Pisua (g)',
    costPerKg: 'Kostua (€/kg)',
    hours: 'Orduak',
    minutes: 'Minutuak',
    quantity: 'Kopurua',
    waste: 'Hondakina (%)',
    postProcessing: 'Post-prozesaketa (min)',
    laborTime: 'Eskuzko lana (min)',
    finishType: 'Akabera mota',
    customFinishDesc: 'Akabera deskribapena',
    custom: 'Pertsonalizatua',
    noFinish: 'Akaberarik ez',
    lightSanding: 'Leundu arina',
    fullSanding: 'Leundu osoa',
    primerPaint: 'Zubiloa eta pintura',
    fullPaint: 'Pintura osoa',
    vaporSmoothing: 'Lurrun-leuntzea',
    epoxyCoating: 'Epoxi estalkia',
    customFinish: 'Akabera pertsonalizatua',
    free: 'Doakoa',
    perPiece: '/pieza',
    printerCost: 'Inprimagailu kostua',
    printerLifespan: 'Bizitza (h)',
    maintenance: 'Mant. (€/h)',
    powerConsumption: 'Kontsumoa (W)',
    electricityCost: 'Elektrizitatea (€/kWh)',
    laborRate: 'Lan tarifa (€/h)',
    supervisionRate: 'Gainbegiraketa (€/h)',
    supervisionDesc: 'Inprimaketa gainbegiratzeko tarifa (inprimaketa denboraren %5a)',
    additionalLabor: 'Lan gehigarria (€/h)',
    additionalLaborDesc: 'Post-prozesaketaz gaineko lan gehigarriaren tarifa',
    failureRate: 'Hutsegite tasa (%)',
    overhead: 'Gainkostua (%)',
    taxRate: 'Zerga (%)',
    packaging: 'Paketa (€)',
    shipping: 'Bidalketa (€)',
    designTime: 'Diseinua (min)',
    designRate: 'Diseinu tarifa (€/h)',
    printerModel: 'Inprimagailu modeloa',
    selectPrinter: 'Hautatu inprimagailua',
    printerDefaults: 'Generikoa',
    tooltipPrinterCost: 'Inprimagailuaren erosketa prezioa. Orduko amortizazioa kalkulatzeko erabiltzen da.',
    tooltipLifespan: 'Ordu estimatuak ordezkatu aurretik.',
    tooltipMaintenance: 'Mantentze prebentiboko eta konpontzeko kostua inprimaketa orduko.',
    tooltipPower: 'Inprimaketa bitarteko batez besteko kontsumoa wAttotan.',
    tooltipElectricity: 'Zure konpainia elektrikoaren kWh-ko prezioa.',
    tooltipLaborRate: 'Post-prozesaketarako eta lan zuzenerako orduko lan kostua.',
    tooltipSupervision: 'Gainbegiraketa pasiboaren tarifa. Inprimaketa denboraren %5ari aplikatzen zaio.',
    tooltipAdditionalLabor: 'Prestaketa, muntaketa eta abarretarako tarifa. Pieza bakoitzari esleitzen diozun lan denborari aplikatzen zaio.',
    tooltipFailureRate: 'Inprimaketa hutsegitearen probabilitate portzentaia. Prima gisa gehitzen da.',
    tooltipOverhead: 'Oinarrizko kostuaren gaineko gainkostu portzentaia (alokairua, softwarea, etab.).',
    tooltipTaxRate: 'Aplikagarria den BEZ/salmenta zerga tasa.',
    tooltipPackaging: 'Proiektuko paketa kostu finkoa (kaxa, betegarria, zinta, etab.).',
    tooltipShipping: 'Proiektuko bidalketa kostua. Azken prezioari gehitzen zaio.',
    tooltipDesignTime: '3D ereduaren diseinuan emandako denbora (halakotan).',
    tooltipDesignRate: 'Diseinu denborako orduko tarifa.',
    tooltipPrintWeight: 'Pieza inprimatzeko beharrezko harizpi pisua, gramotan.',
    tooltipFilamentCost: 'Kilogramoko harizpi prezioa. Mota eta markaren arabera aldatzen da.',
    tooltipPrintTime: 'Estimatutako inprimaketa denbora. Amortizazioari, elektrizitateari eta mantentzeari eragiten dio.',
    tooltipWaste: 'Garbiketak, euskarriak eta hutsegiteak konpentsatzeko material gehigarriaren portzentaia.',
    tooltipQuantity: 'Pieza honen unitate berdinen kopurua.',
    tooltipPostProcessing: 'Post-prozesaketan emandako denbora: euskarriak kendu, leundu, margotu, etab.',
    tooltipLaborTime: 'Lan gehigarria (prestaketa, muntaketa). Post-prozesaketa eta gainbegiraketa automatikotik independentea.',
    tooltipFinishingType: 'Inprimatu ondoren piezari aplikatutako akabera mota.',
    tooltipFinishingCost: 'Piezako akabera kostua.',
    tooltipCustomFilament: 'Harizpi pertsonalizatuaren izena.',
    tooltipColor: 'Pieza bisualki identifikatzeko harizpi kolorea.',
    tooltipFilamentType: 'Harizpi mota. Kg-ko prezio iradokia zehazten du.',
    tooltipSaleType: 'Salmenta mota. Marjina biderkatzaileari eragiten dio: handizka murrizten du, premiazkoa handitzen du.',
    tooltipCustomMultiplier: 'Marjina biderkatzaile pertsonalizatua. Edozein balio positibo sar dezakezu.',
    tooltipPrinterModel: 'Hautatu zure inprimagailu modeloa kontsumoa, bizitza eta hutsegite tasa parametroak automatikoki betetzeko.',
    material: 'Materiala',
    operation: 'Eragiketa',
    profit: 'Irabazia',
    shippingPackage: 'Bidalk.+Pak.',
    materialWithWaste: 'Materiala (hondakinarekin)',
    printerDepreciation: 'Inprimagailu amortizazioa',
    electricity: 'Elektrizitatea',
    maintenanceCost: 'Mantentzea',
    labor: 'Eskuzko lana',
    finishing: 'Akabera',
    failureRisk: 'Hutsegite arriskua',
    subtotal: 'Azpibata/banakoa',
    overheadCost: 'Gainkostua/banakoa',
    baseCost: 'Oinarrizko kostua/banakoa',
    profitPerUnit: 'Irabazia/banakoa',
    taxPerUnit: 'Zerga/banakoa',
    totalPerUnit: 'Guztira/banakoa',
    totalForQty: 'Guztira ×{qty}',
    totalMaterial: 'Material kostu totala',
    totalBase: 'Oinarrizko kostu totala',
    totalProfitLabel: 'Irabazi totala',
    priceBeforeTax: 'Zerga aurreko prezioa',
    priceWithIva: 'BEZarekin prezioa',
    taxIncluded: 'Zerga barne',
    projectTotal: 'PROIEKTU PREZIO TOTALA',
    producerReport: 'Ekoizle txostena',
    buyerTicket: 'Faktura',
    producerReportTitle: 'Ekoizle txosten zehatza',
    buyerTicketTitle: '3D inprimaketa faktura',
    detailedReport: 'Ekoizle Txostena',
    printParametersLabel: 'Inprimaketa parametroak',
    subpieceBreakdown: 'Pieza bakoitzeko zehaztapena',
    projectSummary: 'Proiektu laburpena',
    budget3d: '3D inprimaketa aurrekontua',
    validFor30: 'Baliozkoa 30 egun',
    generatedBy: 'Txostena D-Calc-ek sortua',
    unitPrice: 'Unitate prezioa',
    packagingAndShipping: 'Paketa eta bidalketa',
    login: 'Hasi saioa',
    register: 'Erregistratu',
    email: 'Posta elektronikoa',
    password: 'Pasahitza',
    name: 'Izena',
    nameOptional: 'Izena (aukerazkoa)',
    nameRequired: 'Izena',
    enter: 'Sartu',
    createAccount: 'Sortu kontua',
    noAccount: 'Konturik ez duzu?',
    hasAccount: 'Kontua duzu jada?',
    logout: 'Itxi saioa',
    dashboard: 'Arbela',
    loginDesc: 'Hasi saioa proiektuak gordetzeko eta estatistikak ikusteko',
    registerDesc: 'Gorde zure proiektuak eta salmenta estatistikak ikusi',
    minPassword: 'Gutxienez 6 karaktere',
    minPasswordBoth: 'Pasahitzak gutxienez 6 karaktere izan behar ditu',
    emailInvalid: 'Posta elektroniko formatu baliogabea',
    fieldRequired: 'Eremu hau beharrezkoa da',
    incorrectCredentials: 'Posta edo pasahitza okerrak',
    loginError: 'Errorea saioa hastean',
    registerError: 'Errorea kontua sortzerakoan',
    saveYourProjects: 'Gorde zure proiektuak',
    saveProjectsDesc: 'Hasi saioa proiektuak gordetzeko, salmentak erregistratzeko eta estatistikak ikusteko.',
    currency: 'Moneta',
    selectCurrency: 'Hautatu moneta',
    language: 'Hizkuntza',
    selectLanguage: 'Hautatu hizkuntza',
    footerText: 'D-Calc — FDM 3D inprimaketa kalkulagailu profesionala',
    footerDisclaimer: 'Prezioak sartutako parametroetan oinarritutako estimazioak dira',
    totalRevenue: 'Diru-sarrera totalak',
    totalSales: 'Salmenta totalak',
    avgPrice: 'Bataz besteko prezioa',
    recentSales: 'Azken salmentak',
    monthlyBreakdown: 'Hilabeteko zehaztapena',
    salesByTier: 'Mailen araberako salmentak',
    printTime: 'Inprimaketa denbora',
    navHome: 'Hasiera',
    navCalculator: 'Kalkulagailua',
    navDashboard: 'Arbela',
    heroTitle: 'D-Calc',
    heroSubtitle: 'Behar duzun 3D inprimaketa kalkulagailu profesionala',
    heroCta: 'Hasier kalkulatzen',
    featureCalc: 'Kalkulu zehatza',
    featureCalcDesc: 'Material, energia, amortizazio eta lan kostuak zehaztasun industrialekin',
    featureTiers: '4 prezio maila',
    featureTiersDesc: 'Lehiakorra, Estandarra, Premium eta Luxuzkoa marjina doigarriekin',
    featureProfiles: 'Inprimagailu profilak',
    featureProfilesDesc: 'Gorde zure inprimagailu espezifikazioak proiektuetan berrerabiltzeko',
    featureProjects: 'Proiektuen kudeaketa',
    featureProjectsDesc: 'Gorde, kargatu eta antolatu zure 3D inprimaketa proiektuak',
    featureExport: 'PDF esportazioa',
    featureExportDesc: 'Sortu ekoizle txostenak eta faktura profesionalak',
    featureCurrency: 'Dibisa anitz',
    featureCurrencyDesc: 'EUR, USD, GBP, CNY eta 6 dibisa gehiago detekzio automatikoarekin',
    step1Title: 'Konfiguratu',
    step1Desc: 'Sartu zure inprimagailu parametroak eta kostu operatiboak',
    step2Title: 'Gehitu piezak',
    step2Desc: 'Definitu pieza bakoitza material, denbora, pisu eta akaberarekin',
    step3Title: 'Lortu prezioak',
    step3Desc: 'Aukeratu prezio maila eta esportatu aurrekontua',
    printerProfiles: 'Inprimagailu profilak',
    createProfile: 'Sortu profila',
    editProfile: 'Editatu profila',
    deleteProfile: 'Ezabatu profila',
    profileName: 'Profil izena',
    profileModel: 'Modeloa',
    profilePrice: 'Erosketa prezioa',
    profileLifespanYears: 'Bizitza (urte)',
    profilePower: 'Kontsumoa (W)',
    profileFailureRate: 'Hutsegite tasa (%)',
    profileMaintenance: 'Mant. (€/h)',
    profileDefault: 'Profil lehenetsia',
    profileGeneric: 'Generikoa',
    noProfilesYet: 'Oraindik profilik ez',
    noProfilesDesc: 'Sortu zure lehen inprimagailu profila parametroak berrerabiltzeko',
    createFirstProfile: 'Sortu lehen profila',
    myProjects: 'Nire proiektuak',
    noProjectsYet: 'Gordetako proiekturik ez',
    loadProject: 'Kargatu proiektua',
    deleteProject: 'Ezabatu proiektua',
    apiInfo: 'API informazioa',
    apiKeyDesc: 'Erabili D-Calc REST APIa kalkuluak zure aplikazioetan integratzeko',
    activeProjects: 'Proiektu aktiboak',
    welcomeBack: 'Ongi etorri berriro',
    createYourAccount: 'Sortu zure kontua',
    orContinueWith: 'Edo jarraitu honekin',
    logisticsBusiness: 'Logistika eta negozioa',
    tooltipLogisticsBusiness: 'Proiektuaren zergak, paketatzea, bidalketa eta amortizazioa.',
    pieceLaborRate: 'Lan tasa (€/h)',
    tooltipPieceLaborRate: 'Pieza honetako orduko lan kostua (post-prozesaketa + eskuzko lana).',
    pieceDesignTime: 'Diseinua (min)',
    tooltipPieceDesignTime: 'Pieza honen 3D diseinuan emandako denbora.',
    pieceDesignRate: 'Diseinu tasa (€/h)',
    tooltipPieceDesignRate: 'Pieza honen diseinu denborarako orduko tasa.',
    signInToCreateProfiles: 'Hasi saioa profilak sortzeko',
    designCost: 'Diseinu kostua',
    heroBadge: 'FDM 3D inprimaketa',
    heroTitlePrefix: 'Kalkulatu',
    heroTitleHighlight: 'Zehaztasuna',
    featuresTitle: 'Behar duzun guztia',
    featuresSubtitle: 'Tresna profesionalak 3D inprimaketa negozioetarako',
    howItWorksTitle: 'Nola funtzionatzen du',
    ctaTitlePrefix: 'Prest zaude',
    ctaTitleHighlight: 'aurreikusteko',
    ctaTitleSuffix: 'zure inpresioak?',
    ctaSubtitle: 'Doakoa, erregistrorik gabe. Segundotan hasi kostuak kalkulatzen.',
    noRegistrationRequired: 'Erregistrorik gabe',
    registerBenefits: 'Eman izena dashboardera sartu, proiektuak gorde eta gehiagorako',
    designPerPiece: 'Diseinua piezako',
    laborPerPiece: 'Lana piezako',
    shareReport: 'Partekatu txostena',
    shareReportDesc: 'Sortu esteka txostenaren ikuspegia soilik partekatzeko',
    accountSettings: 'Kontu ezarpenak',
    deleteAccount: 'Ezabatu kontua',
    changeData: 'Aldatu datuak',
    loginToCreateProfile: 'Hasi saioa profilak sortzeko',
    theme: 'Itxura',
    postProcessType: 'Post-prozesu mota',
    tooltipPostProcessType: 'Hautatu post-prozesu mota. Tarifa automatikoki doitzeko.',
    postProcessRate: 'Post-prozesu tarifa (€/h)',
    tooltipPostProcessRate: 'Post-prozesu lanaren orduko tarifa.',
    extraExpenses: 'Gehigarri gastuak',
    addExpense: 'Gehitu gastua',
    expenseDescription: 'Deskribapena',
    expensePrice: 'Prezioa',
    removeExpense: 'Kendu',
    dailyUsageHours: 'Eguneroko erabilera (h)',
    tooltipDailyUsage: 'Inprimagailuaren eguneroko erabilera orduak amortizazioa kalkulatzeko.',
    amortizationMonths: 'Amortizazioa (hilabete)',
    tooltipAmortization: 'Inprimagailuaren inbertsioa berreskuratzeko amortizazio epea hilabetetan.',
    monthlyMaintenance: 'Hilabeteko mantentze (€)',
    tooltipMonthlyMaintenance: 'Inprimagailuaren hilabeteko mantentze kostua.',
    additionalInitialCost: 'Inbertsio gehigarria (€)',
    tooltipAdditionalCost: 'Amortizatzeko hasierako inbertsio gehigarria (tresnak, osagarriak).',
    bufferFactor: 'Buffer faktorea',
    tooltipBufferFactor: 'Ustekabeko geldialdietarako biderkatzailea (1.0 = bufferrik ez, 1.3 = %30 estra).',
    commissionPct: 'Komisioa (%)',
    tooltipCommissionPct: 'Plataformaren komisio ehunekoa (Etsy, Amazon, etab.).',
    commissionFixed: 'Komisio finkoa (€)',
    tooltipCommissionFixed: 'Salmentako komisio finkoa plataforma honetan.',
    priceRounding: 'Prezio biribiltzea',
    tooltipPriceRounding: 'Azken prezioaren biribiltze psikologikoa.',
    minimumOrder: 'Eskaera minimoa (€)',
    tooltipMinimumOrder: 'Eskaera gutxieneko prezioa. Totala txikiagoa bada, gutxieneko hau aplikatzen da.',
    amortizationPerHour: 'Amortizazioa/h',
    noRounding: 'Biribiltzerik ez',
    round99: '.99',
    round50: '.50',
    round100: 'Osoa',
    postProcessNone: 'Bat ere ez',
    postProcessSupportRemoval: 'Euskarriak kendu',
    postProcessSanding: 'Leuntze',
    postProcessPainting: 'Margo',
    postProcessAssembly: 'Muntaketa',
    postProcessGluing: 'Itsatsi',
    postProcessPolishing: 'Distiratu',
    postProcessCustom: 'Pertsonalizatua',
    downloadPDF: 'PDF deskargatu',
    costPerHourLabel: 'Inprimagailu kostua/h',
    extraExpensesLabel: 'Gehigarri gastuak',
    shareProducer: 'Partekatu txostena',
    shareInvoice: 'Partekatu faktura',
    shareLinkCopied: 'Esteka kopiatua!',
    errorSharing: 'Akatsa partekatzean',
    monthlyExpenses: 'Hilabeteko gastuak',
    addMonthlyExpense: 'Gehitu hilabeteko gastua',
    monthlyAmount: 'Hilabeteko kopurua (€)',
    tooltipMonthlyExpenses: 'Hilabeteko gastu finkoak (alokairua, softwarea, asegurua, etab.). Hilabeteko erabilera orduen artean banatzen dira.',
  },
};

export function t(locale: Locale, key: keyof Translations): string {
  return translations[locale]?.[key] || translations.es[key] || key;
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.es;
}

export default translations;
