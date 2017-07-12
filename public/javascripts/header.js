jQuery_2_1_3(window).load(function(){
	if (jQuery_2_1_3("#typo").length){
		jQuery_2_1_3("#typo").type("Intermine Registry", 500);
		animText();

	}

});

/* FUNCIONES PARA LA ANIMACION DEL TEXTO EN HEADER */

/* Inicializacion de la animacion
* @element es el contenedor del texto a animar. Inicialmente debe estar vacio
* @text es el texto que vamos a animar
* @delay es el tiempo de espera antes de empezar la animacion */
jQuery_2_1_3.fn.type = function(text, delay) {
	var element = jQuery_2_1_3(this);
	setInterval('cursorAnimation()', 100);
	setTimeout(function() { anim(element, text); }, delay);
}
/* Animacion del cursor*/
function cursorAnimation() {
	if (jQuery_2_1_3("#cursor").length){
		jQuery_2_1_3("#cursor").animate({
			opacity: 0
		}, 'fast', 'swing').animate({
			opacity: 1
		}, 'fast', 'swing');
	}
}
/* Animacion del titulo */
function anim(element, text) {
	if (jQuery_2_1_3(element).html().length < text.length) {
		jQuery_2_1_3(element).html(text.substring(0, (jQuery_2_1_3(element).html().length + 1)));
		setTimeout(function() {
			anim(element, text);
		}, 100);
	}
}

function animText(){
	$('.header-text').animate({opacity: 1}, 'slow', 'linear');
}
