/**
 * Mobile Keyboard Bridge para Godot 3.x HTML5
 * 
 * Este script resuelve el problema del teclado táctil en dispositivos móviles
 * creando inputs HTML invisibles que se sincronizan con los LineEdit de Godot.
 */

(function() {
	'use strict';

	console.log('🎹 Mobile Keyboard Bridge inicializando...');

	// Estado global
	let activeInput = null;
	let hiddenInput = null;
	let isKeyboardOpen = false;
	let godotCallbacks = {};

	// Detectar si estamos en dispositivo móvil
	function isMobileDevice() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			   (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
	}

	// Detectar si es iOS
	function isIOS() {
		return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	}

	// Crear input HTML invisible
	function createHiddenInput() {
		if (hiddenInput) return hiddenInput;

		hiddenInput = document.createElement('input');
		hiddenInput.type = 'text';
		hiddenInput.id = 'godot-mobile-keyboard-input';
		
		// Estilos para hacerlo invisible pero funcional
		Object.assign(hiddenInput.style, {
			position: 'absolute',
			left: '-9999px',
			top: '50%',
			width: '1px',
			height: '1px',
			opacity: '0',
			fontSize: '16px', // Importante: previene zoom en iOS
			padding: '0',
			margin: '0',
			border: 'none',
			outline: 'none',
			background: 'transparent',
			zIndex: '-1'
		});

		// Prevenir comportamientos por defecto
		hiddenInput.autocomplete = 'off';
		hiddenInput.autocorrect = 'off';
		hiddenInput.autocapitalize = 'off';
		hiddenInput.spellcheck = false;

		// Event listeners
		hiddenInput.addEventListener('input', onInputChange);
		hiddenInput.addEventListener('blur', onInputBlur);
		hiddenInput.addEventListener('focus', onInputFocus);
		
		// Prevenir cierre del teclado en iOS
		if (isIOS()) {
			hiddenInput.addEventListener('touchstart', function(e) {
				e.stopPropagation();
			});
		}

		document.body.appendChild(hiddenInput);
		console.log('✅ Hidden input creado');
		
		return hiddenInput;
	}

	// Cuando el input cambia
	function onInputChange(e) {
		const value = e.target.value;
		console.log('📝 Input cambió:', value);
		
		// Enviar a Godot
		if (window.GodotMobileKeyboard) {
			window.GodotMobileKeyboard.onTextChanged(value);
		}
	}

	// Cuando pierde el foco
	function onInputBlur(e) {
		console.log('❌ Input perdió foco');
		isKeyboardOpen = false;
		
		if (window.GodotMobileKeyboard) {
			window.GodotMobileKeyboard.onKeyboardClosed();
		}
	}

	// Cuando gana el foco
	function onInputFocus(e) {
		console.log('✅ Input ganó foco');
		isKeyboardOpen = true;
		
		if (window.GodotMobileKeyboard) {
			window.GodotMobileKeyboard.onKeyboardOpened();
		}
	}

	// API pública para Godot
	window.GodotMobileKeyboard = {
		// Abrir teclado
		open: function(initialText, inputType) {
			if (!isMobileDevice()) {
				console.log('ℹ️ No es dispositivo móvil, ignorando');
				return false;
			}

			console.log('🎹 Abriendo teclado móvil:', { initialText, inputType });

			const input = createHiddenInput();
			
			// Configurar tipo de input
			switch(inputType) {
				case 'number':
				case 'numeric':
					input.type = 'number';
					input.inputMode = 'numeric';
					input.pattern = '[0-9]*';
					break;
				case 'email':
					input.type = 'email';
					input.inputMode = 'email';
					break;
				case 'tel':
				case 'phone':
					input.type = 'tel';
					input.inputMode = 'tel';
					break;
				case 'url':
					input.type = 'url';
					input.inputMode = 'url';
					break;
				default:
					input.type = 'text';
					input.inputMode = 'text';
			}

			// Establecer valor inicial
			input.value = initialText || '';
			
			// Hacer visible temporalmente para iOS (bug fix)
			if (isIOS()) {
				input.style.left = '50%';
				input.style.opacity = '0.01'; // Casi invisible
			}

			// Forzar focus con delay
			setTimeout(function() {
				input.focus();
				input.click();
				
				// Volver a ocultar en iOS
				if (isIOS()) {
					setTimeout(function() {
						input.style.left = '-9999px';
						input.style.opacity = '0';
					}, 100);
				}
			}, 50);

			return true;
		},

		// Cerrar teclado
		close: function() {
			if (hiddenInput) {
				console.log('🔒 Cerrando teclado');
				hiddenInput.blur();
			}
		},

		// Obtener texto actual
		getText: function() {
			return hiddenInput ? hiddenInput.value : '';
		},

		// Establecer texto
		setText: function(text) {
			if (hiddenInput) {
				hiddenInput.value = text;
			}
		},

		// Verificar si el teclado está abierto
		isOpen: function() {
			return isKeyboardOpen;
		},

		// Callbacks desde Godot
		onTextChanged: function(text) {
			console.log('📤 Texto enviado a Godot:', text);
			// Godot llamará esto desde GDScript
		},

		onKeyboardOpened: function() {
			console.log('📱 Teclado abierto');
			// Notificar a Godot
		},

		onKeyboardClosed: function() {
			console.log('📱 Teclado cerrado');
			// Notificar a Godot
		}
	};

	// Inicializar cuando el DOM esté listo
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			if (isMobileDevice()) {
				createHiddenInput();
				console.log('✅ Mobile Keyboard Bridge listo');
			}
		});
	} else {
		if (isMobileDevice()) {
			createHiddenInput();
			console.log('✅ Mobile Keyboard Bridge listo');
		}
	}

	// Log de información
	console.log('📱 Dispositivo móvil:', isMobileDevice());
	console.log('🍎 iOS:', isIOS());
	console.log('👆 Touch points:', navigator.maxTouchPoints);

})();

