# ---- build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true
COPY src src
RUN ./gradlew --no-daemon bootJar -x test

# ---- run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Railway 는 사용한 RAM 만큼 과금하는데, 컨테이너 안에서 JVM 이 호스트 전체 메모리를 보고 힙을 크게 잡는다.
# 작은 앱이라 힙 상한을 고정하고, 메모리를 적게 쓰고 빨리 돌려주는 SerialGC 를 쓴다.
# Railway 변수 JAVA_OPTS 로 덮어쓸 수 있다.
ENV JAVA_OPTS="-Xms32m -Xmx160m -Xss512k   -XX:+UseSerialGC -XX:MinHeapFreeRatio=10 -XX:MaxHeapFreeRatio=30   -XX:MaxMetaspaceSize=128m -XX:ReservedCodeCacheSize=32m -XX:TieredStopAtLevel=1   -XX:MaxDirectMemorySize=32m -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
