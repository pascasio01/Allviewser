/** Contratos de acción — puro, usable en cliente y servidor. */

export type ActionContract = {
  actionId: string;
  title: string;
  whoSigns: string;
  whatGetsRecorded: string;
  whatIsNotClaimed: string;
  reversible: boolean;
};

export function spaceActionContract(actionId: string, role: string): ActionContract {
  const catalog: Record<string, Omit<ActionContract, "actionId" | "whoSigns">> = {
    create_incident: {
      title: "Abrir incidencia",
      whatGetsRecorded: "Título, descripción, objeto, actor y sello de tiempo en el diario local.",
      whatIsNotClaimed: "No afirma diagnóstico técnico ni medición real del edificio.",
      reversible: false,
    },
    assign_incident: {
      title: "Asignar incidencia",
      whatGetsRecorded: "Cambio de responsable y estado en la línea de tiempo.",
      whatIsNotClaimed: "No garantiza presencia física del técnico en el sitio.",
      reversible: true,
    },
    attach_evidence: {
      title: "Anexar evidencia",
      whatGetsRecorded: "Nota o foto demo con etiqueta de procedencia.",
      whatIsNotClaimed: "No convierte una imagen simulada en captura en vivo.",
      reversible: false,
    },
    close_incident: {
      title: "Cerrar incidencia",
      whatGetsRecorded: "Cierre firmado por el rol revisor y pasaporte si aplica.",
      whatIsNotClaimed: "No certifica obra real ni conformidad legal externa.",
      reversible: false,
    },
    run_demo_flow: {
      title: "Recorrer el cuidado completo",
      whatGetsRecorded: "Secuencia demo de estados, evidencias y pasaporte en disco local.",
      whatIsNotClaimed: "No ejecuta mantenimiento físico ni notifica a nadie externo.",
      reversible: true,
    },
    reset_demo: {
      title: "Reiniciar demo",
      whatGetsRecorded: "Sustitución del estado demo por la semilla inicial.",
      whatIsNotClaimed: "No borra otros proyectos ni el diario de confianza histórico.",
      reversible: false,
    },
  };
  const base = catalog[actionId] ?? {
    title: actionId,
    whatGetsRecorded: "Un evento firmado en el rastro local.",
    whatIsNotClaimed: "Nada fuera de lo declarado en la ficha de la acción.",
    reversible: true,
  };
  return { actionId, whoSigns: role, ...base };
}
