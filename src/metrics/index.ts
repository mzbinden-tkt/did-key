const metricPrefix = 'did_service';

// TODO: Implement metric counter with client Datadog
export const incrementMetricCounter = (metric: string, tags?: string[]) => {
  console.debug(`[incrementMetricCounter]  ${metricPrefix}.${metric}, ${tags}`);
};

// TODO: Implement metric counter with client Datadog
export const incrementMetricTimer = (metric: string, value: number, tags?: string[]) => {
  console.debug(`[incrementMetricTimer]  ${metricPrefix}.${metric}, ${value}, ${tags}`);
};
