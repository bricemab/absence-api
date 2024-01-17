export default {
  isDevModeEnabled: true,
  server: {
    port: 5000,
    hostName: "localhost",
    security: {
      hmacSecretPacketKey: "bgLkjKcXC8Zkgsfr4ftDxxgEnKbj4ZBUjTk6GCqjA6HvQ2eTZT",
      backendTokenSecretKey: "MAReTqRkP9D5g4BQ3gARz6HhU6h2Gsd8HMHfqXjFpf8Xhf3VA2",
      separatorValidationKey: "$$||$$",
      jwtTokenSecretKey: "AAA",
      sessionDurationInMinutes: 60 * 24 * 365 * 5 // 5 ans
    }
  },
  database: {
    host: "localhost",
    user: "root",
    database: "absences",
    password: "SQLadmin",
  }
}
