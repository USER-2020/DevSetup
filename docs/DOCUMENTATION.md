# Guía de uso de DevSetup

DevSetup es una aplicación local para revisar el entorno de desarrollo, preparar instalaciones con proveedores aprobados y guardar referencias a proyectos. No envía el código, las credenciales ni los perfiles a la nube.

## Flujo recomendado

1. Ejecuta **Scan system** para actualizar el inventario del equipo.
2. Revisa el resultado en **Dashboard**, **System Scan** o **Version Manager**.
3. En **Software Library**, activa las herramientas faltantes que deseas preparar.
4. Genera un **Dry Run** y revísalo en **Installation Queue**.
5. Ejecuta el plan solo después de comprobar sus comandos y advertencias.

## Módulos

### Dashboard

Es el resumen del último análisis del sistema.

- **Installed tools**: cantidad de herramientas detectadas como instaladas.
- **Missing tools**: cantidad de herramientas del catálogo que no se encontraron.
- **Package provider**: administrador de paquetes disponible, por ejemplo WinGet en Windows o Homebrew en macOS. En macOS se buscan las rutas estándar de Homebrew para Apple Silicon e Intel, además de `PATH`, por lo que abrir DevSetup desde Finder no debe impedir su detección.
- **System memory**: memoria RAM total del sistema.
- **Environment overview**: sistema operativo, arquitectura, almacenamiento disponible y hora del último análisis.

### System Scan

Muestra el inventario detallado del software conocido por DevSetup. Comprueba las rutas incluidas en `PATH` y ubicaciones de instalación aprobadas por el catálogo. Para cada herramienta indica su versión, estado y ruta cuando puede detectarla.

El análisis es de solo lectura: no instala, actualiza, inicia ni elimina software.

### Software Library

Contiene las herramientas faltantes que tienen un método de instalación compatible para la plataforma actual.

- El interruptor activa o desactiva una herramienta dentro del plan.
- **Prepare dry run** crea una vista previa de los comandos; no realiza cambios.
- Las herramientas solo usan identificadores definidos en el catálogo interno; la interfaz no acepta comandos ni URL arbitrarias.

### Version Manager

Muestra el inventario local de versiones y ofrece un flujo controlado para PHP en macOS.

- Muestra la versión reportada por la herramienta, su ejecutable y el origen de detección.
- **All tools**, **Detected** y **Needs review** permiten filtrar el inventario.
- El selector permite preparar PHP 8.1, 8.2, 8.3, 8.4 o 8.5. Cada opción crea un Dry Run con dos pasos visibles: instalar la fórmula correspondiente y activarla como el comando `php` predeterminado. Solo el plan LIVE, aprobado explícitamente, modifica el equipo.
- Tras la activación, DevSetup exige que el comando `php` activo reporte la versión seleccionada; si no, el trabajo queda en **CHECK REQUIRED**.
- El cambio de versión de PHP requiere Homebrew y actualmente está disponible solo en macOS. Las demás herramientas permanecen en modo de consulta.

### Environments

Guarda referencias locales de proyectos para recordar su configuración.

- Almacena nombre, carpeta, referencia opcional a un archivo `.env`, notas y herramientas usadas.
- **Local only** significa que el perfil se guarda únicamente en los datos locales de DevSetup.
- El contenido del archivo `.env` nunca se lee ni se almacena.
- **Open in VS Code** abre la carpeta guardada y **Open .env** abre el archivo con Visual Studio Code cuando está disponible.

### Installation Queue

Es el punto de revisión antes de instalar.

- **Installation plan** muestra las acciones, argumentos y advertencias aprobados.
- **Refresh plan** vuelve a crear la simulación de las herramientas seleccionadas.
- **Install selected tools** convierte la simulación revisada en un plan LIVE y lo ejecuta. El sistema operativo sigue mostrando sus propios avisos de permisos; DevSetup no los omite.
- Un trabajo **SIMULATED** no instaló software. Un trabajo **VERIFIED** fue confirmado con el ID exacto del paquete por Homebrew o WinGet; **CHECK REQUIRED** significa que el comando terminó, pero la confirmación del proveedor falló y debe revisarse.
- Durante un plan LIVE, la cola se actualiza por herramienta con los estados de preparación, instalación y verificación, antes de mostrar el resultado final.
- En macOS, un toast muestra en tiempo real cuándo DevSetup está comprobando Homebrew y confirma si está disponible antes de iniciar cualquier instalación.
- Si Homebrew está instalado pero DevSetup no lo detecta, vuelve a analizar el sistema después de actualizar a una versión que incluya la detección de `/opt/homebrew/bin/brew` y `/usr/local/bin/brew`.
- Las aplicaciones gráficas de macOS, como Visual Studio Code y GitHub Desktop, se instalan y verifican como Homebrew **casks**, no como fórmulas de terminal.

### Activity Logs

Es una bitácora local de las operaciones que DevSetup realiza sobre el equipo.

- Registra análisis del sistema, preparación y resultado de planes, y acciones sobre entornos locales.
- Los filtros separan actividad de **Sistema**, **Instalación** y **Entornos**; **Errores** reúne los fallos de cualquier categoría.
- Un fallo de proveedor al ejecutar una instalación se registra como un error de instalación, separado de las advertencias y simulaciones.
- No lee el Visor de eventos de Windows, la consola, ni registros de otras aplicaciones, para evitar exponer información ajena o sensible.

### Settings

Guarda preferencias locales que afectan el comportamiento actual de DevSetup.

- **Analizar el sistema al iniciar** decide si se ejecuta un análisis automático al abrir la aplicación.
- **Duración de las notificaciones** controla el tiempo de cierre automático de los toasts.
- **Historial de actividad** limita la cantidad de registros locales visibles y conservados: 100, 300 o 1000.
- **Incluir nombres de proyectos en los registros** permite ocultar el nombre de nuevos perfiles guardados en Activity Logs.

### Services

Este módulo está visible como preparación para una futura versión, pero todavía no realiza acciones.

- **Services**: incorporará detección y control seguro de servicios compatibles.

## Estados y términos

| Término | Significado |
| --- | --- |
| **Installed** | La herramienta y al menos una instalación fueron detectadas. |
| **Missing** | No se detectó la herramienta, pero existe un método de instalación compatible. |
| **Multiple versions** | Se encontraron varias ubicaciones o versiones de la herramienta. |
| **Needs verification** | El análisis no pudo confirmar de forma segura el estado de la herramienta. |
| **Unsupported** | No hay un proveedor de instalación compatible para la plataforma actual. |
| **Dry Run** | Simulación que valida y muestra el plan sin instalar software. |
| **LIVE** | Plan que está listo para ejecutarse después de una confirmación explícita. |
| **VERIFIED** | El proveedor de paquetes confirmó que el paquete catalogado quedó instalado. |
| **CHECK REQUIRED** | No fue posible confirmar la instalación; no se presenta como completada. |

## Límites actuales

DevSetup no anuncia como disponibles funciones que todavía no implementa. En esta versión no controla servicios, no compara versiones contra catálogos oficiales ni activa perfiles de proyecto.
