import { Elysia, t } from "elysia";
import { logger } from "../utils/logger";

// Memory and performance monitoring
const getSystemStats = () => {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage ? process.cpuUsage() : { user: 0, system: 0 };
  
  return {
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
    },
    cpu,
    uptime: process.uptime(),
    timestamp: Date.now(),
  };
};

export const monitoringPlugin = new Elysia({ name: "monitoring" })
  .get("/metrics", () => {
    logger.debug("Metrics endpoint called");
    const stats = getSystemStats();
    
    // Prometheus format
    return [
      `# HELP process_memory_usage_bytes Memory usage in bytes`,
      `# TYPE process_memory_usage_bytes gauge`,
      `process_memory_usage_bytes{type="rss"} ${stats.memory.rss}`,
      `process_memory_usage_bytes{type="heap_total"} ${stats.memory.heapTotal}`,
      `process_memory_usage_bytes{type="heap_used"} ${stats.memory.heapUsed}`,
      `process_memory_usage_bytes{type="external"} ${stats.memory.external}`,
      "",
      `# HELP process_uptime_seconds Process uptime in seconds`,
      `# TYPE process_uptime_seconds gauge`,
      `process_uptime_seconds ${stats.uptime}`,
      "",
      `# HELP process_timestamp Unix timestamp`,
      `# TYPE process_timestamp gauge`,
      `process_timestamp ${stats.timestamp}`,
    ].join("\n");
  })
  .get("/health/ready", () => {
    logger.debug("Readiness check endpoint called");
    return { 
      success: true, 
      data: { status: "ready", timestamp: Date.now() }, 
      error: null 
    };
  })
  .get("/health/live", () => {
    logger.debug("Liveness check endpoint called");
    return { 
      success: true, 
      data: { status: "alive", timestamp: Date.now() }, 
      error: null 
    };
  })
  .get("/health/stats", () => {
    logger.debug("System stats endpoint called");
    return { 
      success: true, 
      data: getSystemStats(), 
      error: null 
    };
  });