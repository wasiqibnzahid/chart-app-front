
---

## English Version

# Information about the Code
React + TS + VITE
```
npm install
npm run dev
```

# Setting Up Two EC2 Instances

This guide walks you through setting up two EC2 instances on AWS, both running Ubuntu. One instance hosts both frontend and backend applications, while the second instance runs the backend temporarily before shutting down.

## Prerequisites

- AWS account with permissions to create EC2 instances  
- SSH access to the instances  
- Installed git, tmux, nodejs, npm, python3-venv  
- Basic knowledge of shell scripting and AWS EC2 management  

## Instance 1: Full Stack Setup

1. **Create an Ubuntu EC2 Instance**  
   Ensure ports 3000 (Frontend) and 8000 (Backend) are open in security group settings. Select an appropriate instance type based on your application requirements.

2. **SSH into the Instance**  
   ```
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Clone the Repositories**  
   ```
   git clone <frontend-repo-link> ~/chart-app-front/
   git clone <backend-repo-link> ~/chart-backend/
   ```

4. **Install Node.js and NPM**  
   ```
   sudo apt update
   sudo apt install -y nodejs npm
   ```

5. **Set Up Backend Environment**  
   ```
   sudo apt install -y python3-venv
   cd ~/chart-backend/
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

6. **Connect EC2 Instance to RDS Database**  

   Go to the AWS Console.  
   Navigate to RDS > Databases, select your database, and choose Connectivity & security.  
   Under the EC2 Connect section, choose **Add EC2 instance** and select the instance that should have access.  
   Save changes, and AWS will automatically configure security settings to allow this instance to connect to the RDS database.

   **Grant S3 Access to the First EC2 Instance**  

   Navigate to IAM > Roles in the AWS Console.  
   Create a new role and attach the AmazonS3FullAccess policy (or a custom policy with specific permissions).  
   Attach this role to the first EC2 instance.  
   Verify access by running the following command on the instance:
   ```
   aws s3 ls s3://your-bucket-name
   ```

7. **Create Startup Script**  
   ```
   vi ~/script.sh
   ```
   Paste the following content:
   ```
   #!/bin/bash

   # Change to the directory where your projects are located
   cd ~/chart-app-front/
   # Start a new tmux session named 'dev-session' and run npm in the first window
   tmux new-session -d -s dev-session 'npm install && npm run dev'

   # Create a new tmux window in the same session and run Django development server
   tmux new-session -d -s dev-session-be 'cd ~/chart-backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000'
   ```

8. **Install tmux**  
   ```
   sudo apt-get update
   sudo apt-get install -y tmux
   ```

9. **Set Up Crontab to Run the Script at Reboot**  
   ```
   crontab -e
   ```
   Add this line:
   ```
   @reboot ~/script.sh
   ```

## Instance 2: Backend Only

1. **Create Another Ubuntu EC2 Instance**  
   Choose an instance type that fits the backend processing needs.

2. **SSH into the Second Instance**  
   ```
   ssh -i your-key.pem ubuntu@your-second-instance-ip
   ```

3. **Clone the Backend Repository**  
   ```
   git clone <backend-repo-link> ~/chart-backend/
   ```

