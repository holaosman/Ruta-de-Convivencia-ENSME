export type MatchLevel = 'alto' | 'medio' | 'bajo';
export type RouteClassification = 'Tipo I' | 'Tipo II' | 'Tipo III' | 'Otra ruta' | 'No determinada';

export interface ManualClassification {
  categoria: string;
  conducta_relacionada: string;
  explicacion: string;
  articulo: string;
  numeral: string;
  pagina_o_seccion: string;
  fragmento: string;
  nivel_coincidencia: MatchLevel;
}

export interface RouteAnalysis {
  clasificacion: RouteClassification;
  razones: string[];
  informacion_faltante: string[];
}

export interface ConductStep {
  paso: number;
  accion: string;
  responsable: string;
  momento: string;
  documento: string;
  fundamento: string;
}

export interface RelatedNorm {
  key?: string;
  nombre: string;
  numero?: string;
  anio: string;
  articulo_apartado: string;
  relacion: string;
  enlace_oficial: string;
  ultima_verificacion: string;
}

export interface ExternalRoute {
  requiere_valoracion: boolean;
  entidades_posibles: string[];
  explicacion: string;
}

export interface AnalysisResult {
  resumen_objetivo: string;
  clasificacion_manual: ManualClassification;
  ruta_convivencia: RouteAnalysis;
  conducto_regular: ConductStep[];
  acciones_pedagogicas: string[];
  normas_relacionadas: RelatedNorm[];
  posible_ruta_externa: ExternalRoute;
  advertencias: string[];
  manual_version?: string;
  generated_by?: 'gemini' | 'fallback';
}

export interface MatrixRecord {
  id: string;
  categoria_manual: string;
  ruta_manual: string;
  articulo: string;
  numeral: string;
  pagina_pdf: number;
  seccion: string;
  conducta: string;
}
