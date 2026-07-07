import type { Company } from './types';

export const companies: Company[] = [
  // ── Mandantes mineros ──
  {
    id: 'codelco',
    name: 'Codelco',
    type: 'Mandante minero',
    description:
      'Mayor productora de cobre del mundo. Proyectos estructurales en ejecución (Chuquicamata Subterránea, El Teniente, Rajo Inca) y licitaciones continuas de ingeniería, inspección y relaves.',
    registration:
      'Registro en RedNegocios CCS (seleccionar CODELCO como mandante, Acreditación Full) → segmentación → licitaciones por SAP Ariba. No usa SICEP. Precalificación: ANT-02, certificado Ley 16.744 (36 meses), F30/F30-1. Contacto: portalcompras@codelco.cl.',
    portalUrl: 'https://www.codelco.com/proveedores/registrese-como-proveedor',
    portalLabel: 'codelco.com/proveedores + rednegocios.cl',
  },
  {
    id: 'bhp',
    name: 'BHP (Escondida / Spence / Cerro Colorado)',
    type: 'Mandante minero',
    description:
      'Mayor cartera privada activa: plan >US$10.000M en Escondida (Nueva Concentradora, Laguna Seca, lixiviación) + Pampa Norte y reapertura Cerro Colorado.',
    registration:
      'Manifestación de interés en interestedsupplier.bhp.com → onboarding GCMS + SAP Ariba Standard (gratuita). SICEP es condición esencial para licitar con Escondida/Spence. Contacto: bhpvendoronboarding@bhp.com.',
    portalUrl: 'https://www.bhp.com/suppliers/become-a-supplier',
    portalLabel: 'bhp.com/suppliers',
  },
  {
    id: 'amsa',
    name: 'Antofagasta Minerals (Centinela, Pelambres, Zaldívar, Antucoya)',
    type: 'Mandante minero',
    description:
      'Cartera en ejecución de US$5.300M: Segunda Concentradora Centinela (peak 2026), PAO Los Pelambres, extensión Zaldívar y plan Los Pelambres Futuro (>US$6.000M).',
    registration:
      'Registro por invitación en plataforma EVA; identifica candidatos vía SICEP y SAP Ariba. Canal práctico: carta de capacidades a abastecimiento@aminerals.cl. Proveedores locales Choapa: proveedoreslocalesmlp.cl.',
    portalUrl: 'https://web.mineracentinela.cl/proveedores/conviertete-en-proveedor',
    portalLabel: 'Portal proveedores Centinela / EVA',
  },
  {
    id: 'anglo',
    name: 'Anglo American (Los Bronces, Chagres)',
    type: 'Mandante minero',
    description:
      'Los Bronces Integrado en ejecución de rajo; plan minero conjunto con Codelco (Andina-Los Bronces) sellado jun-2026. Fusión Anglo Teck en curso.',
    registration:
      'Único con auto-registro abierto y gratuito: cuestionario Ariba SLP (realm AngloAmerican). Licitaciones como eventos de sourcing en Ariba.',
    portalUrl: 'https://s1-eu.ariba.com/Sourcing/Main/ad/selfRegistration?realm=AngloAmerican',
    portalLabel: 'Auto-registro Ariba SLP',
  },
  {
    id: 'collahuasi',
    name: 'Collahuasi',
    type: 'Mandante minero',
    description:
      'C20+ (desaladora + impulsión) al 99,5% con RCA anulada en may-2026 (obras parciales autorizadas); Nueva Concentradora Rosario en prefactibilidad.',
    registration: 'Puerta de entrada: SICEP. Portales propios post-adjudicación (proveedores.collahuasi.cl).',
    portalUrl: 'http://www.collahuasi.cl/proveedores/',
    portalLabel: 'collahuasi.cl/proveedores + SICEP',
  },
  {
    id: 'teck',
    name: 'Teck / Anglo Teck (Quebrada Blanca)',
    type: 'Mandante minero',
    description:
      'QB en optimización post ramp-up; debottlenecking en estudio (US$100-200M); modificación logística US$141M en trámite.',
    registration:
      'Sin auto-registro público (sistema interno TSS); usa SICEP. Proveedores locales Tarapacá: Red ProNorte (gratuito).',
    portalUrl: 'https://redpronorte.cl/',
    portalLabel: 'Red ProNorte + SICEP',
  },
  {
    id: 'freeport-elabra',
    name: 'Freeport-McMoRan — El Abra',
    type: 'Mandante minero',
    description: 'EIA de Continuidad Operacional por ~US$7.500M (nueva concentradora + desaladora); operación ampliada desde 2033.',
    registration: 'Usuaria de SICEP. Seguimiento del EIA y contactos tempranos de ingeniería.',
    portalUrl: 'https://sicep.cl/',
    portalLabel: 'Vía SICEP',
  },
  {
    id: 'kghm',
    name: 'KGHM / South32 — Sierra Gorda',
    type: 'Mandante minero',
    description: 'Cuarta línea de molienda aprobada (US$725M); construcción 2027-2029 con ~900 empleos peak.',
    registration: 'Usuaria de SICEP. Contacto comercial directo recomendado antes del inicio de obras (inicios 2027).',
    portalUrl: 'https://sicep.cl/',
    portalLabel: 'Vía SICEP',
  },
  {
    id: 'capstone',
    name: 'Capstone Copper (Mantoverde, Santo Domingo)',
    type: 'Mandante minero',
    description: 'Mantoverde Optimizado con puesta en marcha 4T-2026; Santo Domingo (US$2.300M) con FID esperada 4T-2026.',
    registration: 'Usuaria de SICEP (distrito Atacama). Posicionarse antes de la FID de Santo Domingo.',
    portalUrl: 'https://capstonecopper.com/operations/',
    portalLabel: 'capstonecopper.com',
  },
  {
    id: 'enami',
    name: 'ENAMI',
    type: 'Mandante minero',
    description:
      'Modernización de Fundición Paipote (US$1.700M, obras desde oct-2026) y proyecto de litio Salares Altoandinos con Rio Tinto.',
    registration:
      'Licitaciones públicas propias (portal ENAMI y prensa minera). Exige sistema de gestión SSO según su reglamento RESSO.',
    portalUrl: 'https://www.enami.cl/',
    portalLabel: 'enami.cl',
  },
  {
    id: 'novaandino',
    name: 'NovaAndino Litio (Codelco–SQM)',
    type: 'Mandante minero',
    description:
      'JV del Salar de Atacama (>2.500 trabajadores). Proyecto Salar Futuro (US$3.000M, EIA jul-2026) y estudios DLE por US$3.000M adicionales.',
    registration: 'Canales de SQM/Codelco durante la transición; SICEP (SQM es usuaria).',
    portalUrl: 'https://acuerdocodelcosqm.cl/',
    portalLabel: 'acuerdocodelcosqm.cl',
  },
  {
    id: 'albemarle',
    name: 'Albemarle',
    type: 'Mandante minero',
    description: 'Proyecto TED (US$3.100M, EIA mar-2026) y planta La Negra (evaporador térmico US$100M, transición a agua desalada).',
    registration: 'Usuaria de SICEP.',
    portalUrl: 'https://www.albemarle.com/cl/es',
    portalLabel: 'albemarle.com/cl',
  },
  // ── Mandantes energía ──
  {
    id: 'conexion-energia',
    name: 'Conexión Energía (Kimal–Lo Aguirre)',
    type: 'Mandante energía',
    description:
      'Sociedad dueña de la línea HVDC de 1.346 km en construcción (2026-2029). Demanda ITO, QA/QC, END y topografía en 5 regiones.',
    registration: 'Portal de proveedores del proyecto en conexionenergia.com; subcontratos vía Kalpataru (montaje de línea).',
    portalUrl: 'https://conexionenergia.com/kimal-lo-aguirre',
    portalLabel: 'conexionenergia.com',
  },
  {
    id: 'transelec',
    name: 'Transelec',
    type: 'Mandante energía',
    description:
      'Mayor transmisora del país: Tineo-Nueva Ancud (2026), licitación internacional de ampliaciones de subestaciones, socio en Kimal-Lo Aguirre y en negocios de agua (Aguas Horizonte, Centinela).',
    registration: 'SAP Ariba por invitación — gestionar con el área de Abastecimiento (Supply Portal).',
    portalUrl: 'https://www.transelec.cl/supply-portal/',
    portalLabel: 'transelec.cl/supply-portal',
  },
  {
    id: 'isa',
    name: 'ISA Interchile / ISA Vías',
    type: 'Mandante energía',
    description: 'Nueva Lagunas–Kimal (2x500 kV) aprobada; socia de Kimal-Lo Aguirre; concesiones viales (ISA Vías).',
    registration: 'Registro abierto del grupo: plataforma "Mi Proveedor". Viales: proveedoreschile.isavias.com.',
    portalUrl: 'https://app.miproveedor.com/Isa/public',
    portalLabel: 'Mi Proveedor (grupo ISA)',
  },
  {
    id: 'enel',
    name: 'Enel Chile',
    type: 'Mandante energía',
    description: 'Renovables + BESS (Azabache); desmantelamiento de Bocamina I-II en Coronel (licitaciones de demolición por venir).',
    registration: 'Plataforma global WeBUY: registro + calificación por grupo de mercancía.',
    portalUrl: 'https://globalprocurement.enel.com/become-a-supplier',
    portalLabel: 'Enel WeBUY',
  },
  {
    id: 'colbun',
    name: 'Colbún',
    type: 'Mandante energía',
    description: 'BESS Celda Solar (228 MW/912 MWh) y Diego de Almagro Sur; evalúa conversión a gas de Santa María.',
    registration: 'Registro abierto en proveedores.colbun.cl (abastecimiento@colbun.cl) + calificación Achilles.',
    portalUrl: 'https://proveedores.colbun.cl/',
    portalLabel: 'proveedores.colbun.cl',
  },
  {
    id: 'engie',
    name: 'Engie Chile',
    type: 'Mandante energía',
    description:
      'Conversión IEM a gas (jul-2026), BESS Tocopilla inaugurado, BESS Lile (2S-2026), BESS Arica; 7 proyectos lanzados en 3 meses.',
    registration: 'Portal de proveedores engie.cl/proveedores; comunidad RePro/Achilles del sector utilities.',
    portalUrl: 'https://www.engie.cl/proveedores/',
    portalLabel: 'engie.cl/proveedores',
  },
  {
    id: 'aes',
    name: 'AES Andes',
    type: 'Mandante energía',
    description:
      '2.363 MW renovables + BESS en construcción (hub del Salar); proyecto Alba (Angamos a sales fundidas) aprobado con reclamaciones en tribunal.',
    registration: 'SAP Ariba (no usa Achilles).',
    portalUrl: 'https://www.aesandes.com/',
    portalLabel: 'aesandes.com',
  },
  {
    id: 'grenergy',
    name: 'Grenergy',
    type: 'Mandante energía',
    description: 'Oasis de Atacama: el mayor complejo solar + storage en construcción por fases (meta 11 GWh).',
    registration: 'Contacto comercial directo / EPCs del proyecto; proveedores BYD y CATL en baterías.',
    portalUrl: 'https://grenergy.eu/projects/oasis-de-atacama/',
    portalLabel: 'grenergy.eu',
  },
  // ── Mandantes industriales ──
  {
    id: 'enap',
    name: 'ENAP',
    type: 'Mandante industrial',
    description:
      'Plan 2025-2029 de US$3.788M (30% mantención). Licitación de inspección de equipos estáticos 2026-2030 (API 510) para ambas refinerías; estanques nuevos en Bío Bío; fracking Magallanes.',
    registration: 'Registro de proveedores ENAP + Achilles/RePro Chile. Monitorear licitaciones en prensa especializada.',
    portalUrl: 'https://www.enap.cl/',
    portalLabel: 'enap.cl + Achilles/RePro',
  },
  {
    id: 'arauco',
    name: 'Arauco',
    type: 'Mandante industrial',
    description:
      'Capex nuevo en Brasil (Sucuriú). En Chile: línea OSB Trupán-Cholguán (PEM 2T-2026) y ciclo anual de paradas de planta en celulosa.',
    registration: 'Portal de proveedores Arauco; gestión directa con abastecimiento para calendario de paradas.',
    portalUrl: 'https://arauco.com/chile/',
    portalLabel: 'arauco.com',
  },
  {
    id: 'cmpc',
    name: 'CMPC',
    type: 'Mandante industrial',
    description:
      'Capex Chile 2026: US$311M en continuidad operacional y mantención (Laja, Pacífico, Santa Fe). Natureza (Brasil) con decisión a mediados de 2026.',
    registration: 'Portal de proveedores CMPC; gestión directa con abastecimiento para paradas de planta.',
    portalUrl: 'https://www.cmpc.com/',
    portalLabel: 'cmpc.com',
  },
  {
    id: 'epsa',
    name: 'Empresa Portuaria San Antonio (EPSA)',
    type: 'Estatal / Público',
    description: 'Puerto Exterior (US$4.450M): adjudicación de obras de molo y dragado durante 2026.',
    registration: 'Licitación internacional propia; subcontratos con el consorcio adjudicatario (2S-2026).',
    portalUrl: 'https://www.puertosanantonio.com/',
    portalLabel: 'puertosanantonio.com',
  },
  {
    id: 'mop',
    name: 'MOP (DGOP / DGC / DOH)',
    type: 'Estatal / Público',
    description:
      '501 licitaciones de obras (~CLP 900.000M); concesiones 2026 por US$4.145M; embalses Zapallar/Punilla/Duqueco; AIF continuas.',
    registration:
      'Registro de Consultores D.S. 48/1994 (3ª categoría sin experiencia exigida) + Registro de Proveedores del Estado (obligatorio) + licitaciones en mercadopublico.cl y visor MOP.',
    portalUrl: 'https://dgop.mop.gob.cl/contratistas-y-consultores/',
    portalLabel: 'Registro Consultores MOP',
  },
  {
    id: 'sacyr-agua',
    name: 'Sacyr Agua',
    type: 'EPC / Contratista',
    description: 'Adjudicataria de la desaladora de Coquimbo (US$318M, obras 2026-2029). También en Red Aeroportuaria Norte (Sacyr-Cointer).',
    registration: 'Contacto comercial directo para subcontratos de inspección/QA-QC de obra marítima e impulsión.',
    portalUrl: 'https://www.sacyr.com/',
    portalLabel: 'sacyr.com',
  },
  {
    id: 'fluor-salfa',
    name: 'Fluor-Salfa (JV)',
    type: 'EPC / Contratista',
    description: 'EPC de la concentradora de Nueva Centinela (>US$1.000M). 2026 es el año peak con ~13.000 trabajadores.',
    registration: 'Subcontratos de QA/QC, END y topografía; registro de proveedores SalfaCorp y contacto de proyecto.',
    portalUrl: 'https://www.salfacorp.com/',
    portalLabel: 'salfacorp.com',
  },
  {
    id: 'techint',
    name: 'Techint E&C',
    type: 'EPC / Contratista',
    description:
      'EPC de la desaladora Distrito Norte (Codelco), impulsión C20+ (Collahuasi) y FEED de HIF Cabo Negro. Cliente recurrente de servicios de inspección.',
    registration: 'Registro de proveedores Techint; contacto por proyecto.',
    portalUrl: 'https://www.techint.com/',
    portalLabel: 'techint.com',
  },
  {
    id: 'kalpataru',
    name: 'Kalpataru Power Chile',
    type: 'EPC / Contratista',
    description: 'Contratista de montaje de línea (torres/estructuras) de Kimal–Lo Aguirre — 1.346 km por 5 regiones, 2026-2029.',
    registration: 'Subcontratos de END de soldaduras, geotecnia de fundaciones y topografía; contacto de proyecto.',
    portalUrl: 'https://conexionenergia.com/kimal-lo-aguirre',
    portalLabel: 'Vía Conexión Energía',
  },
  {
    id: 'acciona',
    name: 'ACCIONA',
    type: 'EPC / Contratista',
    description: 'Constructora y operadora de la desaladora C20+ de Collahuasi; precalificada (con Hyundai) en Puerto Exterior San Antonio.',
    registration: 'Portal global de proveedores ACCIONA; contacto por proyecto.',
    portalUrl: 'https://www.acciona.com/',
    portalLabel: 'acciona.com',
  },
];
