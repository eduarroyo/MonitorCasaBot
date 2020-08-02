# Agosto 2020

## Ideas para investigar:

* Añadir base de datos de sensores/actuadores por cada dispositivo.
* Enviar la IP local del dispositivo en las solicitudes POST y guardarlas en la base de datos. Es sólo para consulta a la hora de configurar el id.
* Investigar modo de funcionamiento lento: asociado a la programación de un enchufe inteligente que se enciende sólo x veces al día activando el router y el dispositivo al mismo tiempo, de manera que podemos comprobar que hay corriente sin mantener el router encendido todo el día (cuando estamos fuera de casa un periodo largo).
* Investigar baterías con señal de carga vs SAIs para alimentar router y cargador.
* Investigar modem GPRS.
* Investigar zigbee, mosquitto, nodered, grafana, influxdb, espurna.

# Julio 2020

Tenemos el nuevo cliente que corre sobre una placa NodeMCU. El cliente se conecta a una wifi y envía su señal de watchdog periódicamente mediante una mediante una solicitud POST.
Ahora el cliente es mucho más barato y es fácil que en poco tiempo tengamos varios funcionando. Cada usuario puede necesitar más de un dispositivo y el mantenimiento puede ser más frecuente. Dada la situación se plantean los siguientes cambios

## 0 - Cambios urgentes en el programa del NodeMCU
- [x] 0.1 Almacenar/recuperar el identificador en/de la memoria persistente.
- [x] 0.2 Enviar una solicitud inmediatamente al modificar el identificador del dispositivo.
- [x] 0.3 Enviar una solicitud inmediatamente encenderse el dispositivo, siempre y cuando la configuración sea correcta.
- [x] 0.4 Averiguar por qué está respondiendo con código 400 mientras que responde 200 cuando hacemos la misma solicitud desde POSTMAN.

## 1 - Varios dispositivos por usuario/Varios usuarios por dispositivo
- [x] 1.1 Cada dispositivo tendrá un identificador único configurado por el usuario (ya no vale el id de telegram).
- [x] 1.2 El identificador se establece la primera vez mediante una solicitud GET local contra la IP del dispositivo http://192.168.1.XXX?id=mi-primer-monitor-id
- [x] 1.3 El identificador se debe almacenar en la memoria persistente del dispositivo NodeMCU.
- [ ] 1.4 Una vez asociado el dispositivo al usuario, éste podrá modificar el identificador mediante un comando de telegram.
- [ ] 1.5 Al registrarse un usuario (/start) ya no le decimos su id de telegram. Actualizar las instrucciones del sistema.
- [ ] 1.6 Cambiar el campo usuarioId de la base de datos de dispositivos por un array llamado usuariosVinculados. Guardará los ids de telegram de los usuarios que tengan el dispositivo vinculado. Se controlará que los ids que contenga el array sean únicos.
- [ ] 1.7 Comando /vincular
  - [ ] 1.7.1 El bot pide el identificador del dispositivo para vincular.
  - [ ] 1.7.2 El usuario introduce el identificador
  - [ ] 1.7.3 El bot busca por identificador entre los dispositivos sin vincular. Si no lo hay, contesta con mensaje. Si lo hay, añade el id de telegram del usuario al campo el campo usuariosVinculados (si no estaba ya).
  - [ ] 1.7.4 El bot envía un informe del estado del dispositivo al usuario junto con el mensaje de que el dispositivo está vinculado.
- [ ] 1.8. Comando /desvincular
  - [ ] 1.8.1 El bot muestra una lista de etiquetas con los dispositivos del usuario.
  - [ ] 1.8.2 El usuario pulsa uno de los dispositivos.
  - [ ] 1.8.3 El bot actualiza el registro del dispositivo borrando el el id de telegram del array de usuarios vinculados.

