export type KafkaConfig = {
    kafkaHost: string;
    sslOptions: KafkaSSLOptions;
    sasl: KafkaSaslOptions;
};

export type KafkaSSLOptions = {
    rejectUnauthorized: boolean;
    ca: string[];
};

export type KafkaSaslOptions = {
    mechanism: string;
    username: string;
    password: string;
};
