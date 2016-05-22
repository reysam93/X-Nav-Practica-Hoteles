# X-Nav-Practica-Hoteles
Repositorio para la práctica final de DAT/AT. Curso 2015-2016
Pruébala <a href='http://reysam93.github.io/X-Nav-Practica-Hoteles/'>aquí.</a>

## Datos
Nombre: Samuel Rey Escudero
Titulación: Tecnologías de la Telecomunicación.
Usuario en Github: reysam93

## Peculiaridades
Firefox OS: El movimiento de draggable no se reconoce, lo reconoce para el scroll en su lugar. Además, la api de Google+ no funciona en el simulador del movil.

Usando Chrome como navegador, no funciona la función de getCurrentPosition() de Leaflet dado que no considera seguro el origen (el servidor de Github).

API Facebook: no deja registrar la url reysam93.github.io/X-Nav-Practica-Hoteles como dominio para mi aplicación porque no lo considera segura, así que el login con Facebook no funcionará desde Github.

Al menos con mi versión de Firefox el css no se carga bien cuando el servidor es Github, pero si desde localhost. Con Chrome se ve siempre bien el css.

## FUncionalidad optativa
* Uso de localStorage para almacenar el último hotel seleccionado.
* Uso del history API para añadir al historial una entrada cada vez que se pulsa en alguna pestaña, permitiendo navegar hacia atrás.
* Uso de la API de Facebook para iniciar sesión en la aplicación con la cuenta de Facebook.
* La aplicación funciona offline.
* Pueden borrarse las colecciones y los hoteles de las colecciones.
* La aplicación se ha adaptado para que pueda usarse en terminales con Firefox OS como aplicación web.
* Se ha utilizado CSS3 para la interfaz y elementos de HTML5 como la etiqueta footer.
* Se han tenido en cuenta aspectos de optimización como poner todos los scripts al final para que no bloqueen la carga, usar cdns siempre que ha sido posible, así como versiones minimizadas de las librerías, y se ha maximizado el uso de la cache.

## Video de la funcionalidad básica
<a href='https://youtu.be/FdT4Mp-7pYY'>https://youtu.be/FdT4Mp-7pYY</a>

## Video de la funcionalidad optativa
<a href='https://youtu.be/Cd1SoMEqV6I'>https://youtu.be/Cd1SoMEqV6I</a>