4. **Set Up Virtual Environment**  
   ```
   cd ~/chart-backend/
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Connect EC2 Instance to RDS Database**  
   Follow the same steps outlined in Instance 1 to connect the second EC2 instance to the RDS database using AWS EC2 Connect.

6. **Create Startup Script**  
   ```
   vi /home/ubuntu/startup_script.sh
   ```
   Paste the following content:
   ```
   #!/bin/bash

   # Navigate to the backend directory
   cd /home/ubuntu/chart-backend || exit

   # Start a new tmux session and run the app
   tmux new-session -d -s my_session 'bash -c ". venv/bin/activate; python manage.py run_app; sudo shutdown -h"'
   ```

7. **Set Up Crontab to Run the Script at Reboot**  
   ```
   crontab -e
   ```
   Add this line:
   ```
   @reboot /home/ubuntu/startup_script.sh
   ```

8. **Shut Down the Second Machine After Execution**  
   The script automatically shuts down the instance after running. You can manually start the instance using AWS Management Console or CLI when needed.

9. **Add Instance ID to Lambda Function**  
   Retrieve the instance ID and update the Lambda function to include the instance ID for reactivation when necessary.

## Setting Up Environment Variables

The backend project requires environment variables for database and storage configuration. Add these to `~/.bashrc` or a `.env` file:
```
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=your-db-port
DB_NAME=your-db-name
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_REGION=your-region
```
Run:
```
source ~/.bashrc
```

## Additional Notes

### Monitoring and Logging

- Use `tmux ls` to check running tmux sessions.
- Use `tmux attach -t session_name` to view a running session.
- Consider setting up AWS CloudWatch for logging application behavior.

### Security Considerations

- Keep SSH keys secure and disable password authentication.
- Regularly update instance packages using `sudo apt update && sudo apt upgrade -y`.
- Restrict inbound traffic only to necessary ports.
- Ensure EC2 instances have the necessary IAM roles for database and S3 access.

## Conclusion

After completing these steps, Instance 1 runs the full-stack application continuously, while Instance 2 runs backend processes before shutting down. The Lambda function can restart Instance 2 when necessary. By following best practices for monitoring, security, and automation, you ensure a reliable and efficient deployment setup.

---

## Versión en Español

# Información sobre el Código
React + TS + VITE
```
npm install
npm run dev
```

# Configuración de Dos Instancias EC2

Esta guía lo guía a través de la configuración de dos instancias EC2 en AWS, ambas ejecutando Ubuntu. Una instancia aloja tanto las aplicaciones de frontend como de backend, mientras que la segunda instancia ejecuta temporalmente el backend antes de apagarse.

## Requisitos Previos

- Cuenta de AWS con permisos para crear instancias EC2  
- Acceso SSH a las instancias  
- Git, tmux, nodejs, npm, python3-venv instalados  
- Conocimientos básicos de scripting en shell y gestión de EC2 en AWS  

## Instancia 1: Configuración Full Stack

1. **Crear una Instancia EC2 con Ubuntu**  
   Asegúrese de que los puertos 3000 (Frontend) y 8000 (Backend) estén abiertos en la configuración del grupo de seguridad. Seleccione un tipo de instancia apropiado según los requisitos de su aplicación.

2. **Conéctese por SSH a la Instancia**  
   ```
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Clone los Repositorios**  
   ```
   git clone <frontend-repo-link> ~/chart-app-front/
   git clone <backend-repo-link> ~/chart-backend/
   ```

4. **Instale Node.js y NPM**  
   ```
   sudo apt update
   sudo apt install -y nodejs npm
   ```

5. **Configure el Entorno Backend**  
   ```
   sudo apt install -y python3-venv
   cd ~/chart-backend/
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

6. **Conecte la Instancia EC2 a la Base de Datos RDS**  

   Vaya a la Consola de AWS.  
   Navegue a RDS > Bases de datos, seleccione su base de datos y elija "Conectividad y seguridad".  
   En la sección EC2 Connect, elija **Agregar instancia EC2** y seleccione la instancia que debe tener acceso.  
   Guarde los cambios, y AWS configurará automáticamente los ajustes de seguridad para permitir que esta instancia se conecte a la base de datos RDS.

   **Conceda Acceso a S3 a la Primera Instancia EC2**  

   Navegue a IAM > Roles en la Consola de AWS.  
   Cree un nuevo rol y adjunte la política AmazonS3FullAccess (o una política personalizada con permisos específicos).  
   Adjunte este rol a la primera instancia EC2.  
   Verifique el acceso ejecutando el siguiente comando en la instancia:
   ```
   aws s3 ls s3://your-bucket-name
   ```

7. **Cree un Script de Inicio**  
   ```
   vi ~/script.sh
   ```
   Pegue el siguiente contenido:
   ```
   #!/bin/bash

   # Cambiar al directorio donde se encuentran sus proyectos
   cd ~/chart-app-front/
   # Iniciar una nueva sesión tmux llamada 'dev-session' y ejecutar npm en la primera ventana
   tmux new-session -d -s dev-session 'npm install && npm run dev'

   # Crear una nueva ventana tmux en la misma sesión y ejecutar el servidor de desarrollo de Django
   tmux new-session -d -s dev-session-be 'cd ~/chart-backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000'
   ```

8. **Instale tmux**  
   ```
   sudo apt-get update
   sudo apt-get install -y tmux
   ```

9. **Configure Crontab para Ejecutar el Script al Reiniciar**  
   ```
   crontab -e
   ```
   Agregue esta línea:
   ```
   @reboot ~/script.sh
   ```

## Instancia 2: Solo Backend

1. **Crear Otra Instancia EC2 con Ubuntu**  
   Elija un tipo de instancia que se ajuste a las necesidades de procesamiento del backend.

2. **Conéctese por SSH a la Segunda Instancia**  
   ```
   ssh -i your-key.pem ubuntu@your-second-instance-ip
   ```

3. **Clone el Repositorio del Backend**  
   ```
   git clone <backend-repo-link> ~/chart-backend/
   ```

4. **Configure el Entorno Virtual**  
   ```
   cd ~/chart-backend/
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

