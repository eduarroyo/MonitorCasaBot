# MonitorCasaBot
Servicio y bot de Telegram para el sistema MonitorCasa.

MonitorCasa es un sistema de vigilancia para cortes de corriente. El sistema funciona con una serie de clientes web ligeros que realizan solicitudes web periódicas a este servicio, que actualiza los registros de los clientes en una base de datos. El servicio vigila el tiempo desde la última actualización de cada cliente y en caso de que sea demasiado antigua, pone el dispositivo como OFFLINE y avisa a los usuarios de telegram que están vinculados al dispositivo. Cuando el dispositivo offline y el servicio recibe una actualización, lo pone online y avisa también a los usuarios de telegram vinculados.

El bot está basado en [heroku-node-telegram-bot](https://github.com/odditive/heroku-node-telegram-bot)
Ver el [README.md](https://github.com/odditive/heroku-node-telegram-bot/blob/master/README.md) de dicho proyecto para instrucciones sobre cómo probar el bot localmente y desplegarlo en heroku.

Proyecto del cliente: [MonitorCasa_NodeMCU_CL](https://github.com/eduarroyo/MonitorCasa_NodeMCU_CL)