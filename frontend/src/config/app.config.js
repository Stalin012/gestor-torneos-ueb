export const APP_CONFIG = {
    name: 'Gestor de Torneos Deportivos',
    version: '1.0.0',
    institution: 'Universidad Estatal de Bolívar',
    apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    pagination: { defaultPageSize: 15, pageSizeOptions: [10, 15, 20, 50, 100] },
    cache: { ttl: 5 * 60 * 1000 },
    partidoEstados: ['Programado', 'En Juego', 'Finalizado'],
    torneoEstados: ['Activo', 'Finalizado'],
    roles: { ADMIN: 'admin', REPRESENTANTE: 'representante', ARBITRO: 'arbitro', USER: 'user' },
    files: { maxSize: 2048, allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'], allowedDocTypes: ['application/pdf'] },
    messages: {
        success: { created: 'Registro creado exitosamente', updated: 'Registro actualizado exitosamente', deleted: 'Registro eliminado exitosamente' },
        error: { generic: 'Ocurrió un error. Intente nuevamente', network: 'Error de conexión. Verifique su internet', unauthorized: 'No tiene permisos para esta acción', notFound: 'Recurso no encontrado' }
    }
};

export default APP_CONFIG;