5. **Conecte la Instancia EC2 a la Base de Datos RDS**  
   Siga los mismos pasos descritos en la Instancia 1 para conectar la segunda instancia EC2 a la base de datos RDS utilizando AWS EC2 Connect.

6. **Cree un Script de Inicio**  
   ```
   vi /home/ubuntu/startup_script.sh
   ```
   Pegue el siguiente contenido:
   ```
   #!/bin/bash

   # Navegar al directorio del backend
   cd /home/ubuntu/chart-backend || exit

   # Iniciar una nueva sesión tmux y ejecutar la aplicación
   tmux new-session -d -s my_session 'bash -c ". venv/bin/activate; python manage.py run_app; sudo shutdown -h"'
   ```

7. **Configure Crontab para Ejecutar el Script al Reiniciar**  
   ```
   crontab -e
   ```
   Agregue esta línea:
   ```
   @reboot /home/ubuntu/startup_script.sh
   ```

8. **Apague la Segunda Máquina Después de la Ejecución**  
   El script apaga automáticamente la instancia después de ejecutarse. Puede iniciar manualmente la instancia usando la Consola de Administración de AWS o la CLI cuando sea necesario.

9. **Agregue el ID de la Instancia a la Función Lambda**  
   Recupere el ID de la instancia y actualice la función Lambda para incluir el ID de la instancia para su reactivación cuando sea necesario.

## Configuración de Variables de Entorno

El proyecto backend requiere variables de entorno para la configuración de la base de datos y el almacenamiento. Agregue estas variables a `~/.bashrc` o a un archivo `.env`:
```
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=your-db-port
DB_NAME=your-db-name
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_REGION=your-region
```
Ejecute:
```
source ~/.bashrc
```

## Notas Adicionales

### Monitoreo y Registro

- Utilice `tmux ls` para verificar las sesiones tmux en ejecución.
- Utilice `tmux attach -t session_name` para ver una sesión en ejecución.
- Considere configurar AWS CloudWatch para registrar el comportamiento de la aplicación.

### Consideraciones de Seguridad

- Mantenga seguras las llaves SSH y deshabilite la autenticación por contraseña.
- Actualice regularmente los paquetes de la instancia usando `sudo apt update && sudo apt upgrade -y`.
- Restringa el tráfico entrante solo a los puertos necesarios.
- Asegúrese de que las instancias EC2 tengan los roles IAM necesarios para el acceso a la base de datos y a S3.

## Conclusión

Después de completar estos pasos, la Instancia 1 ejecutará la aplicación full-stack de forma continua, mientras que la Instancia 2 ejecutará procesos del backend antes de apagarse. La función Lambda puede reiniciar la Instancia 2 cuando sea necesario. Siguiendo las mejores prácticas para el monitoreo, la seguridad y la automatización, se garantiza una configuración de despliegue confiable y eficiente.

---
