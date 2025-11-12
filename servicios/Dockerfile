# Runtime JRE 17 ligero y mantenido
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
# Ajusta el nombre si tu jar cambia
COPY target/iudigital-1.0.0.jar app.jar

# Tu app corre en 8080 (en tu app.yml tienes server.port: 8080)
EXPOSE 8080

# Mejoras pequeñitas al runtime
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
