const button = document.getElementById('j-button');

function OnButtonClick () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    alert(`Ширина экрана: ${width}px\nВысота экрана: ${height}px`);
}

button.addEventListener('click', OnButtonClick);