## 2 - Configuración remota del dispositivo
- [ ] 2.1 La configuración vigente del dispositivo se enviará como respuesta a las solicitudes POST.
- [ ] 2.2 El dispositivo almacenará la configuración en la memoria EEPROM de manera que sea persistente tras un reinicio.
- [ ] 2.3 El usuario podrá modificar la configuración mediante un comandos del bot de telegram. Por ejemplo:
    - [ ] 2.3.1 El usuario entra en telegram /configuracion <monitor-id> 
    - [ ] 2.3.2 El bot muestra una lista etiquetas, correspondientes a los diferentes parámetros de configuración
    - [ ] 2.3.3 El usuario elige una de las etiquetas
    - [ ] 2.3.4 El bot muestra el valor actual y pide el valor nuevo
    - [ ] 2.3.5 El usuario entra el nuevo valor
    - [ ] 2.3.6 El bot valida la entrada. Si no es válida vuelve a pedir el valor. Si es válida la almacena.
    - [ ] 2.3.7 El bot envía el valor actualizado de configuración en la siguiente solicitud de actualización del dispositivo.
    - [ ] 2.3.8 Posibilidad de marcar el registro cuando haya sido modificado para no tener que enviarlo cada vez.
    - [ ] 2.3.9 El dispositivo recibe la nueva configuración, la almacena y actualiza la configuración en memoria.
- [ ] 2.4 Etiquetas de configuración:
    - [ ] 2.4.1 Periodo máximo sin comunicar [entero, minutos] (este es del bot, lo antiguo que debe ser el timestamp para que el bot dé alarma).
    - [ ] 2.4.2 Identificador del dispositivo [cadena de texto]
    - [ ] 2.4.3 Periodo de actualización [entero, minutos] (el periodo de las solicitudes POST del dispositivo).

---

# Septiembre 2019
Emparejar en las entradas de la base de datos el identificador de telegram con el identificador del cliente raspberry pi.
Lo más fácil sería utilizar como MonitorId el identificador de telegram, y así tenemos sólo un campo para buscar.

En bot.procesarEstados en bot.js
Hay que añadir un campo a la base de datos para mostrar cuándo se envió el último aviso al usuario.
Hay que añadir un campo a la base de datos para mostrar la última caída detectada.

[BOT] Caso 1: Nuevo registro de usuario [COMPLETADO]
Cuando un usuario se da de alta en el bot (/start)
1. Insertar/Actualizar un registro en la base de datos para el id de telegram.

[BOT] Caso 2: Notificar un corte de corriente. [COMPLETADO]
SI
    1. la fecha de última actualización es más antigua que un tiempo límite
    Y
    2. La fecha de última caída es anterior a la fecha de la última actualización
ENTONCES
    1. Enviar mensaje al usuario indicando que el sistema está caído en la fecha actual.
    2. Actualizar el registro actualizando la fecha de última caída y la fecha de última notificación.
FIN

[BOT] Caso 3: Comprobar última actualización [COMPLETADO]
Si recibimos el comando /comprobar
1. Buscar el monitor en la base de datos
2. SI El monitor está registrado
    2a.1 SI El monitor tiene actualización
        2a.1a.1 Enviar mensaje al usuario con los datos del registro: monitorid, última actualización y estado (con las mismas condiciones de siempre: online/offline si la última actualización está dentro/fuera del periodo).
    2a.1 SI NO
        2a.1b.1 Enviar mensaje al usuario indicando que el monitor no ha enviado ninguna acutalización hasta la fecha.
2. SI NO
    2b.1 Enviar mensaje al usuario diciendo que el monitor no está registrado.
2. FIN

[BOT] Caso 4: Baja de un usuario [COMPLETADO]
Si un usuario desactiva el bot, hay que borrar su registro correspondiente.

[WEB] Caso 1: Recibir solicitud de actualización [COMPLETADO]
1. Recibimos actualización de un monitor.
2. Buscar el monitor en la base de datos.
3. SI El monitor está registrado
    3.1 Actualizar la fecha de última actualización en el registro.
    3.2. SI
        3.2a.1. La fecha de última actualización es más reciente que la de la última caída
        Y
        3.2a.2. La fecha de última notificación es anterior a la de última caída
    3.2 ENTONCES
        3.2b.1. Enviar mensaje al usuario indicando que el el sistema está restituido en la fecha acual después de la (fecha de última caída).
        3.2b.2. Actualizar el registro poniendo la fecha de última notificación.
    3.2 FIN SI
3. FIN SI