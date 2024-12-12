document.addEventListener('DOMContentLoaded', () => {
    const productId = document.getElementById('product-id').value; // ID del producto
    const starsContainer = document.getElementById('star-rating-container'); // Contenedor de las estrellas
    console.log("ppppp", productId)
    console.log("AAAAA",starsContainer)
    // Obtener y mostrar la calificación actual del producto
    fetch(`/api/ratings/${productId}`)
        .then((response) => response.json())
        .then((data) => {
            const currentRating = data.rating || 0;
            renderStars(starsContainer, currentRating, productId); // Mostrar las estrellas según la calificación actual
        })
        .catch((err) => {
            console.error('Error al cargar las estrellas:', err);
        });

    // Función para renderizar las estrellas
    function renderStars(container, rating, productId) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `
                <i class="bi bi-star${i <= rating ? '-fill' : ''}" 
                   style="color: #FFD700; font-size: 25px; cursor: pointer;" 
                   data-star="${i}" 
                   data-id="${productId}">
                </i>`;
        }
        container.innerHTML = starsHtml;

        // Añadir eventos de clic a las estrellas
        container.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', handleStarClick);
        });
        console.log("AAAAA",container)
        
    }

    // Función que maneja el clic en una estrella
    function handleStarClick(event) {
        const selectedRating = parseInt(event.target.dataset.star, 10); // Obtener el valor de la estrella seleccionada
        const productId = event.target.dataset.id; // Obtener el ID del producto

        // Actualización optimista en la interfaz: actualizamos las estrellas visibles con el nuevo valor
        renderStars(starsContainer, selectedRating, productId);

        // Enviar la nueva calificación al servidor
        fetch(`/api/ratings/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newRate: selectedRating }), // Enviar la calificación seleccionada
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Calificación actualizada:', data);
        })
        .catch((err) => {
            console.error('Error al actualizar la calificación:', err);
            alert('No se pudo actualizar la calificación. Intenta de nuevo.');
        });
    }
});

