export type KafkaMessage = {
    topicName: string;
    message: any[];
    key?: string;
    partition?: number;
};
export type KafkaCreateTopicRequest = {
    topic: string;
    retention: number;
    messages: string;
};

export class KafkaResponse {
    public topicName?: string;
    public partition?: number;
    public cursorPosition?: number;
}
