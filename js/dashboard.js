// Configuración dinámica del backend
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://fnafhs-academy-backend.onrender.com';

// Función para exportar usuarios a Excel
async function exportarUsuarios() {
    try {
        Swal.fire({
            title: 'Exportando usuarios...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const response = await fetch(`${API_URL}/api/exportar/usuarios`);
        
        if (!response.ok) throw new Error('Error al exportar');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const fecha = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `fnafhs_usuarios_${fecha}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Swal.fire('Éxito', 'Usuarios exportados correctamente', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo exportar los usuarios', 'error');
    }
}

// Función para exportar usuarios nuevos
async function exportarUsuariosNuevos(desde) {
    try {
        Swal.fire({
            title: 'Exportando usuarios nuevos...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const response = await fetch(`${API_URL}/api/exportar/usuarios/nuevos?desde=${desde}`);
        
        if (!response.ok) throw new Error('Error al exportar');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const fecha = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `fnafhs_nuevos_usuarios_${fecha}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        Swal.fire('Éxito', 'Usuarios nuevos exportados correctamente', 'success');
    } catch (error) {
        Swal.fire('Error', 'No se pudo exportar los usuarios', 'error');
    }
}

// Función para cerrar modal
function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Función para mostrar alerta de éxito
function mostrarExito(mensaje) {
    Swal.fire('Éxito', mensaje, 'success');
}

// Función para mostrar alerta de error
function mostrarError(mensaje) {
    Swal.fire('Error', mensaje, 'error');
}

// Función para confirmar acción
async function confirmarAccion(mensaje) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
}