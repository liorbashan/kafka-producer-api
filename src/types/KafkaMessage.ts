export type KafkaMessage = {
    topicName: string;
    message: any[];
    key?: string;
    partition?: number;
};

export type KafkaResponse = {
    topicName: string;
    partition: number;
    cursorPosition: number;
};
