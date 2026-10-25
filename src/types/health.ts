export interface LivenessHealthData {
    status: 'ok';
    uptime: number;
    timestamp: string;
}

export interface ReadinessHealthData {
    status: 'ready' | 'unready';
    checks: {
        configuration: 'ready' | 'failed';
        storage: 'ready' | 'failed';
    };
    timestamp: string;
}
